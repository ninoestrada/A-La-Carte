import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id, title, image_url, cuisine, cook_time_minutes, dietary_tags")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .select("id, name, quantity, unit")
    .eq("recipe_id", id);

  const { data: instructions, error: instructionsError } = await supabase
    .from("recipe_instructions")
    .select("id, step_number, instruction")
    .eq("recipe_id", id)
    .order("step_number", { ascending: true });

  if (error || ingredientsError || instructionsError) {
    return (
      <main style={{ padding: 32 }}>
        <p>Error loading recipe.</p>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main style={{ padding: 32 }}>
        <p>Recipe not found.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>{recipe.title}</h1>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 800,
          height: 400,
        }}
      >
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          fill
          sizes="(max-width: 800px) 100vw, 800px"
          style={{
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      </div>

      <p>
        {[
          recipe.cuisine,
          recipe.cook_time_minutes !== null
            ? `${recipe.cook_time_minutes} min`
            : null,
          ...(recipe.dietary_tags ?? []),
        ]
          .filter(Boolean)
          .join(" • ")}
      </p>

      <h2>Ingredients</h2>

      {ingredients && ingredients.length > 0 ? (
        <ul>
          {ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {ingredient.quantity && `${ingredient.quantity} `}
              {ingredient.unit && `${ingredient.unit} `}
              {ingredient.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No ingredients available.</p>
      )}

      <h2>Instructions</h2>

      {instructions && instructions.length > 0 ? (
        <ol>
          {instructions.map((step) => (
            <li key={step.id}>{step.instruction}</li>
          ))}
        </ol>
      ) : (
        <p>No instructions available.</p>
      )}
    </main>
  );
}
