"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe } from "@/lib/api";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("asiance_token");

    // no token => go login
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // token exists => verify it by calling /members/me
    getMe()
      .then(() => setReady(true))
      .catch(() => {
        localStorage.removeItem("asiance_token");
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });
  }, [router, pathname]);

  if (!ready) return null; // or return a spinner
  return <>{children}</>;
}