import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PermissionMatrix from '../../app/(dashboard)/admin/roles/_components/PermissionMatrix';
import { PermissionGroup, RolePermissionInput } from '@/lib/api/admin/roles-types';

describe('PermissionMatrix', () => {
    const mockGroups: PermissionGroup[] = [
        {
            module: 'admin',
            resources: [
                {
                    resource: 'user',
                    actions: [
                        { id: '1', action: 'view', description: 'View users' },
                        { id: '2', action: 'create', description: 'Create users' }
                    ]
                },
                {
                    resource: 'role',
                    actions: [
                        { id: '3', action: 'view', description: 'View roles' }
                    ]
                }
            ]
        }
    ];

    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no groups provided', () => {
        render(<PermissionMatrix groups={[]} value={[]} onChange={mockOnChange} />);
        expect(screen.getByText('No permissions available')).toBeInTheDocument();
    });

    it('renders modules and resources', () => {
        render(<PermissionMatrix groups={mockGroups} value={[]} onChange={mockOnChange} />);
        
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('user')).toBeInTheDocument();
        expect(screen.getByText('role')).toBeInTheDocument();
        
        // Count actions (2 view, 1 create)
        expect(screen.getAllByText('view')).toHaveLength(2);
        expect(screen.getByText('create')).toBeInTheDocument();
    });

    it('calls onChange with new permission when clicking an ungranted action', () => {
        render(<PermissionMatrix groups={mockGroups} value={[]} onChange={mockOnChange} />);
        
        // Find the 'create' action button
        const createButton = screen.getByRole('button', { name: 'create' });
        fireEvent.click(createButton);
        
        expect(mockOnChange).toHaveBeenCalledWith([{ permissionId: '2', scope: 'All' }]);
    });

    it('calls onChange without permission when clicking a granted action', () => {
        const initialValue: RolePermissionInput[] = [
            { permissionId: '2', scope: 'All' }
        ];
        
        render(<PermissionMatrix groups={mockGroups} value={initialValue} onChange={mockOnChange} />);
        
        // Find the 'create' action button (should have check icon + text)
        const createButton = screen.getByRole('button', { name: 'create' });
        fireEvent.click(createButton);
        
        expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('toggles all permissions for a resource when clicking All', () => {
        render(<PermissionMatrix groups={mockGroups} value={[]} onChange={mockOnChange} />);
        
        // Find the 'All' button for the 'user' resource
        const allButtons = screen.getAllByRole('button', { name: 'All' });
        // The first 'All' button should belong to the 'user' resource based on DOM order
        fireEvent.click(allButtons[0]);
        
        expect(mockOnChange).toHaveBeenCalledWith([
            { permissionId: '1', scope: 'All' },
            { permissionId: '2', scope: 'All' }
        ]);
    });

    it('revokes all permissions for a resource when clicking Revoke all', () => {
        const initialValue: RolePermissionInput[] = [
            { permissionId: '1', scope: 'All' },
            { permissionId: '2', scope: 'All' },
            { permissionId: '3', scope: 'All' }
        ];
        
        render(<PermissionMatrix groups={mockGroups} value={initialValue} onChange={mockOnChange} />);
        
        // Find the 'Revoke all' button for the 'user' resource (which should be the first one, or use specific matching)
        const revokeButtons = screen.getAllByRole('button', { name: 'Revoke all' });
        // Click the revoke all for the 'user' resource
        fireEvent.click(revokeButtons[1]); // The first is module level, second is resource level
        
        expect(mockOnChange).toHaveBeenCalledWith([
            { permissionId: '3', scope: 'All' }
        ]);
    });

    it('changes scope when scope dropdown is used', async () => {
        const initialValue: RolePermissionInput[] = [
            { permissionId: '2', scope: 'All' }
        ];
        
        render(<PermissionMatrix groups={mockGroups} value={initialValue} onChange={mockOnChange} />);
        
        // Find the scope button (it should show 'All')
        const allButtons = screen.getAllByRole('button', { name: 'All' });
        const scopeButton = allButtons.find(b => b.className.includes('text-emerald-400')) || allButtons[0];
        fireEvent.click(scopeButton); // Open dropdown
        
        // Find the 'Department' option in the dropdown and click it
        const departmentOption = await screen.findByText('Department');
        fireEvent.click(departmentOption);
        
        expect(mockOnChange).toHaveBeenCalledWith([
            { permissionId: '2', scope: 'Department' }
        ]);
    });

    it('does not render toggle buttons when readOnly is true', () => {
        render(<PermissionMatrix groups={mockGroups} value={[]} onChange={mockOnChange} readOnly={true} />);
        
        // 'All' buttons for resources and 'Grant all' for modules should not exist
        expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Grant all' })).not.toBeInTheDocument();
        
        // Action cells should still render as buttons but should not call onChange
        const createButton = screen.getByRole('button', { name: 'create' });
        fireEvent.click(createButton);
        
        expect(mockOnChange).not.toHaveBeenCalled();
    });
});
