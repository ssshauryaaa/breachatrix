"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthRedirect({ children }: any) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/login"); // use replace, not push
    }
  }, [user, hydrated]);

  if (!hydrated) return null;

  return user ? children : null;
}