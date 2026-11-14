"use client";

import { Title } from "@mantine/core";
import classes from "./RecipeCard.module.css";

interface RecipeCardProps {
  id: string;
  image: string;
  title: string;
  onHoverStart: (element: HTMLButtonElement) => void;
  onHoverEnd: () => void;
  onOpen: () => void;
}

export default function RecipeCard({
  id,
  image,
  title,
  onHoverStart,
  onHoverEnd,
  onOpen,
}: RecipeCardProps) {
  return (
    <button
      type="button"
      data-recipe-id={id}
      className={classes.card}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          onHoverStart(event.currentTarget);
        }
      }}
      onPointerLeave={onHoverEnd}
      onClick={onOpen}
      aria-label={`View recipe: ${title}`}
      style={{
        backgroundImage: `
          linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8),
            transparent 60%
          ),
          ${image ? `url("${image}")` : "none"}
        `,
      }}
    >
      <Title order={3} c="white" className={classes.cardTitle}>
        {title}
      </Title>
    </button>
  );
}
