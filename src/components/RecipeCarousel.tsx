"use client";

import { useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Title } from "@mantine/core";
import "@mantine/carousel/styles.css";

import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import classes from "./RecipeCarousel.module.css";

interface Recipe {
  id: string;
  title: string;
  image_url: string;
  cuisine: string | null;
  cook_time_minutes: number | null;
  dietary_tags: string[] | null;
}

interface RecipeCarouselProps {
  title: string;
  recipes: Recipe[];
}

function getRecipeImage(recipe: Recipe): string {
  if (recipe.image_url?.startsWith("https://")) {
    return recipe.image_url;
  }

  return recipe.image_url ? `/api/recipes/${recipe.id}/image` : "";
}

export default function RecipeCarousel({
  title,
  recipes,
}: RecipeCarouselProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <section>
      {title && <Title order={2}>{title}</Title>}

      <Carousel
        className={classes.carousel}
        slideSize="270px"
        slideGap="md"
        withControls={recipes.length > 1}
        emblaOptions={{
          align: "start",
          containScroll: "trimSnaps",
          duration: 30,
          dragFree: false,
        }}
      >
        {recipes.map((recipe) => (
          <Carousel.Slide key={recipe.id}>
            <RecipeCard
              id={recipe.id}
              image={getRecipeImage(recipe)}
              title={recipe.title}
              onOpen={() => setSelectedRecipe(recipe)}
            />
          </Carousel.Slide>
        ))}
      </Carousel>

      {selectedRecipe && (
        <RecipeModal
          opened={true}
          onClose={() => setSelectedRecipe(null)}
          id={selectedRecipe.id}
          title={selectedRecipe.title}
          image={getRecipeImage(selectedRecipe)}
          cuisine={selectedRecipe.cuisine}
          cookTime={selectedRecipe.cook_time_minutes}
          dietaryTags={selectedRecipe.dietary_tags}
        />
      )}
    </section>
  );
}
