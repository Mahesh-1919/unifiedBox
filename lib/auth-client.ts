"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  session: {
    fetchOnWindowFocus: false,
    refetchInterval: false,
  },
  fetchOptions: {
    onError(context) {
      if (context.response.status === 401) {
        window.location.href = "/login";
      }
    },
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;
