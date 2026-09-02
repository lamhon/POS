'use client';

import * as React from 'react';
import {
  Banknote, Wallet, CreditCard, Coins, PiggyBank, TrendingUp, TrendingDown, DollarSign, Receipt, Landmark, Briefcase,
  Utensils, Coffee, Pizza, Wine, Beer, Apple, ShoppingBasket, Cake,
  Home, Zap, Droplets, Flame, Wifi, Tv, Wrench, Hammer, Bed, Key,
  Car, Fuel, Bus, Train, Plane, Bike, MapPin, Navigation,
  ShoppingBag, ShoppingCart, Gift, Tag, Shirt, Watch, Smartphone, Laptop, Headphones, Package,
  HeartPulse, Pill, Dumbbell, Stethoscope, Smile, Activity, ShieldCheck,
  Film, Music, Gamepad2, BookOpen, GraduationCap, Camera, Ticket, Trophy,
  Folder, Star, Sparkles, Shield, HelpCircle, Heart,
  Users, Palette, Scissors, Baby, Dog, Cat,
  Search, Check, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface IconItem {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const CATEGORY_ICONS: IconItem[] = [
  // Finance & Money
  { name: 'banknote', label: 'Banknote', icon: Banknote },
  { name: 'wallet', label: 'Wallet', icon: Wallet },
  { name: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { name: 'coins', label: 'Coins', icon: Coins },
  { name: 'piggy-bank', label: 'Piggy Bank', icon: PiggyBank },
  { name: 'trending-up', label: 'Trending Up', icon: TrendingUp },
  { name: 'trending-down', label: 'Trending Down', icon: TrendingDown },
  { name: 'dollar-sign', label: 'Dollar', icon: DollarSign },
  { name: 'receipt', label: 'Receipt', icon: Receipt },
  { name: 'landmark', label: 'Bank / Landmark', icon: Landmark },
  { name: 'briefcase', label: 'Salary / Work', icon: Briefcase },

  // Food & Dining
  { name: 'utensils', label: 'Food & Dining', icon: Utensils },
  { name: 'coffee', label: 'Coffee & Drinks', icon: Coffee },
  { name: 'pizza', label: 'Pizza & Fast Food', icon: Pizza },
  { name: 'wine', label: 'Bar & Alcohol', icon: Wine },
  { name: 'beer', label: 'Beer', icon: Beer },
  { name: 'apple', label: 'Groceries / Fruit', icon: Apple },
  { name: 'shopping-basket', label: 'Supermarket', icon: ShoppingBasket },
  { name: 'cake', label: 'Bakery / Cake', icon: Cake },

  // Housing & Utilities
  { name: 'home', label: 'Housing / Rent', icon: Home },
  { name: 'zap', label: 'Electricity / Bills', icon: Zap },
  { name: 'droplets', label: 'Water', icon: Droplets },
  { name: 'flame', label: 'Gas / Heating', icon: Flame },
  { name: 'wifi', label: 'Internet', icon: Wifi },
  { name: 'tv', label: 'Cable / TV', icon: Tv },
  { name: 'wrench', label: 'Repairs', icon: Wrench },
  { name: 'hammer', label: 'Maintenance', icon: Hammer },
  { name: 'bed', label: 'Hotel / Lodging', icon: Bed },
  { name: 'key', label: 'Key / Rent', icon: Key },

  // Transportation & Travel
  { name: 'car', label: 'Car / Vehicle', icon: Car },
  { name: 'fuel', label: 'Fuel / Gas', icon: Fuel },
  { name: 'bus', label: 'Bus / Transit', icon: Bus },
  { name: 'train', label: 'Train / Metro', icon: Train },
  { name: 'plane', label: 'Flight / Travel', icon: Plane },
  { name: 'bike', label: 'Bicycle', icon: Bike },
  { name: 'map-pin', label: 'Location', icon: MapPin },
  { name: 'navigation', label: 'Navigation', icon: Navigation },

  // Shopping & Goods
  { name: 'shopping-bag', label: 'Shopping Bag', icon: ShoppingBag },
  { name: 'shopping-cart', label: 'Shopping Cart', icon: ShoppingCart },
  { name: 'gift', label: 'Gifts & Donations', icon: Gift },
  { name: 'tag', label: 'Discounts / Sales', icon: Tag },
  { name: 'shirt', label: 'Clothing', icon: Shirt },
  { name: 'watch', label: 'Jewelry / Watch', icon: Watch },
  { name: 'smartphone', label: 'Phone / Mobile', icon: Smartphone },
  { name: 'laptop', label: 'Electronics / Laptop', icon: Laptop },
  { name: 'headphones', label: 'Audio / Gadgets', icon: Headphones },
  { name: 'package', label: 'Delivery / Shipping', icon: Package },

  // Health & Fitness
  { name: 'heart-pulse', label: 'Health & Medical', icon: HeartPulse },
  { name: 'pill', label: 'Pharmacy / Medicine', icon: Pill },
  { name: 'dumbbell', label: 'Fitness & Gym', icon: Dumbbell },
  { name: 'stethoscope', label: 'Doctor / Clinic', icon: Stethoscope },
  { name: 'smile', label: 'Personal Care', icon: Smile },
  { name: 'activity', label: 'Wellness', icon: Activity },

  // Entertainment & Education
  { name: 'film', label: 'Movies & Cinema', icon: Film },
  { name: 'music', label: 'Music & Streaming', icon: Music },
  { name: 'gamepad-2', label: 'Gaming', icon: Gamepad2 },
  { name: 'book-open', label: 'Books & Reading', icon: BookOpen },
  { name: 'graduation-cap', label: 'Education / Tuition', icon: GraduationCap },
  { name: 'camera', label: 'Photography', icon: Camera },
  { name: 'ticket', label: 'Events & Tickets', icon: Ticket },
  { name: 'trophy', label: 'Sports & Awards', icon: Trophy },

  // Lifestyle, Pets & Family
  { name: 'baby', label: 'Baby & Kids', icon: Baby },
  { name: 'dog', label: 'Pet (Dog)', icon: Dog },
  { name: 'cat', label: 'Pet (Cat)', icon: Cat },
  { name: 'palette', label: 'Art & Hobbies', icon: Palette },
  { name: 'scissors', label: 'Beauty / Haircut', icon: Scissors },
  { name: 'users', label: 'Family & Friends', icon: Users },
  { name: 'heart', label: 'Love & Charity', icon: Heart },

  // General & Others
  { name: 'folder', label: 'General Folder', icon: Folder },
  { name: 'star', label: 'Special / Favorite', icon: Star },
  { name: 'sparkles', label: 'Rewards / Bonus', icon: Sparkles },
  { name: 'shield', label: 'Insurance / Protection', icon: Shield },
  { name: 'shield-check', label: 'Verified', icon: ShieldCheck },
  { name: 'help-circle', label: 'Others / Uncategorized', icon: HelpCircle },
];

export function getCategoryIconComponent(iconName?: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null {
  if (!iconName) return null;
  const found = CATEGORY_ICONS.find((item) => item.name === iconName);
  return found ? found.icon : null;
}

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredIcons = React.useMemo(() => {
    if (!search.trim()) return CATEGORY_ICONS;
    const q = search.toLowerCase();
    return CATEGORY_ICONS.filter(
      (item) => item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedIcon = React.useMemo(() => {
    return CATEGORY_ICONS.find((item) => item.name === value);
  }, [value]);

  const SelectedIconComponent = selectedIcon?.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
              className
            )}
          />
        }
      >
        <div className="flex items-center gap-2 truncate">
          {SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{selectedIcon.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select icon</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-1" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-6 gap-1 max-h-56 overflow-y-auto p-1 border rounded-md">
            {filteredIcons.map((item) => {
              const IconComp = item.icon;
              const isSelected = item.name === value;
              return (
                <button
                  key={item.name}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    onChange(item.name);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors relative cursor-pointer group',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium'
                  )}
                >
                  <IconComp className="h-5 w-5" />
                  {isSelected && (
                    <span className="absolute top-0.5 right-0.5 flex h-2 w-2 items-center justify-center">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-6 py-6 text-center text-xs text-muted-foreground">
                No icons found
              </div>
            )}
          </div>

          {value && (
            <div className="flex justify-end pt-1 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                Remove icon
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
