"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";
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

  const searchableRecipes = [
    ...new Map(
      [...recipes, ...myRecipes].map((recipe) => [recipe.id, recipe]),
    ).values(),
  ];

  const searchResults = searchableRecipes.filter((recipe) => {
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
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 64px",
        backgroundColor: "#ececec",
      }}
    >
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
        onGlobalViewChange={changeGlobalView}
        onSectionViewChange={(id, view) =>
          setViewOverrides((previous) => ({
            ...previous,
            [id]: view,
          }))
        }
        navigation={
          <Navbar
            search={search}
            setSearch={setSearch}
            searchOpened={searchOpened}
            setSearchOpened={setSearchOpened}
          />
        }
        searchQuery={search.trim()}
        searchResults={searchResults}
      />
    </main>
  );
}
