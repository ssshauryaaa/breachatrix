"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthRedirect({ children }: any) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);

  // ✅ Wait for Zustand to hydrate
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // In case already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  // ✅ Only redirect AFTER hydration
  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/login");
    }
  }, [hydrated, user]);

  // 🚨 BLOCK rendering until hydration is done
  if (!hydrated) return null;

  // 🚨 If no user AFTER hydration → block
  if (!user) return null;

  return children;
}