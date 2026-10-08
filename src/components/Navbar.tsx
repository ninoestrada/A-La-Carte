"use client";

import { Group, Title } from "@mantine/core";
import RecipeSearch from "./RecipeSearch";

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
        <Title order={2} c="white">
          À La Carte
        </Title>

        <RecipeSearch
          search={search}
          setSearch={setSearch}
          opened={searchOpened}
          setOpened={setSearchOpened}
        />
      </Group>
    </nav>
  );
}
