'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRightLeft } from 'lucide-react';
import { CreateTransferForm } from './CreateTransferForm';

export function AddTransferDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        Transfer
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
        </DialogHeader>
        <CreateTransferForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
