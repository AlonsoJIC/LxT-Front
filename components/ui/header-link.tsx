import Link from "next/link";
import { ReactNode } from "react";

export function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      tabIndex={-1}
      className="focus:outline-none"
    >
      {children}
    </Link>
  );
}
