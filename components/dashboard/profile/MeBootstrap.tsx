"use client";

import { useEffect } from "react";
import { getMe } from "@/lib/api";
import type { DashboardUser } from "../types";

export function MeBootstrap({ onUser }: { onUser: (u: DashboardUser) => void }) {
  useEffect(() => {
    let mounted = true;
    getMe()
      .then((u) => mounted && onUser(u))
      .catch(() => {
        // ignore or show toast: user not logged in
      });

    return () => {
      mounted = false;
    };
  }, [onUser]);

  return null;
}