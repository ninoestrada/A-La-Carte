import { Badge, Container, Group, Stack, Text, Title } from "@mantine/core";
import { createClient } from "@/lib/supabase/server";

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id, title, image_url, cuisine, cook_time_minutes, dietary_tags")
    .eq("id", id)
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
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{recipe.title}</Title>

        {recipe.image_url && (
          <div
            style={{
              width: "100%",
              aspectRatio: "2 / 1",
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                recipe.image_url.startsWith("https://")
                  ? recipe.image_url
                  : `/api/recipes/${recipe.id}/image`
              }
              alt={recipe.title}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <Stack gap="sm">
          <Group gap="md">
            {recipe.cuisine && (
              <Text size="sm" c="dimmed">
                {recipe.cuisine}
              </Text>
            )}

            {recipe.cook_time_minutes !== null && (
              <Text size="sm" c="dimmed">
                {recipe.cook_time_minutes} min
              </Text>
            )}
          </Group>

          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <Group gap="xs">
              {recipe.dietary_tags.map((tag: string) => (
                <Badge key={tag} variant="light" color="gray">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>

        <Title order={2}>Ingredients</Title>

        {ingredients && ingredients.length > 0 ? (
          <ul style={{ paddingLeft: 24, margin: 0 }}>
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

        <Title order={2}>Instructions</Title>

        {instructions && instructions.length > 0 ? (
          <ol style={{ paddingLeft: 24, margin: 0 }}>
            {instructions.map((step) => (
              <li key={step.id}>{step.instruction}</li>
            ))}
          </ol>
        ) : (
          <p>No instructions available.</p>
        )}
      </Stack>
    </Container>
  );
}
