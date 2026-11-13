"use client";

import { useState } from "react";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconList, IconPhoto } from "@tabler/icons-react";

import Navbar from "@/components/Navbar";
import RecipeCarousel from "@/components/RecipeCarousel";
import RecipeMenu from "@/components/RecipeMenu";

interface Recipe {
  id: string;
  title: string;
  image_url: string;
  cuisine: string | null;
  cook_time_minutes: number | null;
  dietary_tags: string[] | null;
  recipe_ingredients: {
    name: string;
  }[];
}

interface RecipeBrowserProps {
  recipes: Recipe[];
  myRecipes: Recipe[];
  isSignedIn: boolean;
  myRecipesLoadError: boolean;
}

type View = "menu" | "gallery";

export default function RecipeBrowser({
  recipes,
  myRecipes,
  isSignedIn,
  myRecipesLoadError,
}: RecipeBrowserProps) {
  const [search, setSearch] = useState("");
  const [searchOpened, setSearchOpened] = useState(false);
  const [globalView, setGlobalView] = useState<View>("menu");
  const [viewOverrides, setViewOverrides] = useState<Record<string, View>>({});

  const normalizedSearch = search.trim().toLowerCase();

  const searchResults = recipes.filter((recipe) => {
    const titleMatches = recipe.title.toLowerCase().includes(normalizedSearch);

    const cuisineMatches =
      recipe.cuisine?.toLowerCase().includes(normalizedSearch) ?? false;

    const ingredientMatches = recipe.recipe_ingredients.some((ingredient) =>
      ingredient.name.toLowerCase().includes(normalizedSearch),
    );

    return titleMatches || cuisineMatches || ingredientMatches;
  });

  const italianRecipes = recipes.filter(
    (recipe) => recipe.cuisine === "Italian",
  );

  const quickRecipes = recipes.filter(
    (recipe) =>
      recipe.cook_time_minutes !== null && recipe.cook_time_minutes <= 30,
  );

  const vegetarianRecipes = recipes.filter((recipe) =>
    recipe.dietary_tags?.includes("vegetarian"),
  );

  const sections = [
    ...(isSignedIn && !myRecipesLoadError && myRecipes.length > 0
      ? [{ id: "my-recipes", title: "My Recipes", recipes: myRecipes }]
      : []),
    { id: "quick", title: "Quick & Easy", recipes: quickRecipes },
    { id: "italian", title: "Italian", recipes: italianRecipes },
    { id: "vegetarian", title: "Vegetarian", recipes: vegetarianRecipes },
  ];

  const changeGlobalView = (view: View) => {
    setGlobalView(view);
    setViewOverrides({});
  };

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
        searchOpened={searchOpened}
        setSearchOpened={setSearchOpened}
      />

      <main style={{ padding: "24px 16px" }}>
        {normalizedSearch ? (
          searchResults.length > 0 ? (
            <RecipeCarousel title="Search Results" recipes={searchResults} />
          ) : (
            <div>
              <h2>No recipes found for &quot;{search}&quot;</h2>
              <p>Try searching for another recipe, ingredient, or cuisine.</p>
            </div>
          )
        ) : (
          <>
            <Group justify="flex-start" gap={4} mb="md">
              <Tooltip label="Show all sections as menu">
                <ActionIcon
                  variant={globalView === "menu" ? "filled" : "subtle"}
                  color="dark"
                  size="lg"
                  aria-label="Show all sections as menu"
                  onClick={() => changeGlobalView("menu")}
                >
                  <IconList size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Show all sections as gallery">
                <ActionIcon
                  variant={globalView === "gallery" ? "filled" : "subtle"}
                  color="dark"
                  size="lg"
                  aria-label="Show all sections as gallery"
                  onClick={() => changeGlobalView("gallery")}
                >
                  <IconPhoto size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {isSignedIn && myRecipesLoadError && (
              <p>Unable to load My Recipes. Please try again later.</p>
            )}

            {isSignedIn && !myRecipesLoadError && myRecipes.length === 0 && (
              <p>You haven&apos;t created any recipes yet.</p>
            )}

            <RecipeMenu
              sections={sections}
              globalView={globalView}
              viewOverrides={viewOverrides}
              onSectionViewChange={(id, view) =>
                setViewOverrides((previous) => ({
                  ...previous,
                  [id]: view,
                }))
              }
            />
          </>
        )}
      </main>
    </>
  );
}
