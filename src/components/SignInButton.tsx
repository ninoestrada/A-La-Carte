"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionIcon, Box, Loader, Menu, Tooltip } from "@mantine/core";
import { IconChefHat } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import classes from "./SignInButton.module.css";

type AuthProvider = "google" | "github";

interface SignInButtonProps {
  provider: AuthProvider;
}

const supabase = createClient();

export default function SignInButton({ provider }: SignInButtonProps) {
  const router = useRouter();
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
    router.refresh();
  }

  if (loading) {
    return <Loader size="sm" color="gray" />;
  }

  if (!isSignedIn) {
    return (
      <Tooltip label="Sign in">
        <ActionIcon
          variant="subtle"
          color="dark"
          className={classes.chefIcon}
          size="xl"
          aria-label="Sign in"
          onClick={handleSignIn}
        >
          <Box pos="relative" w={28} h={28}>
            <IconChefHat size={28} stroke={1.7} />

            <Box
              pos="absolute"
              top={13}
              left={-2}
              w={32}
              h={2}
              bg="currentColor"
              style={{
                transform: "rotate(-45deg)",
                pointerEvents: "none",
              }}
            />
          </Box>
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Menu position="bottom-end" shadow="md" width={160}>
      <Menu.Target>
        <Tooltip label="Account">
          <ActionIcon
            variant="subtle"
            color="dark"
            className={classes.chefIcon}
            size="xl"
            aria-label="Account menu"
          >
            <IconChefHat size={28} stroke={1.7} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>

        <Menu.Item color="red" onClick={handleSignOut}>
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
