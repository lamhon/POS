'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryBreakdown } from '@/lib/api/finance/types';
import { formatCurrency } from '@/lib/utils/format';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryDonutChartProps {
  data: CategoryBreakdown[];
}

// Helper to render lucide icon dynamically
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  // Convert standard kebab-case or snake_case to PascalCase
  const pascalName = name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
    
  // @ts-ignore - dynamic access
  const Icon = LucideIcons[pascalName] || LucideIcons.HelpCircle;
  return <Icon className={className} />;
};

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      value: d.amount,
      name: d.categoryName,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
        No expense data available for this period.
      </div>
    );
  }

  // Calculate total for percentage calculation in the custom legend
  const totalExpense = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex flex-col h-[350px] w-full">
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CategoryBreakdown;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: data.color }}
                        >
                          <IconComponent name={data.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-sm">{data.categoryName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{formatCurrency(data.amount)}</span>
                        <span className="text-xs text-muted-foreground">
                          {data.percentage.toFixed(1)}% of total
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-muted-foreground">Total Expense</span>
          <span className="text-lg font-bold">{formatCurrency(totalExpense)}</span>
        </div>
      </div>
      
      {/* Custom Legend */}
      <div className="h-24 overflow-y-auto pr-2 mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.categoryId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <div 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="truncate" title={item.categoryName}>
                {item.categoryName}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-medium">{formatCurrency(item.amount)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
