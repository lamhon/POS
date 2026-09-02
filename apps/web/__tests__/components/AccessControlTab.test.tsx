import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessControlTab from '@/app/(dashboard)/admin/users/[id]/AccessControlTab';
import * as RolesHooks from '@/lib/api/admin/roles-hooks';

// Mock the hooks
vi.mock('@/lib/api/admin/roles-hooks', () => ({
    useRoles: vi.fn(),
    useAssignUserRoles: vi.fn(),
    useUserEffectivePermissions: vi.fn(),
}));

describe('AccessControlTab', () => {
    const mockUserId = 'user-123';
    const mockAssignRoles = vi.fn();

    const mockRolesPage = {
        items: [
            { id: 'role-1', name: 'Admin', type: 'System' },
            { id: 'role-2', name: 'Editor', type: 'Custom' }
        ],
        totalCount: 2
    };

    const mockEffectivePerms = [
        {
            module: 'content',
            resource: 'post',
            action: 'create',
            scope: 'All'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        
        (RolesHooks.useRoles as any).mockReturnValue({
            data: mockRolesPage,
            isLoading: false
        });

        (RolesHooks.useUserEffectivePermissions as any).mockReturnValue({
            data: mockEffectivePerms,
            isLoading: false
        });

        (RolesHooks.useAssignUserRoles as any).mockReturnValue({
            mutate: mockAssignRoles,
            isPending: false
        });
    });

    it('renders roles list and effective permissions', () => {
        render(<AccessControlTab userId={mockUserId} />);
        
        expect(screen.getByText('Assigned Roles')).toBeDefined();
        expect(screen.getByText('Admin')).toBeDefined();
        expect(screen.getByText('Editor')).toBeDefined();
        
        expect(screen.getByText('Effective Permissions')).toBeDefined();
        expect(screen.getByText('content')).toBeDefined(); // Module name
        expect(screen.getByText('post')).toBeDefined(); // Resource name
        expect(screen.getByText('create')).toBeDefined(); // Action name
    });

    it('shows loading state when roles are loading', () => {
        (RolesHooks.useRoles as any).mockReturnValue({
            data: undefined,
            isLoading: true
        });

        render(<AccessControlTab userId={mockUserId} />);
        
        expect(screen.getByText('Loading roles...')).toBeDefined();
    });

    it('shows loading state when permissions are loading', () => {
        (RolesHooks.useUserEffectivePermissions as any).mockReturnValue({
            data: undefined,
            isLoading: true
        });

        const { container } = render(<AccessControlTab userId={mockUserId} />);
        
        // Effective permissions section loading spinner (a generic div with animate-spin)
        // Since we didn't add a specific text for this loading state, we check if the permissions are NOT rendered
        expect(screen.queryByText('content')).toBeNull();
    });

    it('calls assignRoles when save button is clicked', async () => {
        const user = userEvent.setup();
        render(<AccessControlTab userId={mockUserId} />);
        
        // Select the "Editor" role checkbox (role-2)
        const checkboxes = screen.getAllByRole('checkbox');
        // Editor is the second one
        await user.click(checkboxes[1]);
        
        const saveBtn = screen.getByRole('button', { name: 'Save' });
        await user.click(saveBtn);
        
        expect(mockAssignRoles).toHaveBeenCalledWith({
            userId: mockUserId,
            roleIds: ['role-2']
        });
    });

    it('toggles multiple roles selection', async () => {
        const user = userEvent.setup();
        render(<AccessControlTab userId={mockUserId} />);
        
        const checkboxes = screen.getAllByRole('checkbox');
        
        // Click both checkboxes
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        
        const saveBtn = screen.getByRole('button', { name: 'Save' });
        await user.click(saveBtn);
        
        expect(mockAssignRoles).toHaveBeenCalledWith({
            userId: mockUserId,
            roleIds: ['role-1', 'role-2']
        });
    });
});
