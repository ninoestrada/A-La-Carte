"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, Button, Title, Text, Group } from "@mantine/core";
import { supabase } from "@/lib/supabaseClient";

interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}

interface RecipeModalProps {
  opened: boolean;
  onClose: () => void;
  id: string;
  title: string;
  image: string;
  cuisine: string | null;
  cookTime: number | null;
  dietaryTags: string[] | null;
}

export default function RecipeModal({
  opened,
  onClose,
  id,
  title,
  image,
  cuisine,
  cookTime,
  dietaryTags,
}: RecipeModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    async function loadIngredients() {
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("id, name, quantity, unit")
        .eq("recipe_id", id);

      if (error) {
        console.error("Error loading ingredients:", error);
        return;
      }

      setIngredients(data ?? []);
    }

    loadIngredients();
  }, [opened, id]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      withCloseButton={false}
      padding={0}
      radius="md"
      styles={{
        content: {
          backgroundColor: "#181818",
          color: "white",
          overflow: "hidden",
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* Hero image */}
      <div
        style={{
          position: "relative",
          height: 350,
          backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 40%,
            rgba(24, 24, 24, 1) 100%
          ),
          url(${image})
        `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close recipe preview"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "#181818",
            color: "white",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {/* Title + actions over image */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            bottom: 20,
          }}
        >
          <Title order={1} c="white">
            {title}
          </Title>

          <Group mt="md">
            <Button component={Link} href={`/recipes/${id}`}>
              View Recipe
            </Button>

            <Button variant="outline" color="gray">
              +
            </Button>

            <Button variant="outline" color="gray">
              👍
            </Button>

            <Button variant="outline" color="gray">
              👎
            </Button>
          </Group>
        </div>
      </div>

      {/* Recipe information */}
      <div style={{ padding: "8px 32px 32px" }}>
        <Group gap="md">
          {cuisine && <Text c="white">{cuisine}</Text>}

          {cookTime !== null && <Text c="white">{cookTime} min</Text>}

          {dietaryTags?.map((tag) => (
            <Text key={tag} c="white">
              {tag}
            </Text>
          ))}
        </Group>

        <Title order={3} mt="xl" c="white">
          Ingredients
        </Title>

        <div style={{ marginTop: 8 }}>
          {ingredients.length > 0 ? (
            ingredients.map((ingredient) => (
              <Text key={ingredient.id} c="gray.3">
                {ingredient.quantity && `${ingredient.quantity} `}
                {ingredient.unit && `${ingredient.unit} `}
                {ingredient.name}
              </Text>
            ))
          ) : (
            <Text c="dimmed">No ingredients available.</Text>
          )}
        </div>
      </div>
    </Modal>
  );
}
