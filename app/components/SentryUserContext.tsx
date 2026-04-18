"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";

export default function SentryUserContext() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user, isLoaded]);

  return null;
}
