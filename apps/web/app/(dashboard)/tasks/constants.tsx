import React from 'react';
import { Circle, Clock, CheckCircle2, AlertCircle, Flame, ArrowUpCircle, Minus, ChevronDown } from 'lucide-react';

export const PRIORITY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'Urgent': { label: 'Urgent', icon: <Flame className="h-3 w-3" />, color: 'text-red-500 bg-red-500/10' },
  'High': { label: 'High', icon: <ArrowUpCircle className="h-3 w-3" />, color: 'text-orange-500 bg-orange-500/10' },
  'Medium': { label: 'Medium', icon: <Minus className="h-3 w-3" />, color: 'text-yellow-500 bg-yellow-500/10' },
  'Low': { label: 'Low', icon: <ChevronDown className="h-3 w-3" />, color: 'text-blue-400 bg-blue-400/10' },
  'None': { label: 'None', icon: <Minus className="h-3 w-3" />, color: 'text-neutral-500 bg-neutral-500/10' },
};

export const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  'Todo': { icon: <Circle className="h-4 w-4" />, color: 'text-neutral-400' },
  'In Progress': { icon: <Clock className="h-4 w-4" />, color: 'text-blue-400' },
  'Done': { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-500' },
  'Blocked': { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-400' },
  'Cancelled': { icon: <Circle className="h-4 w-4" />, color: 'text-neutral-600 line-through' },
};
