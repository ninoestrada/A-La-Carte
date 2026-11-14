"use client";

import { useState } from "react";
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconList,
  IconPhoto,
} from "@tabler/icons-react";
import FullRecipeModal from "./FullRecipeModal";
import RecipeModal from "./RecipeModal";
import RecipeCarousel from "./RecipeCarousel";
import classes from "./RecipeMenu.module.css";
import Footer from "./Footer";
import { Great_Vibes, Cormorant_Garamond } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

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
  onGlobalViewChange: (view: View) => void;
  onSectionViewChange: (id: string, view: View) => void;
  navigation: React.ReactNode;
  searchQuery: string;
  searchResults: Recipe[];
}

const RECIPES_PER_PAGE = 5;

function formatEstimatedCost(cost: number | null | undefined) {
  return cost == null ? "—" : `$${Math.round(cost)}`;
}

export default function RecipeMenu({
  sections,
  globalView,
  viewOverrides,
  onGlobalViewChange,
  onSectionViewChange,
  navigation,
  searchQuery,
  searchResults,
}: RecipeMenuProps) {
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeView, setRecipeView] = useState<"closed" | "preview" | "full">(
    "closed",
  );

  const openRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeView("preview");
  };

  const closeRecipe = () => {
    setRecipeView("closed");
  };

  const viewFullRecipe = () => {
    setRecipeView("full");
  };

  // Keep the global view handler available for the existing prop contract.
  void onGlobalViewChange;

  const changePage = (sectionId: string, nextPage: number) => {
    setSectionPages((previous) => ({
      ...previous,
      [sectionId]: nextPage,
    }));
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
        {navigation}

        <Box ta="center">
          <Title
            order={1}
            fw={400}
            className={`${greatVibes.className} ${classes.menuTitle}`}
          >
            À La Carte
          </Title>

          <Text className={`${cormorant.className} ${classes.menuTagline}`}>
            A collection of recipes
          </Text>

          <Text className={`${cormorant.className} ${classes.menuNote}`}>
            Estimated ingredient costs (USD)
          </Text>
        </Box>

        <Divider color="#c9b99d" />

        {searchQuery ? (
          searchResults.length > 0 ? (
            <RecipeCarousel title="Search Results" recipes={searchResults} />
          ) : (
            <Box ta="center" py="xl">
              <Title order={2} ff="Georgia, serif" fw={400}>
                No recipes found
              </Title>

              <Text size="sm" c="dimmed" mt="sm">
                No results for &quot;{searchQuery}&quot;. Try another recipe,
                ingredient, or cuisine.
              </Text>
            </Box>
          )
        ) : (
          <>
            {sections.map((section) => {
              const sectionView = viewOverrides[section.id] ?? globalView;

              const totalPages = Math.ceil(
                section.recipes.length / RECIPES_PER_PAGE,
              );

              const currentPage = Math.min(
                sectionPages[section.id] ?? 0,
                Math.max(0, totalPages - 1),
              );

              const visibleRecipes = section.recipes.slice(
                currentPage * RECIPES_PER_PAGE,
                (currentPage + 1) * RECIPES_PER_PAGE,
              );

              return (
                <Box key={section.id}>
                  <Group justify="space-between" align="center" mb="md">
                    <Box w={72} />

                    <Title
                      order={2}
                      fw={400}
                      ta="center"
                      className={`${cormorant.className} ${classes.sectionTitle}`}
                    >
                      {section.title}
                    </Title>

                    <Group gap={4} w={72} justify="flex-end" wrap="nowrap">
                      <Tooltip label={`${section.title}: Menu view`}>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="dark"
                          className={classes.viewToggle}
                          aria-label={`${section.title}: Menu view`}
                          aria-pressed={sectionView === "menu"}
                          onClick={() =>
                            onSectionViewChange(section.id, "menu")
                          }
                        >
                          <IconList size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={`${section.title}: Gallery view`}>
                        <ActionIcon
                          size="sm"
                          variant={
                            sectionView === "gallery" ? "light" : "subtle"
                          }
                          color="dark"
                          className={classes.viewToggle}
                          aria-label={`${section.title}: Gallery view`}
                          aria-pressed={sectionView === "gallery"}
                          onClick={() =>
                            onSectionViewChange(section.id, "gallery")
                          }
                        >
                          <IconPhoto size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  <Box key={sectionView} className={classes.viewTransition}>
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
                              onClick={() => openRecipe(recipe)}
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

                        {totalPages > 1 && (
                          <Group
                            justify="center"
                            gap="sm"
                            mt="md"
                            className={classes.paginationControls}
                          >
                            <Tooltip label="Previous five recipes">
                              <ActionIcon
                                variant="subtle"
                                color="dark"
                                size="lg"
                                disabled={currentPage === 0}
                                aria-label="Previous five recipes"
                                onClick={() =>
                                  changePage(section.id, currentPage - 1)
                                }
                              >
                                <IconChevronUp size={22} stroke={1.7} />
                              </ActionIcon>
                            </Tooltip>

                            <Text size="xs" c="dimmed">
                              {currentPage + 1} / {totalPages}
                            </Text>

                            <Tooltip label="Next five recipes">
                              <ActionIcon
                                variant="subtle"
                                color="dark"
                                size="lg"
                                disabled={currentPage === totalPages - 1}
                                aria-label="Next five recipes"
                                onClick={() =>
                                  changePage(section.id, currentPage + 1)
                                }
                              >
                                <IconChevronDown size={22} stroke={1.7} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        )}
                      </>
                    ) : (
                      <RecipeCarousel title="" recipes={section.recipes} />
                    )}
                  </Box>

                  <Divider color="#c9b99d" mt="xl" />
                </Box>
              );
            })}
          </>
        )}
        <Footer />
      </Stack>

      {selectedRecipe && (
        <>
          <RecipeModal
            opened={recipeView === "preview"}
            onClose={closeRecipe}
            onViewRecipe={viewFullRecipe}
            id={selectedRecipe.id}
            title={selectedRecipe.title}
            image={getRecipeImage(selectedRecipe)}
            cuisine={selectedRecipe.cuisine}
            cookTime={selectedRecipe.cook_time_minutes}
            dietaryTags={selectedRecipe.dietary_tags}
          />

          <FullRecipeModal
            opened={recipeView === "full"}
            onClose={closeRecipe}
            id={selectedRecipe.id}
            title={selectedRecipe.title}
            image={getRecipeImage(selectedRecipe)}
            cuisine={selectedRecipe.cuisine}
            cookTime={selectedRecipe.cook_time_minutes}
            dietaryTags={selectedRecipe.dietary_tags}
          />
        </>
      )}
    </Box>
  );
}
