"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Carousel } from "@mantine/carousel";
import type { EmblaCarouselType } from "embla-carousel";
import { Title } from "@mantine/core";
import "@mantine/carousel/styles.css";
import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import RecipePreview, { type PreviewRecipe } from "./RecipePreview";
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

interface ActivePreview {
  recipe: PreviewRecipe;
  origin: DOMRect;
  closing: boolean;
}

const HOVER_DELAY = 600;
const CLOSE_DELAY = 180;

function getRecipeImage(recipe: Recipe): string {
  if (recipe.image_url?.startsWith("https://")) {
    return recipe.image_url;
  }

  return recipe.image_url ? `/api/recipes/${recipe.id}/image` : "";
}

function toPreviewRecipe(recipe: Recipe): PreviewRecipe {
  return {
    id: recipe.id,
    title: recipe.title,
    image: getRecipeImage(recipe),
    cuisine: recipe.cuisine,
    cookTime: recipe.cook_time_minutes,
    dietaryTags: recipe.dietary_tags,
  };
}

function isFullyVisible(element: HTMLButtonElement): boolean {
  const viewport = element.closest(".mantine-Carousel-viewport");

  if (!viewport) return false;

  const card = element.getBoundingClientRect();
  const bounds = viewport.getBoundingClientRect();
  const tolerance = 2;

  return (
    card.left >= bounds.left - tolerance &&
    card.right <= bounds.right + tolerance &&
    card.top >= bounds.top - tolerance &&
    card.bottom <= bounds.bottom + tolerance
  );
}

export default function RecipeCarousel({
  title,
  recipes,
}: RecipeCarouselProps) {
  const [activePreview, setActivePreview] = useState<ActivePreview | null>(
    null,
  );

  const [selectedRecipe, setSelectedRecipe] = useState<PreviewRecipe | null>(
    null,
  );

  const carouselRef = useRef<HTMLDivElement>(null);

  const pointerPosition = useRef<{
    x: number;
    y: number;
  } | null>(null);
  
  const recheckHoveredCardRef = useRef<() => void>(() => {});
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const closePreview = useCallback(() => {
    setActivePreview((current) =>
      current ? { ...current, closing: true } : null,
    );
  }, []);

  const handlePreviewClosed = useCallback(() => {
    setActivePreview((current) => (current?.closing ? null : current));
  }, []);

  const handleHoverStart = (recipe: Recipe, element: HTMLButtonElement) => {
    clearHoverTimer();
    clearCloseTimer();

    if (!isFullyVisible(element)) return;

    if (activePreview?.recipe.id === recipe.id && !activePreview.closing) {
      return;
    }

    closePreview();

    hoverTimer.current = setTimeout(() => {
      if (!element.isConnected || !isFullyVisible(element)) return;

      const position = pointerPosition.current;
      if (!position) return;

      const hoveredElement = document.elementFromPoint(position.x, position.y);

      if (!hoveredElement || !element.contains(hoveredElement)) return;

      setActivePreview({
        recipe: toPreviewRecipe(recipe),
        origin: element.getBoundingClientRect(),
        closing: false,
      });
    }, HOVER_DELAY);
  };

  const handleHoverEnd = () => {
    clearHoverTimer();
    clearCloseTimer();

    closeTimer.current = setTimeout(() => {
      closePreview();
    }, CLOSE_DELAY);
  };

  const recheckHoveredCard = () => {
    const position = pointerPosition.current;
    const carousel = carouselRef.current;

    if (!position || !carousel) return;

    const element = document.elementFromPoint(position.x, position.y);

    const card = element?.closest<HTMLButtonElement>("[data-recipe-id]");

    if (!card || !carousel.contains(card)) return;
    if (!isFullyVisible(card)) return;

    const recipe = recipes.find((item) => item.id === card.dataset.recipeId);

    if (!recipe) return;

    handleHoverStart(recipe, card);
  };

  const handleNavigation = () => {
    clearHoverTimer();
    clearCloseTimer();
    closePreview();
  };

  const openRecipe = (recipe: PreviewRecipe) => {
    clearHoverTimer();
    clearCloseTimer();

    setActivePreview(null);
    setSelectedRecipe(recipe);
  };

  useEffect(() => {
    const trackPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      pointerPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    window.addEventListener("pointermove", trackPointer, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", trackPointer);
    };
  }, []);

  useEffect(() => {
    const handleMovement = () => {
      hoverTimer.current = null;
      closePreview();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleMovement();
      }
    };

    window.addEventListener("scroll", handleMovement, true);
    window.addEventListener("resize", handleMovement);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleMovement, true);
      window.removeEventListener("resize", handleMovement);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePreview]);

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimer.current ?? undefined);
      clearTimeout(closeTimer.current ?? undefined);
    };
  }, []);

  useEffect(() => {
    if (!embla) return;

    const handleSettle = () => {
      recheckHoveredCardRef.current();
    };

    embla.on("settle", handleSettle);

    return () => {
      embla.off("settle", handleSettle);
    };
  }, [embla]);

  useEffect(() => {
    recheckHoveredCardRef.current = recheckHoveredCard;
  });

  return (
    <section>
      {title && <Title order={2}>{title}</Title>}

      <div ref={carouselRef}>
        <Carousel
          className={classes.carousel}
          getEmblaApi={setEmbla}
          slideSize="250px"
          slideGap="md"
          withControls={recipes.length > 1}
          onPointerDownCapture={(event) => {
            const target = event.target;

            if (
              target instanceof Element &&
              target.closest(".mantine-Carousel-controls")
            ) {
              handleNavigation();
            }
          }}
          onSlideChange={handleNavigation}
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
                onHoverStart={(element) => handleHoverStart(recipe, element)}
                onHoverEnd={handleHoverEnd}
                onOpen={() => openRecipe(toPreviewRecipe(recipe))}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>

      {activePreview && (
        <RecipePreview
          recipe={activePreview.recipe}
          origin={activePreview.origin}
          closing={activePreview.closing}
          onClosed={handlePreviewClosed}
          onEnter={clearCloseTimer}
          onLeave={handleHoverEnd}
          onOpen={() => openRecipe(activePreview.recipe)}
        />
      )}

      {selectedRecipe && (
        <RecipeModal
          opened={true}
          onClose={() => setSelectedRecipe(null)}
          id={selectedRecipe.id}
          title={selectedRecipe.title}
          image={selectedRecipe.image}
          cuisine={selectedRecipe.cuisine}
          cookTime={selectedRecipe.cookTime}
          dietaryTags={selectedRecipe.dietaryTags}
        />
      )}
    </section>
  );
}
