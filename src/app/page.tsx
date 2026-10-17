import { createClient } from "@/lib/supabase/server";
import RecipeBrowser from "@/components/RecipeBrowser";

export default async function HomePage() {
  const supabase = await createClient();

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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("Error checking authentication:", authError);
  }

  let myRecipes: typeof recipes = [];

  let myRecipesLoadError = false;

  if (user) {
    const { data, error: myRecipesError } = await supabase
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (myRecipesError) {
      console.error("Error loading My Recipes:", myRecipesError);

      myRecipesLoadError = true;
    } else {
      myRecipes = data ?? [];
    }
  }

  return (
    <RecipeBrowser
      recipes={recipes ?? []}
      myRecipes={myRecipes}
      isSignedIn={!!user}
      myRecipesLoadError={myRecipesLoadError}
    />
  );
}
