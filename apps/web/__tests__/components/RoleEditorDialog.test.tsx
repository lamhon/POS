import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoleEditorDialog from '@/app/(dashboard)/admin/roles/_components/RoleEditorDialog';
import * as RolesHooks from '@/lib/api/admin/roles-hooks';

// Mock the hooks
vi.mock('@/lib/api/admin/roles-hooks', () => ({
    useAllPermissions: vi.fn(),
    useRoleById: vi.fn(),
    useCreateRole: vi.fn(),
    useUpdateRole: vi.fn(),
}));

describe('RoleEditorDialog', () => {
    const mockOnClose = vi.fn();
    const mockCreateRole = vi.fn();
    const mockUpdateRole = vi.fn();

    const mockPermissions = [
        {
            module: 'admin',
            resources: [
                {
                    resource: 'user',
                    actions: [
                        { id: '1', action: 'view', description: 'View users' },
                        { id: '2', action: 'create', description: 'Create users' }
                    ]
                }
            ]
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup default hook implementations
        (RolesHooks.useAllPermissions as any).mockReturnValue({
            data: mockPermissions,
            isLoading: false
        });
        
        (RolesHooks.useRoleById as any).mockReturnValue({
            data: undefined,
            isLoading: false
        });

        (RolesHooks.useCreateRole as any).mockReturnValue({
            mutate: mockCreateRole,
            isPending: false
        });

        (RolesHooks.useUpdateRole as any).mockReturnValue({
            mutate: mockUpdateRole,
            isPending: false
        });
    });

    it('renders create mode correctly', () => {
        render(<RoleEditorDialog mode="create" roleId={null} onClose={mockOnClose} />);
        
        expect(screen.getByText('Create New Role')).toBeDefined();
        expect(screen.getByRole('button', { name: 'Create Role' })).toBeDefined();
        // The save button should be disabled initially because name is empty
        expect((screen.getByRole('button', { name: 'Create Role' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('enables save button when name is provided in create mode', () => {
        render(<RoleEditorDialog mode="create" roleId={null} onClose={mockOnClose} />);
        
        const nameInput = screen.getByPlaceholderText('e.g. Content Manager');
        fireEvent.change(nameInput, { target: { value: 'New Role' } });
        
        expect((screen.getByRole('button', { name: 'Create Role' }) as HTMLButtonElement).disabled).toBe(false);
    });

    it('calls createRole with correct payload when saved', async () => {
        render(<RoleEditorDialog mode="create" roleId={null} onClose={mockOnClose} />);
        
        const nameInput = screen.getByPlaceholderText('e.g. Content Manager');
        fireEvent.change(nameInput, { target: { value: 'Test Role' } });
        
        const descInput = screen.getByPlaceholderText("Brief description of this role's purpose");
        fireEvent.change(descInput, { target: { value: 'Test Description' } });
        
        const saveBtn = screen.getByRole('button', { name: 'Create Role' });
        fireEvent.click(saveBtn);
        
        expect(mockCreateRole).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test Role',
                description: 'Test Description',
                permissions: [],
            }),
            expect.any(Object)
        );
    });

    it('renders edit mode with existing data', () => {
        (RolesHooks.useRoleById as any).mockReturnValue({
            data: {
                id: 'role-1',
                name: 'Existing Role',
                description: 'Existing Desc',
                type: 'Custom',
                permissions: [{ permissionId: '1', scope: 'All' }]
            },
            isLoading: false
        });

        render(<RoleEditorDialog mode="edit" roleId="role-1" onClose={mockOnClose} />);
        
        expect(screen.getByText('Edit: Existing Role')).toBeDefined();
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDefined();
        
        // Name should be pre-filled
        const nameInput = screen.getByDisplayValue('Existing Role');
        expect(nameInput).toBeDefined();
        // Because name is not empty, save button should be enabled
        expect((screen.getByRole('button', { name: 'Save Changes' }) as HTMLButtonElement).disabled).toBe(false);
    });

    it('disables name input for system roles', () => {
        (RolesHooks.useRoleById as any).mockReturnValue({
            data: {
                id: 'role-system',
                name: 'System Role',
                description: 'System Desc',
                type: 'System',
                permissions: []
            },
            isLoading: false
        });

        render(<RoleEditorDialog mode="edit" roleId="role-system" onClose={mockOnClose} />);
        
        const nameInput = screen.getByDisplayValue('System Role');
        expect((nameInput as HTMLInputElement).disabled).toBe(true);
        expect(screen.getByText('System role names cannot be changed.')).toBeDefined();
    });

    it('calls updateRole with correct payload when saved', () => {
        (RolesHooks.useRoleById as any).mockReturnValue({
            data: {
                id: 'role-1',
                name: 'Existing Role',
                description: 'Existing Desc',
                type: 'Custom',
                permissions: []
            },
            isLoading: false
        });

        render(<RoleEditorDialog mode="edit" roleId="role-1" onClose={mockOnClose} />);
        
        const descInput = screen.getByDisplayValue('Existing Desc');
        fireEvent.change(descInput, { target: { value: 'Updated Desc' } });
        
        const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
        fireEvent.click(saveBtn);
        
        expect(mockUpdateRole).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'role-1',
                payload: expect.objectContaining({
                    description: 'Updated Desc'
                })
            }),
            expect.any(Object)
        );
    });
});
