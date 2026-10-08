"use client";

import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { createClient } from "@/lib/supabase/client";

type AuthProvider = "google" | "github";

interface SignInButtonProps {
  provider: AuthProvider;
}

const supabase = createClient();

export default function SignInButton({ provider }: SignInButtonProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check whether the user already has a session.
    async function checkSession() {
      const { data } = await supabase.auth.getUser();

      setIsSignedIn(!!data.user);
      setLoading(false);
    }

    void checkSession();

    // Listen for sign-in and sign-out events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Sign-in failed:", error.message);
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out failed:", error.message);
      return;
    }

    setIsSignedIn(false);
  }

  return (
    <Button
      variant="subtle"
      color="gray"
      size="sm"
      radius="sm"
      loading={loading}
      onClick={isSignedIn ? handleSignOut : handleSignIn}
      styles={{
        root: {
          backgroundColor: "#292929",
          color: "#ffffff",
          fontWeight: 500,
          whiteSpace: "nowrap",
        },
      }}
    >
      {isSignedIn ? "Sign Out" : "Sign In"}
    </Button>
  );
}
