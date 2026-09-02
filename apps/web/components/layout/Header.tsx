'use client';

import { useState } from 'react';
import { Bell, Search, Menu, User, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function Header() {
  const { user, logout } = useAuth();
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center space-x-4 md:hidden">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center flex-1 max-w-md ml-4">
          <div className="relative w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="w-full bg-muted border-border py-1.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-background" />
          </Button>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{user?.displayName || 'User'}</span>
              <span className="text-xs text-muted-foreground">{user?.email || 'email@example.com'}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-medium text-sm hover:ring-2 hover:ring-white/20 transition-all cursor-pointer">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </button>
              } />
              <DropdownMenuContent align="end" className="w-48 bg-background border border-border text-foreground rounded-lg p-1 shadow-lg mt-1">
                <div className="px-2 py-1.5 text-xs border-b border-border mb-1 flex flex-col gap-0.5 md:hidden">
                  <p className="font-semibold text-foreground">{user?.displayName || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'email@example.com'}</p>
                </div>
                <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span>Đổi mật khẩu</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="h-px bg-border my-1" />
                <DropdownMenuItem
                  onClick={() => setIsConfirmLogoutOpen(true)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-md cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={isConfirmLogoutOpen} onOpenChange={setIsConfirmLogoutOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground p-6 rounded-xl">
          <DialogHeader className="gap-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-500/20 text-red-500 mb-2">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold">Sign Out</DialogTitle>
            <DialogDescription className="text-center text-sm text-neutral-400">
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmLogoutOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                setIsConfirmLogoutOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
