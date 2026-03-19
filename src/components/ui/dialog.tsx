"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Popup
          className={cn(
            "w-full max-w-2xl rounded-xl border border-cream-border bg-home-page p-5 shadow-xl outline-none",
            className
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </div>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogFooter,
};
