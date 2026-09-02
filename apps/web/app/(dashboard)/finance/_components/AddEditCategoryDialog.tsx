'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCategory, useUpdateCategory } from '@/lib/api/finance/hooks';
import { Category, CategoryType } from '@/lib/api/finance/types';
import { IconPicker } from '@/components/ui/icon-picker';

const categorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  type: z.coerce.number().min(0).max(1),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface AddEditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSuccess?: (categoryId: string) => void;
  defaultType?: number;
}

export function AddEditCategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess: onSaveSuccess,
  defaultType,
}: AddEditCategoryDialogProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isEdit = !!categoryToEdit;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      type: defaultType !== undefined ? defaultType : 1, // Default Expense
      icon: '',
      color: '#000000',
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && categoryToEdit) {
        form.reset({
          name: categoryToEdit.name,
          type: categoryToEdit.type,
          icon: categoryToEdit.icon || '',
          color: categoryToEdit.color || '#000000',
        });
      } else {
        form.reset({
          name: '',
          type: defaultType !== undefined ? defaultType : 1,
          icon: '',
          color: '#000000',
        });
      }
    }
  }, [open, isEdit, categoryToEdit, form, defaultType]);

  function onSubmit(data: CategoryFormValues) {
    if (isEdit && categoryToEdit) {
      updateCategory.mutate(
        {
          id: categoryToEdit.id,
          name: data.name,
          type: data.type as CategoryType,
          icon: data.icon,
          color: data.color,
        },
        {
          onSuccess: (res) => {
            toast.success('Category updated successfully');
            if (onSaveSuccess) onSaveSuccess(res.id);
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to update category');
          },
        }
      );
    } else {
      createCategory.mutate(
        {
          name: data.name,
          type: data.type as CategoryType,
          icon: data.icon,
          color: data.color,
        },
        {
          onSuccess: (res) => {
            toast.success('Category created successfully');
            if (onSaveSuccess) onSaveSuccess(res.id);
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to create category');
          },
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value?.toString() ?? ''}
                    items={[
                      { value: '0', label: 'Income' },
                      { value: '1', label: 'Expense' },
                    ]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Income</SelectItem>
                      <SelectItem value="1">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <IconPicker
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...field} />
                        <Input placeholder="#000000" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {(createCategory.isPending || updateCategory.isPending) ? 'Saving...' : 'Save Category'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
