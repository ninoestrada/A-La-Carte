import { supabase } from "@/lib/supabaseClient";
import RecipeCarousel from "@/components/RecipeCarousel";

export default async function HomePage() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, image_url")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return <p>Error loading recipes: {error.message}</p>;
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>À La Carte</h1>

      <RecipeCarousel title="Recipes" recipes={recipes ?? []} />
    </main>
  );
}
