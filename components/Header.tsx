import { ReactNode } from "react";

export function Header({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background z-50 pt-20">
      <div className="p-4 absolute left-0">{left}</div>
      <div className="p-4 absolute right-0">{right}</div>
    </header>
  );
}
