"use client";

import { useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconList, IconPhoto } from "@tabler/icons-react";

import RecipeModal from "./RecipeModal";
import RecipeCarousel from "./RecipeCarousel";
import classes from "./RecipeMenu.module.css";

interface Recipe {
  id: string;
  title: string;
  image_url: string;
  cuisine: string | null;
  cook_time_minutes: number | null;
  dietary_tags: string[] | null;
  estimated_cost?: number | null;
}

interface RecipeSection {
  id: string;
  title: string;
  recipes: Recipe[];
}

type View = "menu" | "gallery";

interface RecipeMenuProps {
  sections: RecipeSection[];
  globalView: View;
  viewOverrides: Record<string, View>;
  onSectionViewChange: (id: string, view: View) => void;
}

const INITIAL_VISIBLE_RECIPES = 3;

function formatEstimatedCost(cost: number | null | undefined) {
  return cost == null ? "—" : `$${Math.round(cost)}`;
}

export default function RecipeMenu({
  sections,
  globalView,
  viewOverrides,
  onSectionViewChange,
}: RecipeMenuProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const getRecipeImage = (recipe: Recipe) => {
    if (recipe.image_url?.startsWith("https://")) {
      return recipe.image_url;
    }

    return recipe.image_url ? `/api/recipes/${recipe.id}/image` : "";
  };

  return (
    <Box className={classes.menu}>
      <Stack gap="xl">
        <Box ta="center">
          <Title order={1} ff="Georgia, serif" fw={400}>
            À La Carte
          </Title>
          <Text size="sm" fs="italic">
            A collection of recipes
          </Text>
          <Text size="xs" mt="xs" c="dimmed">
            Estimated ingredient costs (USD)
          </Text>
        </Box>

        <Divider color="#c9b99d" />

        {sections.map((section) => {
          const sectionView = viewOverrides[section.id] ?? globalView;
          const isExpanded = expandedSections.includes(section.id);

          const visibleRecipes = isExpanded
            ? section.recipes
            : section.recipes.slice(0, INITIAL_VISIBLE_RECIPES);

          return (
            <Box key={section.id}>
              <Group justify="space-between" align="center" mb="md">
                <Box w={72} />

                <Title order={2} ff="Georgia, serif" fw={400} ta="center">
                  {section.title}
                </Title>

                <Group gap={4} w={72} justify="flex-end" wrap="nowrap">
                  <Tooltip label={`${section.title}: Menu view`}>
                    <ActionIcon
                      size="sm"
                      variant={sectionView === "menu" ? "light" : "subtle"}
                      color="dark"
                      aria-label={`${section.title}: Menu view`}
                      aria-pressed={sectionView === "menu"}
                      onClick={() => onSectionViewChange(section.id, "menu")}
                    >
                      <IconList size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label={`${section.title}: Gallery view`}>
                    <ActionIcon
                      size="sm"
                      variant={sectionView === "gallery" ? "light" : "subtle"}
                      color="dark"
                      aria-label={`${section.title}: Gallery view`}
                      aria-pressed={sectionView === "gallery"}
                      onClick={() => onSectionViewChange(section.id, "gallery")}
                    >
                      <IconPhoto size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              {section.recipes.length === 0 ? (
                <Text ta="center" size="sm" c="dimmed">
                  No recipes in this section yet.
                </Text>
              ) : sectionView === "menu" ? (
                <>
                  <Stack gap={2} className={classes.recipeList}>
                    {visibleRecipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        className={classes.recipeRow}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <span className={classes.recipeName}>
                          {recipe.title}
                        </span>
                        <span className={classes.price}>
                          {formatEstimatedCost(recipe.estimated_cost)}
                        </span>
                      </button>
                    ))}
                  </Stack>

                  {section.recipes.length > INITIAL_VISIBLE_RECIPES && (
                    <Box ta="center" mt="md">
                      <Button
                        variant="transparent"
                        color="dark"
                        size="sm"
                        onClick={() => toggleSection(section.id)}
                      >
                        {isExpanded ? "Show less" : "View more"}
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <RecipeCarousel title="" recipes={section.recipes} />
              )}

              <Divider color="#c9b99d" mt="xl" />
            </Box>
          );
        })}
      </Stack>

      {selectedRecipe && (
        <RecipeModal
          opened={true}
          onClose={() => setSelectedRecipe(null)}
          id={selectedRecipe.id}
          title={selectedRecipe.title}
          image={getRecipeImage(selectedRecipe)}
          cuisine={selectedRecipe.cuisine}
          cookTime={selectedRecipe.cook_time_minutes}
          dietaryTags={selectedRecipe.dietary_tags}
        />
      )}
    </Box>
  );
}
