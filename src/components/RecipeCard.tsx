"use client";

import classes from "./RecipeCard.module.css";

interface RecipeCardProps {
  id: string;
  image: string;
  title: string;
  onOpen: () => void;
}

export default function RecipeCard({
  id,
  image,
  title,
  onOpen,
}: RecipeCardProps) {
  return (
    <button
      type="button"
      data-recipe-id={id}
      className={classes.card}
      onClick={onOpen}
      aria-label={`View recipe: ${title}`}
    >
      <span
        className={classes.cardImage}
        aria-hidden="true"
        style={{
          backgroundImage: image ? `url("${image}")` : "none",
        }}
      />

      <span className={classes.cardOverlay}>
        <span className={classes.cardTitle}>{title}</span>
      </span>
    </button>
  );
}
