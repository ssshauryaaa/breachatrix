"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function AuthRedirect({ children }: Props) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          credentials: "include", // send cookie
        });

        if (res.ok) {
          // user is logged in → redirect
          router.push("/dashboard");
        }
        // if not ok (401 or 403), user is not logged in → stay on page
      } catch (err) {
        // network error → stay on page
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
