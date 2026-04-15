"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <SignIn />
      {showFallback && (
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">Clerk зарежда...</p>
          <p className="text-white/20 text-xs mt-1">
            Ако виждаш празен екран, провери конзолата на браузъра (F12).
          </p>
        </div>
      )}
    </div>
  );
}
