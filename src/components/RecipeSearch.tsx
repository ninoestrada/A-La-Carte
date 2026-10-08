"use client";

import { useEffect, useRef } from "react";
import { ActionIcon, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import classes from "./RecipeSearch.module.css";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function closeSearch() {
    setSearch("");
    setOpened(false);
  }

  useEffect(() => {
    if (opened) {
      inputRef.current?.focus();
    }
  }, [opened]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        opened &&
        !search.trim() &&
        !containerRef.current?.contains(event.target as Node)
      ) {
        setOpened(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [opened, search, setOpened]);

  return (
    <div className={classes.search} ref={containerRef}>
      <div className={`${classes.searchBox} ${opened ? classes.open : ""}`}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size={40}
          className={classes.searchIcon}
          aria-label={opened ? "Close search" : "Open search"}
          onClick={() => {
            if (opened) {
              closeSearch();
            } else {
              setOpened(true);
            }
          }}
        >
          <IconSearch size={26} stroke={2} />
        </ActionIcon>

        <div
          className={classes.inputWrapper}
          aria-hidden={!opened}
          inert={!opened}
        >
          <TextInput
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeSearch();
              }
            }}
            placeholder="Search recipes..."
            variant="unstyled"
            rightSection={
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Clear and close search"
                onClick={closeSearch}
              >
                <IconX size={18} />
              </ActionIcon>
            }
            className={classes.input}
          />
        </div>
      </div>
    </div>
  );
}
