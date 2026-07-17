"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getMe } from "@/lib/api";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = `${pathname}${queryString ? `?${queryString}` : ""}`;
    const token = localStorage.getItem("asiance_token");

    // no token => go login
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    // token exists => verify it by calling /members/me
    getMe()
      .then(() => setReady(true))
      .catch(() => {
        localStorage.removeItem("asiance_token");
        router.replace(`/login?redirect=${encodeURIComponent(target)}`);
      });
  }, [router, pathname, queryString]);

  if (!ready) return null; // or return a spinner
  return <>{children}</>;
}
