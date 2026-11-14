"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button, Paper, Text, Title } from "@mantine/core";
import { IconBook2 } from "@tabler/icons-react";
import gsap from "gsap";
import classes from "./RecipePreview.module.css";

export interface PreviewRecipe {
  id: string;
  title: string;
  image: string;
  cuisine: string | null;
  cookTime: number | null;
  dietaryTags: string[] | null;
}

interface RecipePreviewProps {
  recipe: PreviewRecipe;
  origin: DOMRect;
  onOpen: () => void;
  onLeave: () => void;
  onEnter: () => void;
  closing: boolean;
  onClosed: () => void;
}

export default function RecipePreview({
  recipe,
  origin,
  onOpen,
  onLeave,
  onEnter,
  closing,
  onClosed,
}: RecipePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const width = Math.min(320, window.innerWidth - 24);
  const height = 400;

  const left = Math.max(
    12,
    Math.min(
      origin.left + origin.width / 2 - width / 2,
      window.innerWidth - width - 12,
    ),
  );

  const top = Math.max(
    12,
    Math.min(
      origin.top + origin.height / 2 - height / 2,
      window.innerHeight - height - 12,
    ),
  );

  useLayoutEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      if (closing) onClosed();
      return;
    }

    const animation = closing
      ? gsap.to(element, {
          x: origin.left - left,
          y: origin.top - top,
          width: origin.width,
          height: origin.height,
          opacity: 0,
          filter: "blur(3px)",
          duration: 0.32,
          ease: "power2.inOut",
          onComplete: onClosed,
        })
      : gsap.fromTo(
          element,
          {
            x: origin.left - left,
            y: origin.top - top,
            width: origin.width,
            height: origin.height,
            opacity: 0.85,
            filter: "blur(2px)",
          },
          {
            x: 0,
            y: 0,
            width,
            height,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.55,
            ease: "power3.out",
          },
        );

    return () => {
      animation.kill();
    };
  }, [closing, origin, left, top, width, height, onClosed]);

  return createPortal(
    <Paper
      ref={previewRef}
      className={classes.preview}
      shadow="xl"
      radius="md"
      style={{
        top,
        left,
        width,
        height,
        pointerEvents: closing ? "none" : "auto",
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div
        className={classes.image}
        style={{
          backgroundImage: recipe.image ? `url("${recipe.image}")` : "none",
        }}
      />

      <div className={classes.content}>
        <Title order={3} c="white" size="lg">
          {recipe.title}
        </Title>

        <Text size="sm" c="gray.5">
          {[
            recipe.cuisine,
            recipe.cookTime !== null ? `${recipe.cookTime} min` : null,
          ]
            .filter(Boolean)
            .join(" • ")}
        </Text>

        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <Text size="xs" c="gray.4">
            {recipe.dietaryTags.join(" • ")}
          </Text>
        )}

        <Button
          fullWidth
          color="gray"
          variant="white"
          leftSection={<IconBook2 size={18} />}
          onClick={onOpen}
        >
          View Recipe
        </Button>
      </div>
    </Paper>,
    document.body,
  );
}
