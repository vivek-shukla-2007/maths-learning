"use client";

import type * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Cpu } from "lucide-react";

interface AITutorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  newLevel: number;
}

export function AITutorDialog({ isOpen, onClose, explanation, newLevel }: AITutorDialogProps): React.JSX.Element {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-xl text-primary">
            <Cpu className="mr-2 h-6 w-6" /> AI Tutor Feedback
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base py-2 text-foreground">
            {explanation}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
            <p className="text-md text-center">
                Your next questions will be for numbers up to <span className="font-bold text-accent-foreground">{newLevel}</span>.
            </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="bg-primary hover:bg-primary/90">
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
