"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import classes from "./RecipeModal.module.css";
import {
  Modal,
  Button,
  Title,
  Text,
  Group,
  Box,
  Stack,
  ActionIcon,
  Tooltip,
  Divider,
  Menu,
} from "@mantine/core";
import { createClient } from "@/lib/supabase/client";
import {
  IconHeart,
  IconHeartBroken,
  IconShare3,
  IconBookmark,
  IconDots,
} from "@tabler/icons-react";

const supabase = createClient();

interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}

interface RecipeModalProps {
  opened: boolean;
  onClose: () => void;
  id: string;
  title: string;
  image: string;
  cuisine: string | null;
  cookTime: number | null;
  dietaryTags: string[] | null;
}

export default function RecipeModal({
  opened,
  onClose,
  id,
  title,
  image,
  cuisine,
  cookTime,
  dietaryTags,
}: RecipeModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    let cancelled = false;

    async function loadIngredients() {
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("id, name, quantity, unit")
        .eq("recipe_id", id);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Error loading ingredients:", error);
        return;
      }

      setIngredients(data ?? []);
    }

    void loadIngredients();

    return () => {
      cancelled = true;
    };
  }, [opened, id]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      withCloseButton={false}
      padding={0}
      radius="md"
      styles={{
        content: {
          backgroundColor: "#181818",
          color: "white",
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* Hero image */}
      <Box
        pos="relative"
        h={{ base: 260, sm: 350 }}
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0) 40%,
              rgba(24, 24, 24, 1) 100%
            ),
            url(${image})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close recipe preview"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "#181818",
            color: "white",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </Box>

      {/* Recipe title and primary action */}
      <Box
        px={{ base: "md", sm: "xl" }}
        pt={{ base: "md", sm: 0 }}
        pb="md"
        bg="#181818"
      >
        <Stack gap="md">
          <Title order={1} c="white" fz={{ base: 24, sm: 32 }}>
            {title}
          </Title>

          <Button component={Link} href={`/recipes/${id}`} fullWidth>
            View Recipe
          </Button>
        </Stack>
      </Box>

      {/* Recipe information */}
      <Box px={{ base: "md", sm: "xl" }} pb="xl">
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          {/* Left: cuisine, cooking time, dietary tags */}
          <Group gap="sm" wrap="wrap">
            {cuisine && (
              <Text className={classes.recipeMetadata}>{cuisine}</Text>
            )}

            {cookTime !== null && (
              <Text className={classes.recipeMetadata}>{cookTime} min</Text>
            )}

            {dietaryTags?.map((tag) => (
              <Text key={tag} className={classes.recipeMetadata}>
                {tag}
              </Text>
            ))}
          </Group>

          {/* Right: compact reactions and more options */}
          <Group gap={8} wrap="nowrap">
            <Box w={150}>
              <Group
                gap={0}
                wrap="nowrap"
                bg="#292929"
                style={{
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <Tooltip label="I love this">
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    radius={0}
                    style={{ flex: 1, minWidth: 0 }}
                    aria-label="I love this"
                    leftSection={<IconHeart size={16} color="#c75b5b" />}
                  >
                    —
                  </Button>
                </Tooltip>

                <Divider orientation="vertical" color="#555" />

                <Tooltip label="Not for me">
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    radius={0}
                    style={{ flex: 1, minWidth: 0 }}
                    aria-label="Not for me"
                    leftSection={<IconHeartBroken size={16} color="#c75b5b" />}
                  >
                    —
                  </Button>
                </Tooltip>
              </Group>

              {/* Reaction ratio bar */}
              <Tooltip label="No reactions yet">
                <Box mt={4} h={3} bg="#555" style={{ borderRadius: 999 }} />
              </Tooltip>
            </Box>

            {/* Share and Save menu */}
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <Tooltip label="More options">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="md"
                    radius="xl"
                    bg="#292929"
                    aria-label="More options"
                  >
                    <IconDots size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconShare3 size={16} />}
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      `${window.location.origin}/recipes/${id}`,
                    );
                  }}
                >
                  Copy recipe link
                </Menu.Item>

                <Menu.Item leftSection={<IconBookmark size={16} />} disabled>
                  Save recipe
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Ingredients */}
        <Title order={3} mt="xl" c="white">
          Ingredients
        </Title>

        <div style={{ marginTop: 8 }}>
          {ingredients.length > 0 ? (
            ingredients.map((ingredient) => (
              <Text key={ingredient.id} c="gray.3">
                {ingredient.quantity && `${ingredient.quantity} `}
                {ingredient.unit && `${ingredient.unit} `}
                {ingredient.name}
              </Text>
            ))
          ) : (
            <Text c="dimmed">No ingredients available.</Text>
          )}
        </div>
      </Box>
    </Modal>
  );
}
