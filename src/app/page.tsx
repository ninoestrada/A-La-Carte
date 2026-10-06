import { supabase } from "@/lib/supabaseClient";
import RecipeCarousel from "@/components/RecipeCarousel";

export default async function HomePage() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, image_url, cuisine, cook_time_minutes, dietary_tags")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return <p>Error loading recipes: {error.message}</p>;
  }

  const italianRecipes =
    recipes?.filter((recipe) => recipe.cuisine === "Italian") ?? [];

  const quickRecipes =
    recipes?.filter(
      (recipe) =>
        recipe.cook_time_minutes !== null && recipe.cook_time_minutes <= 30,
    ) ?? [];

  const vegetarianRecipes =
    recipes?.filter((recipe) => recipe.dietary_tags?.includes("vegetarian")) ??
    [];

  return (
    <main style={{ padding: 32 }}>
      <h1>À La Carte</h1>

      <RecipeCarousel title="Quick & Easy" recipes={quickRecipes} />

      <RecipeCarousel title="Italian" recipes={italianRecipes} />

      <RecipeCarousel title="Vegetarian" recipes={vegetarianRecipes} />
    </main>
  );
}
