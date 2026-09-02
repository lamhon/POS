'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useUpdateWorkspace, useWorkspaceMembers, useAddWorkspaceMember, useUpdateWorkspaceMemberRole, useRemoveWorkspaceMember, useWorkspaceSettings, useUpdateWorkspaceSettings } from '@/lib/api/tasks/hooks';
import { Workspace, WorkspaceSettings } from '@/lib/api/tasks/types';
import { IconPicker, getCategoryIconComponent } from '@/components/ui/icon-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Settings2, Users, Shield, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const WORKSPACE_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
];

interface WorkspaceSettingsDialogProps {
  workspace: Workspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PermissionsTab({ workspaceId }: { workspaceId: string }) {
  const { data: settings, isLoading } = useWorkspaceSettings(workspaceId);
  const { mutate: updateSettings, isPending } = useUpdateWorkspaceSettings();

  if (isLoading) return <div className="text-sm text-muted-foreground py-4 text-center">Loading permissions...</div>;

  const handleChange = (key: string, value: string) => {
    if (!settings) return;
    updateSettings({ workspaceId, settings: { ...settings, [key]: value } });
  };

  const renderSelect = (label: keyof WorkspaceSettings, title: string) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground">{title}</span>
      <select
        value={settings?.[label] || 'Admin'}
        onChange={e => handleChange(label, e.target.value)}
        disabled={isPending}
        className="h-7 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-white"
      >
        <option value="Everyone">ON (Everyone)</option>
        <option value="Admin">Admin</option>
        <option value="NoOne">OFF (No One)</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-4 bg-muted/10">
        <h3 className="text-sm font-semibold text-foreground mb-4">Workspace Defaults</h3>
        <div className="space-y-1">
          {renderSelect('createPagesPermission', 'Create pages')}
          {renderSelect('createDatabasesPermission', 'Create databases')}
          {renderSelect('createProjectsPermission', 'Create projects')}
          {renderSelect('deleteContentPermission', 'Delete content')}
          {renderSelect('inviteMembersPermission', 'Invite members')}
          {renderSelect('manageSettingsPermission', 'Manage settings')}
          {renderSelect('exportWorkspacePermission', 'Export workspace')}
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-4 bg-muted/10">
        <h3 className="text-sm font-semibold text-foreground mb-1">Resource Overrides</h3>
        <p className="text-xs text-muted-foreground mb-4">Hierarchical overrides (Workspace {'->'} Folder {'->'} Project {'->'} Database {'->'} Task)</p>
        
        <div className="text-center py-6 border border-dashed border-border rounded-lg bg-background">
          <Shield className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Resource selection UI for overrides</p>
          <p className="text-xs text-muted-foreground opacity-70 mt-1">Select a folder or project to assign custom roles (View, Edit, Manage).</p>
          <Button variant="outline" size="sm" className="mt-4" disabled>Add Override</Button>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceSettingsDialog({ workspace, open, onOpenChange }: WorkspaceSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'permissions'>('general');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Viewer');

  const { mutate, isPending } = useUpdateWorkspace();
  const { user: currentUser } = useAuth();

  const { data: members, isLoading: isLoadingMembers } = useWorkspaceMembers(workspace?.id || '');
  const { mutate: addMember, isPending: isAddingMember } = useAddWorkspaceMember();
  const { mutate: updateRole } = useUpdateWorkspaceMemberRole();
  const { mutate: removeMember } = useRemoveWorkspaceMember();

  const currentUserMember = members?.find(m => m.userId === currentUser?.id);
  const currentUserRole = currentUserMember?.role || 'Viewer';
  const canManageMembers = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  useEffect(() => {
    if (workspace && open) {
      setName(workspace.name);
      setDescription(workspace.description || '');
      setIcon(workspace.icon || '');
      setColor(workspace.color || '');
      setActiveTab('general');
    }
  }, [workspace, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace) return;
    
    mutate({
      id: workspace.id,
      payload: {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon || undefined,
        color: color || undefined
      }
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !workspace) return;
    addMember({ workspaceId: workspace.id, email: newMemberEmail.trim(), role: newMemberRole }, {
      onSuccess: () => {
        setNewMemberEmail('');
        setNewMemberRole('Viewer');
      }
    });
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    if (!workspace) return;
    updateRole({ workspaceId: workspace.id, userId, role: newRole });
  };

  const handleRemoveMember = (userId: string) => {
    if (!workspace) return;
    removeMember({ workspaceId: workspace.id, userId });
  };

  const SelectedIconComp = getCategoryIconComponent(icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] p-0 bg-background border-border text-foreground overflow-hidden flex gap-0 h-[520px]">
        {/* Left Sidebar */}
        <div className="w-56 bg-muted border-r border-border flex flex-col p-4 space-y-2">
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace Settings</h2>
          </div>
          
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left cursor-pointer",
              activeTab === 'general' ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Settings2 className="w-4 h-4" />
            General
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left cursor-pointer",
              activeTab === 'members' ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Users className="w-4 h-4" />
            Members & Access
          </button>
          
          <button
            onClick={() => setActiveTab('permissions')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left cursor-pointer",
              activeTab === 'permissions' ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Shield className="w-4 h-4" />
            Permissions
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-background">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {activeTab === 'general' && 'General Settings'}
              {activeTab === 'members' && 'Members & Access'}
              {activeTab === 'permissions' && 'Workspace Permissions'}
            </DialogTitle>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === 'general' && workspace && (
              <form id="workspace-settings-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Visual Preview Banner */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/50 shadow-inner">
                   <div 
                     className="w-12 h-12 rounded-lg flex items-center justify-center bg-background shadow-sm border border-border/50 flex-shrink-0 transition-colors duration-300"
                     style={{ color: color || undefined }}
                   >
                     {SelectedIconComp ? (
                       <SelectedIconComp className="w-6 h-6" />
                     ) : (
                       <span className="text-xl">{icon || '📁'}</span>
                     )}
                   </div>
                   <div className="flex-1 truncate">
                     <h3 className="font-medium text-lg leading-tight truncate">{name || 'Workspace Name'}</h3>
                     <p className="text-xs text-muted-foreground mt-0.5 truncate">{description || 'No description provided.'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs text-muted-foreground font-medium">Workspace Name</Label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-muted border-border focus-visible:ring-1"
                        placeholder="e.g. Personal, Work..."
                        disabled={workspace.isArchived}
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs text-muted-foreground font-medium">Description</Label>
                      <Input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="bg-muted border-border focus-visible:ring-1"
                        placeholder="What is this workspace for?"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Workspace Icon</Label>
                      <IconPicker
                        value={icon}
                        onChange={setIcon}
                        className="bg-muted border-border h-10 hover:bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Accent Color</Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {WORKSPACE_COLORS.map(c => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setColor(c.value)}
                            className={cn(
                              "w-6 h-6 rounded-full cursor-pointer transition-all border-2",
                              color === c.value ? "border-white scale-110 shadow-sm" : "border-transparent hover:scale-110"
                            )}
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                          />
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={color || '#ffffff'}
                            onChange={(e) => setColor(e.target.value)}
                            className="absolute opacity-0 w-full h-full cursor-pointer inset-0 z-10"
                            title="Custom Color"
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-border bg-muted flex items-center justify-center overflow-hidden transition-all hover:scale-110"
                            style={color && !WORKSPACE_COLORS.some(c => c.value === color) ? { backgroundColor: color, borderColor: 'white' } : {}}
                          >
                             <span className="text-[10px] bg-clip-text text-transparent bg-gradient-to-tr from-purple-400 to-pink-500 font-bold">+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 border border-border rounded-lg p-3 mt-4">
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Created</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(workspace.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {workspace.updatedAt && (
                      <div className="flex justify-between items-center">
                        <span>Last modified</span>
                        <span className="font-medium text-foreground">
                          {format(new Date(workspace.updatedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </form>
            )}

            {activeTab === 'members' && workspace && (
              <div className="space-y-6">
                {/* Add Member Section */}
                {canManageMembers && (
                  <form onSubmit={handleAddMember} className="flex items-end gap-3 p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Invite User by Email</Label>
                      <Input
                        type="email"
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="bg-background border-border"
                        required
                      />
                    </div>
                    <div className="w-32 space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Role</Label>
                      <select
                        value={newMemberRole}
                        onChange={e => setNewMemberRole(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-white"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Commentor">Commentor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                    <Button type="submit" disabled={isAddingMember || !newMemberEmail.trim()} className="gap-2 shrink-0">
                      <UserPlus className="w-4 h-4" />
                      Add
                    </Button>
                  </form>
                )}

                {/* Members List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Workspace Members</h3>
                  {isLoadingMembers ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading members...</div>
                  ) : members?.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">No members found.</div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden divide-y divide-neutral-800/50 bg-muted/20">
                      {members?.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground">
                              {member.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                {member.displayName}
                                {member.userId === currentUser?.id && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">You</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {canManageMembers && member.role !== 'Owner' ? (
                              <select
                                value={member.role}
                                onChange={e => handleUpdateRole(member.userId, e.target.value)}
                                className="h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-white"
                              >
                                <option value="Admin">Admin</option>
                                <option value="Editor">Editor</option>
                                <option value="Commentor">Commentor</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            ) : (
                              <span className="text-xs font-medium text-muted-foreground px-2">{member.role}</span>
                            )}

                            {canManageMembers && member.role !== 'Owner' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
                                onClick={() => handleRemoveMember(member.userId)}
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && workspace && (
              <PermissionsTab workspaceId={workspace.id} />
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {activeTab === 'members' ? 'Close' : 'Cancel'}
            </Button>
            {activeTab === 'general' && (
              <Button 
                type="submit" 
                form="workspace-settings-form"
                disabled={isPending || !name.trim()}
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
