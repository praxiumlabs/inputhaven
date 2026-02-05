import { SessionProvider } from "next-auth/react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4">
        <div className="mb-8">
          <Logo />
        </div>
        {children}
      </div>
    </SessionProvider>
  );
}
