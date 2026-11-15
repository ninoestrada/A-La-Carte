"use client";

import { Group } from "@mantine/core";
import Link from "next/link";
import RecipeSearch from "./RecipeSearch";
import SignInButton from "@/components/SignInButton";
import { cormorant } from "@/lib/fonts";
import classes from "./Navbar.module.css";

interface NavbarProps {
  search: string;
  setSearch: (value: string) => void;
  searchOpened: boolean;
  setSearchOpened: (value: boolean) => void;
  onCreateRecipe: () => void;
}

export default function Navbar({
  search,
  setSearch,
  searchOpened,
  setSearchOpened,
  onCreateRecipe,
}: NavbarProps) {
  return (
    <nav aria-label="Main navigation" className={classes.navbar}>
      <Group justify="space-between" align="center" gap="md">
        <Link
          href="/recipes/new"
          onClick={(event) => {
            event.preventDefault();
            onCreateRecipe();
          }}
          className={`${cormorant.className} ${classes.createRecipe}`}
        >
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
