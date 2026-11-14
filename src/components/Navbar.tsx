"use client";

import { Group } from "@mantine/core";
import Link from "next/link";
import RecipeSearch from "./RecipeSearch";
import SignInButton from "@/components/SignInButton";
import classes from "./Navbar.module.css";

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
    <nav aria-label="Main navigation" className={classes.navbar}>
      <Group justify="space-between" align="center" gap="md">
        <Link href="/recipes/new" className={classes.createRecipe}>
          Create Recipe
        </Link>

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
