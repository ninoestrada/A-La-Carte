import { supabase } from "@/lib/supabaseClient";
import RecipeBrowser from "@/components/RecipeBrowser";

export default async function HomePage() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `
  id,
  title,
  image_url,
  cuisine,
  cook_time_minutes,
  dietary_tags,
  recipe_ingredients (
    name
  )
`,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return <p>Error loading recipes: {error.message}</p>;
  }

  return <RecipeBrowser recipes={recipes ?? []} />;
}
