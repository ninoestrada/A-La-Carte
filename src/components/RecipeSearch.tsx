"use client";

import { ActionIcon, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

interface RecipeSearchProps {
  search: string;
  setSearch: (value: string) => void;
  opened: boolean;
  setOpened: (value: boolean) => void;
}

export default function RecipeSearch({
  search,
  setSearch,
  opened,
  setOpened,
}: RecipeSearchProps) {
  function closeSearch() {
    setSearch("");
    setOpened(false);
  }

  if (!opened) {
    return (
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        aria-label="Open search"
        onClick={() => setOpened(true)}
      >
        <IconSearch size={24} />
      </ActionIcon>
    );
  }

  return (
    <TextInput
      autoFocus
      value={search}
      onChange={(event) => setSearch(event.currentTarget.value)}
      placeholder="Search recipes..."
      leftSection={<IconSearch size={20} />}
      rightSection={
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Close search"
          onClick={closeSearch}
        >
          <IconX size={18} />
        </ActionIcon>
      }
      w={300}
    />
  );
}
