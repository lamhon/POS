import {
  LayoutDashboard,
  Wallet,
  Users,
  Dumbbell,
  Book,
  CheckSquare,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: Wallet,
  },
  {
    title: 'Personnel',
    href: '/personnel',
    icon: Users,
  },
  {
    title: 'Training',
    href: '/training',
    icon: Dumbbell,
  },
  {
    title: 'Manual',
    href: '/manual',
    icon: Book,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Admin Portal',
    href: '/admin/users',
    icon: ShieldCheck,
  },
];
