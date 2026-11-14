import type { ComponentType } from "react";

import {
  Pasta,
  Garlic,
  OliveOil,
  Tomato,
  Eggs,
  Basil,
  Parmesan,
  Butter,
  Onion,
  Salt,
} from "food-icon-pack/react";

interface IngredientIllustrationProps {
  name: string;
  size?: number;
}

type FoodIcon = ComponentType<{
  size?: number;
  color?: string;
  className?: string;
}>;

const ingredientIcons: Record<string, FoodIcon> = {
  spaghetti: Pasta,
  pasta: Pasta,
  garlic: Garlic,
  "olive oil": OliveOil,
  tomato: Tomato,
  tomatoes: Tomato,
  egg: Eggs,
  eggs: Eggs,
  basil: Basil,
  parmesan: Parmesan,
  butter: Butter,
  onion: Onion,
  onions: Onion,
  salt: Salt,
};

export function IngredientIllustration({
  name,
  size = 40,
}: IngredientIllustrationProps) {
  const normalizedName = name.toLowerCase().trim();

  const matchingIngredient = Object.keys(ingredientIcons)
    .sort((a, b) => b.length - a.length)
    .find((ingredient) => {
      const pattern = new RegExp(
        `(^|[^a-z])${ingredient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`,
      );

      return pattern.test(normalizedName);
    });

  if (!matchingIngredient) {
    return null;
  }

  const Icon = ingredientIcons[matchingIngredient];

  return <Icon size={size} color="#786e63" aria-label={name} />;
}
