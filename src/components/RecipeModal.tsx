"use client";

import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Text,
  Group,
  Box,
  Stack,
  ActionIcon,
  Tooltip,
  Divider,
  Popover,
} from "@mantine/core";
import { createClient } from "@/lib/supabase/client";
import { cormorant } from "@/lib/fonts";
import {
  IconBook2,
  IconHeart,
  IconHeartBroken,
  IconHearts,
  IconBookmark,
  IconX,
} from "@tabler/icons-react";
import classes from "./RecipeModal.module.css";
import { IngredientIllustration } from "./IngredientIllustration";

const supabase = createClient();

interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}

interface RecipeModalProps {
  opened: boolean;
  onClose: () => void;
  onExitTransitionEnd?: () => void;
  id: string;
  title: string;
  image: string;
  cuisine: string | null;
  cookTime: number | null;
  dietaryTags: string[] | null;
  onViewRecipe?: () => void;
}

type Reaction = "dislike" | "like" | "love" | null;

export default function RecipeModal({
  opened,
  onClose,
  onExitTransitionEnd,
  onViewRecipe,
  id,
  title,
  image,
  cuisine,
  cookTime,
  dietaryTags,
}: RecipeModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [reactionOpened, setReactionOpened] = useState(false);
  const reactionCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelReactionClose() {
    if (reactionCloseTimer.current) {
      clearTimeout(reactionCloseTimer.current);
      reactionCloseTimer.current = null;
    }
  }

  function scheduleReactionClose() {
    cancelReactionClose();

    reactionCloseTimer.current = setTimeout(() => {
      setReactionOpened(false);
    }, 180);
  }

  useEffect(() => {
    return () => {
      if (reactionCloseTimer.current) {
        clearTimeout(reactionCloseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!opened) return;

    let cancelled = false;

    async function loadIngredients() {
      setIngredients([]);

      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("id, name, quantity, unit")
        .eq("recipe_id", id);

      if (cancelled) return;

      if (error) {
        console.error("Error loading ingredients:", error);
        return;
      }

      setIngredients(data ?? []);
    }

    void loadIngredients();

    return () => {
      cancelled = true;
    };
  }, [opened, id]);

  function selectReaction(value: Reaction) {
    setReaction(value);
    setReactionOpened(false);
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      withCloseButton={false}
      padding={0}
      radius="md"
      classNames={{ content: classes.modalContent, body: classes.modalBody }}
      transitionProps={{
        transition: "scale",
        duration: 250,
        timingFunction: "ease-out",
        onExited: onExitTransitionEnd,
      }}
      title={title}
      styles={{ header: { display: "none" } }}
    >
      <Box className={classes.hero}>
        {image && (
          <div
            className={classes.heroImage}
            style={{ backgroundImage: `url("${image}")` }}
          />
        )}

        <div className={classes.heroGradient} />

        <ActionIcon
          className={classes.closeButton}
          onClick={onClose}
          aria-label="Close recipe preview"
          variant="filled"
          radius="xl"
          size="lg"
        >
          <IconX size={20} />
        </ActionIcon>

        <div className={classes.heroContent}>
          <h2 className={`${cormorant.className} ${classes.recipeTitle}`}>
            {title}
          </h2>

          <Group gap="sm" align="center" wrap="wrap">
            <Button
              onClick={onViewRecipe}
              leftSection={<IconBook2 size={18} />}
              className={`${cormorant.className} ${classes.viewButton}`}
              radius="sm"
            >
              View Recipe
            </Button>

            <Tooltip label="Save to My Recipes — coming soon">
              <span>
                <ActionIcon
                  className={`${classes.heroAction} ${classes.saveAction}`}
                  aria-label="Save to My Recipes — coming soon"
                  radius="xl"
                  size="lg"
                  disabled
                >
                  <IconBookmark size={19} />
                </ActionIcon>
              </span>
            </Tooltip>

            <Popover
              opened={reactionOpened}
              onChange={setReactionOpened}
              position="top-start"
              offset={12}
              withArrow
              shadow="md"
              withinPortal
            >
              <Popover.Target>
                <Tooltip label="React to this recipe" disabled={reactionOpened}>
                  <ActionIcon
                    className={classes.heroAction}
                    radius="xl"
                    size="lg"
                    aria-label="React to this recipe"
                    aria-expanded={reactionOpened}
                    onMouseEnter={() => {
                      cancelReactionClose();
                      setReactionOpened(true);
                    }}
                    onMouseLeave={scheduleReactionClose}
                    onClick={() => {
                      cancelReactionClose();
                      setReactionOpened((value) => !value);
                    }}
                  >
                    {reaction === "dislike" ? (
                      <IconHeartBroken size={19} />
                    ) : reaction === "love" ? (
                      <IconHearts size={19} />
                    ) : (
                      <IconHeart size={19} />
                    )}
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>

              <Popover.Dropdown
                className={classes.reactionDropdown}
                onMouseEnter={cancelReactionClose}
                onMouseLeave={scheduleReactionClose}
              >
                <Group gap="xs" wrap="nowrap">
                  <Tooltip label="Not for me">
                    <ActionIcon
                      className={classes.reactionOption}
                      aria-label="Not for me"
                      onClick={() => selectReaction("dislike")}
                    >
                      <IconHeartBroken size={20} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="I like this">
                    <ActionIcon
                      className={classes.reactionOption}
                      aria-label="I like this"
                      onClick={() => selectReaction("like")}
                    >
                      <IconHeart size={20} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Love this">
                    <ActionIcon
                      className={classes.reactionOption}
                      aria-label="Love this"
                      onClick={() => selectReaction("love")}
                    >
                      <IconHearts size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </div>
      </Box>

      <Box className={classes.recipeDetails}>
        <Group gap="sm" wrap="wrap">
          {cuisine && <Text className={classes.recipeMetadata}>{cuisine}</Text>}

          {cookTime !== null && (
            <Text className={classes.recipeMetadata}>{cookTime} min</Text>
          )}

          {dietaryTags?.map((tag) => (
            <Text key={tag} className={classes.recipeMetadata}>
              {tag}
            </Text>
          ))}
        </Group>

        <Divider className={classes.divider} />

        <h2 className={`${cormorant.className} ${classes.ingredientsTitle}`}>
          Ingredients
        </h2>

        <Stack gap="md" mt="md">
          {ingredients.length > 0 ? (
            ingredients.map((ingredient) => (
              <Group
                key={ingredient.id}
                gap="md"
                wrap="nowrap"
                align="center"
                className={classes.ingredientRow}
              >
                <Box className={classes.ingredientIcon}>
                  <IngredientIllustration name={ingredient.name} />
                </Box>

                <Box>
                  <Text
                    className={`${cormorant.className} ${classes.ingredient}`}
                  >
                    {ingredient.name}
                  </Text>

                  <Text className={classes.ingredientQuantity}>
                    {[ingredient.quantity, ingredient.unit]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                </Box>
              </Group>
            ))
          ) : (
            <Text className={classes.emptyIngredients}>
              No ingredients available.
            </Text>
          )}
        </Stack>
      </Box>
    </Modal>
  );
}
