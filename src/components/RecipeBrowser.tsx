"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import RecipeCarousel from "@/components/RecipeCarousel";

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
}

export default function RecipeBrowser({ recipes }: RecipeBrowserProps) {
  const [search, setSearch] = useState("");
  const [searchOpened, setSearchOpened] = useState(false);

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

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
        searchOpened={searchOpened}
        setSearchOpened={setSearchOpened}
      />

      <main style={{ padding: 32 }}>
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
            <RecipeCarousel title="Quick & Easy" recipes={quickRecipes} />

            <RecipeCarousel title="Italian" recipes={italianRecipes} />

            <RecipeCarousel title="Vegetarian" recipes={vegetarianRecipes} />
          </>
        )}
      </main>
    </>
  );
}
