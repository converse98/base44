import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ErrorDialog({ title, message, onRetry, onClose }) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Error"}</AlertDialogTitle>
          <AlertDialogDescription>
            {message || "Ha ocurrido un error inesperado."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onRetry && (
            <Button variant="outline" onClick={() => { onRetry(); onClose(); }}>
              Reintentar
            </Button>
          )}
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}