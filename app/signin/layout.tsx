import { ReactNode } from "react";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center items-center">
      <main className="flex grow flex-col">{children}</main>
      <footer className="fixed bottom-0 p-4 w-full">
        <p>welcome to my equivalent of apple notes</p>
        <p>hope you like</p>
      </footer>
    </div>
  );
}
