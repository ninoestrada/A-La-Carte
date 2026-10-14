"use client";

import { Button, Group, Title } from "@mantine/core";
import Link from "next/link";
import RecipeSearch from "./RecipeSearch";
import SignInButton from "@/components/SignInButton";

interface NavbarProps {
  search: string;
  setSearch: (value: string) => void;
  searchOpened: boolean;
  setSearchOpened: (value: boolean) => void;
}

export default function Navbar({
  search,
  setSearch,
  searchOpened,
  setSearchOpened,
}: NavbarProps) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#0f0f0f",
        padding: "16px 32px",
      }}
    >
      <Group justify="space-between">
        <Group gap="xl" align="center">
          <Title order={2} c="white">
            À La Carte
          </Title>

          <Button
            component={Link}
            href="/recipes/new"
            variant="subtle"
            color="gray"
          >
            Create Recipe
          </Button>
        </Group>

        <Group gap="xs" align="center" wrap="nowrap">
          <RecipeSearch
            search={search}
            setSearch={setSearch}
            opened={searchOpened}
            setOpened={setSearchOpened}
          />

          <SignInButton provider="google" />
        </Group>
      </Group>
    </nav>
  );
}
