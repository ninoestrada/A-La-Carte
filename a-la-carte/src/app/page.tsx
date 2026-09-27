import RecipeCard from "@/components/RecipeCard";
import { supabase } from "@/lib/supabaseClient";

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

      {recipes?.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          image={recipe.image_url}
          title={recipe.title}
        />
      ))}
    </main>
  );
}
