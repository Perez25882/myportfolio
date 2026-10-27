"use client";

import { useUiStore } from "@/store/ui";

interface ContactButtonProps {
  readonly className?: string;
  readonly label?: string;
}

export function ContactButton({ className, label = "Contact" }: ContactButtonProps) {
  const openContact = useUiStore((state) => state.openContact);
  return (
    <button type="button" className={className} aria-haspopup="dialog" onClick={openContact}>
      {label}
    </button>
  );
}
