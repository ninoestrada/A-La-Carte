"use client";

import { useEffect, useState } from "react";
import { Box, Divider, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import { IconArrowLeft, IconX } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { cormorant, greatVibes } from "@/lib/fonts";
import { IngredientIllustration } from "./IngredientIllustration";
import Footer from "./Footer";
import classes from "./FullRecipeModal.module.css";

interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}

interface Instruction {
  id: string;
  step_number: number;
  instruction: string;
}

interface FullRecipeModalProps {
  opened: boolean;
  onClose: () => void;
  id: string;
  title: string;
  image: string;
  cuisine: string | null;
  cookTime: number | null;
  dietaryTags: string[] | null;
}

const supabase = createClient();

export default function FullRecipeModal({
  opened,
  onClose,
  id,
  title,
  image,
  cuisine,
  cookTime,
  dietaryTags,
}: FullRecipeModalProps) {
  type RecipeDetails = {
    id: string;
    ingredients: Ingredient[];
    instructions: Instruction[];
    loadError: boolean;
  };

  const [details, setDetails] = useState<RecipeDetails | null>(null);

  const loading = details?.id !== id;
  const loadError = !loading && details.loadError;
  const ingredients = !loading ? details.ingredients : [];
  const instructions = !loading ? details.instructions : [];

  useEffect(() => {
    if (!opened) return;

    let cancelled = false;

    async function loadRecipe() {
      const [ingredientsResult, instructionsResult] = await Promise.all([
        supabase
          .from("recipe_ingredients")
          .select("id, name, quantity, unit")
          .eq("recipe_id", id),

        supabase
          .from("recipe_instructions")
          .select("id, step_number, instruction")
          .eq("recipe_id", id)
          .order("step_number", { ascending: true }),
      ]);

      if (cancelled) return;

      const hasError = Boolean(
        ingredientsResult.error || instructionsResult.error,
      );

      if (hasError) {
        console.error(
          "Error loading recipe:",
          ingredientsResult.error ?? instructionsResult.error,
        );
      }

      setDetails({
        id,
        ingredients: hasError ? [] : (ingredientsResult.data ?? []),
        instructions: hasError ? [] : (instructionsResult.data ?? []),
        loadError: hasError,
      });
    }

    void loadRecipe();

    return () => {
      cancelled = true;
    };
  }, [opened, id]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="100%"
      centered
      withCloseButton={false}
      padding={0}
      radius={0}
      scrollAreaComponent={undefined}
      classNames={{
        overlay: classes.overlay,
        content: classes.modalContent,
        body: classes.modalBody,
        inner: classes.modalInner,
      }}
      transitionProps={{
        transition: "pop",
        duration: 450,
        timingFunction: "ease",
      }}
      title={title}
      styles={{ header: { display: "none" } }}
    >
      <main className={classes.recipePaper}>
        <div className={classes.topBar}>
          <button
            type="button"
            className={`${cormorant.className} ${classes.backLink}`}
            onClick={onClose}
          >
            <IconArrowLeft size={18} stroke={1.6} />
            Back to Menu
          </button>

          <button
            type="button"
            className={classes.closeButton}
            onClick={onClose}
            aria-label="Close full recipe"
          >
            <IconX size={20} stroke={1.6} />
          </button>
        </div>

        <Stack gap="lg">
          <Box className={classes.header}>
            <Text className={`${greatVibes.className} ${classes.menuTitle}`}>
              À La Carte
            </Text>

            <h1 className={`${cormorant.className} ${classes.recipeTitle}`}>
              {title}
            </h1>

            <Group justify="center" gap="md" className={classes.metadata}>
              {cuisine && (
                <Text className={cormorant.className}>{cuisine}</Text>
              )}

              {cookTime !== null && (
                <Text className={cormorant.className}>{cookTime} min</Text>
              )}
            </Group>

            {dietaryTags && dietaryTags.length > 0 && (
              <Group justify="center" gap="xs" mt="sm">
                {dietaryTags.map((tag) => (
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
              <img src={image} alt={title} className={classes.recipeImage} />
            </div>
          )}

          <Divider className={classes.divider} />

          {loading ? (
            <Box className={classes.loadingState}>
              <Loader color="#9a603c" size="sm" />
              <Text className={classes.emptyText}>Preparing your recipe…</Text>
            </Box>
          ) : loadError ? (
            <Text className={classes.emptyText}>
              Unable to load recipe details.
            </Text>
          ) : (
            <>
              <section>
                <h2
                  className={`${cormorant.className} ${classes.sectionTitle}`}
                >
                  Ingredients
                </h2>

                {ingredients.length > 0 ? (
                  <div className={classes.ingredientsGrid}>
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className={classes.ingredientRow}
                      >
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
                <h2
                  className={`${cormorant.className} ${classes.sectionTitle}`}
                >
                  Instructions
                </h2>

                {instructions.length > 0 ? (
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
            </>
          )}

          <Divider className={classes.divider} />

          <Footer />
        </Stack>
      </main>
    </Modal>
  );
}
