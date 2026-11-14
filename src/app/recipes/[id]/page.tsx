import Link from "next/link";
import {
  Box,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { cormorant, greatVibes } from "@/lib/fonts";
import { IngredientIllustration } from "@/components/IngredientIllustration";
import classes from "./page.module.css";

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
      <main className={classes.page}>
        <Text ta="center">Error loading recipe.</Text>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className={classes.page}>
        <Text ta="center">Recipe not found.</Text>
      </main>
    );
  }

  const image = recipe.image_url
    ? recipe.image_url.startsWith("https://")
      ? recipe.image_url
      : `/api/recipes/${recipe.id}/image`
    : null;

  return (
    <main className={classes.page}>
      <Container size="md" className={classes.recipePaper}>
        <Link href="/" className={`${cormorant.className} ${classes.backLink}`}>
          ← Back to Menu
        </Link>

        <Stack gap="lg">
          <Box className={classes.header}>
            <Text className={`${greatVibes.className} ${classes.brand}`}>
              À La Carte
            </Text>

            <Title
              order={1}
              className={`${cormorant.className} ${classes.recipeTitle}`}
            >
              {recipe.title}
            </Title>

            <Group justify="center" gap="md" className={classes.metadata}>
              {recipe.cuisine && (
                <Text className={cormorant.className}>{recipe.cuisine}</Text>
              )}

              {recipe.cook_time_minutes !== null && (
                <Text className={cormorant.className}>
                  {recipe.cook_time_minutes} min
                </Text>
              )}
            </Group>

            {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
              <Group justify="center" gap="xs" mt="sm">
                {recipe.dietary_tags.map((tag: string) => (
                  <span key={tag} className={classes.dietaryTag}>
                    {tag}
                  </span>
                ))}
              </Group>
            )}
          </Box>

          {image && (
            <div className={classes.imageContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={recipe.title}
                className={classes.recipeImage}
              />
            </div>
          )}

          <Divider className={classes.divider} />

          <section>
            <Title
              order={2}
              className={`${cormorant.className} ${classes.sectionTitle}`}
            >
              Ingredients
            </Title>

            {ingredients && ingredients.length > 0 ? (
              <div className={classes.ingredientsGrid}>
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className={classes.ingredientRow}>
                    <div className={classes.ingredientIcon}>
                      <IngredientIllustration name={ingredient.name} />
                    </div>

                    <div>
                      <Text
                        className={`${cormorant.className} ${classes.ingredientName}`}
                      >
                        {ingredient.name}
                      </Text>

                      <Text className={classes.ingredientQuantity}>
                        {[ingredient.quantity, ingredient.unit]
                          .filter(Boolean)
                          .join(" ")}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text className={classes.emptyText}>
                No ingredients available.
              </Text>
            )}
          </section>

          <Divider className={classes.divider} />

          <section>
            <Title
              order={2}
              className={`${cormorant.className} ${classes.sectionTitle}`}
            >
              Instructions
            </Title>

            {instructions && instructions.length > 0 ? (
              <Stack gap="lg">
                {instructions.map((step) => (
                  <div key={step.id} className={classes.instructionRow}>
                    <span
                      className={`${cormorant.className} ${classes.stepNumber}`}
                    >
                      {String(step.step_number).padStart(2, "0")}
                    </span>

                    <Text
                      className={`${cormorant.className} ${classes.instructionText}`}
                    >
                      {step.instruction}
                    </Text>
                  </div>
                ))}
              </Stack>
            ) : (
              <Text className={classes.emptyText}>
                No instructions available.
              </Text>
            )}
          </section>

          <Divider className={classes.divider} />

          <Box className={classes.footer}>
            <Text className={classes.footerLabel}>Chef de Cuisine</Text>
            <Text className={`${greatVibes.className} ${classes.signature}`}>
              Nino Estrada
            </Text>
          </Box>
        </Stack>
      </Container>
    </main>
  );
}
