import Link from "next/link";
import { ReactNode } from "react";

export function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="transition-colors hover:text-primary font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded px-1"
    >
      {children}
    </Link>
  );
}
