"use client";

import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import RecipeCard from "./RecipeCard";
import { Title } from "@mantine/core";

interface Recipe {
  id: string;
  title: string;
  image_url: string;
}

interface RecipeCarouselProps {
  title: string;
  recipes: Recipe[];
}

export default function RecipeCarousel({
  title,
  recipes,
}: RecipeCarouselProps) {
  return (
    <section>
      <Title order={2}>{title}</Title>

      <Carousel
        slideSize="250px"
        slideGap="md"
        emblaOptions={{ align: "start" }}
      >
        {recipes.map((recipe) => (
          <Carousel.Slide key={recipe.id}>
            <RecipeCard image={recipe.image_url} title={recipe.title} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  );
}
