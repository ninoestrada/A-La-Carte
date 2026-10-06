"use client";

import { useState } from "react";
import { Paper, Title } from "@mantine/core";
import RecipeModal from "./RecipeModal";
import classes from "./RecipeCard.module.css";

interface RecipeCardProps {
  id: string;
  image: string;
  title: string;
  cuisine: string | null;
  cookTime: number | null;
  dietaryTags: string[] | null;
}

export default function RecipeCard({
  id,
  image,
  title,
  cuisine,
  cookTime,
  dietaryTags,
}: RecipeCardProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Paper
        className={classes.card}
        shadow="md"
        radius="md"
        onClick={() => setOpened(true)}
        style={{
          backgroundImage: `
            linear-gradient(
              to top,
              rgba(0, 0, 0, 0.8),
              rgba(0, 0, 0, 0) 60%
            ),
            url(${image})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: 300,
          width: 250,
          display: "flex",
          alignItems: "flex-end",
          padding: 20,
          overflow: "hidden",
        }}
      >
        <Title order={3} c="white">
          {title}
        </Title>
      </Paper>

      <RecipeModal
        opened={opened}
        onClose={() => setOpened(false)}
        id={id}
        title={title}
        image={image}
        cuisine={cuisine}
        cookTime={cookTime}
        dietaryTags={dietaryTags}
      />
    </>
  );
}
