import { createElement, type ComponentType } from "react";
import * as FoodIcons from "food-icon-pack/react";

interface IngredientIllustrationProps {
  name: string;
  size?: number;
}

type FoodIcon = ComponentType<{
  size?: number;
  color?: string;
  className?: string;
  "aria-label"?: string;
}>;

// Only map names that differ from the library's exports.
const aliases: Record<string, string> = {
  spaghetti: "Pasta",
  egg: "Eggs",
  eggs: "Eggs",
  milk: "BeveragesMilk",
  tomatoes: "Tomato",
  onions: "Onion",
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Build the lookup once, outside the component.
const iconLookup = new Map<string, FoodIcon>(
  Object.entries(FoodIcons).map(([name, Icon]) => [
    normalizeName(name),
    Icon as FoodIcon,
  ]),
);

// Sort longer names first, as in your original implementation.
const ingredientNames = [
  ...new Set([...Object.keys(aliases), ...iconLookup.keys()]),
].sort((a, b) => b.length - a.length);

// Match ingredient names, including names with quantities or descriptions.
function getIngredientIcon(name: string): FoodIcon | undefined {
  const normalizedName = name.toLowerCase().trim();

  const matchingIngredient = ingredientNames.find((ingredient) => {
    const pattern = new RegExp(
      `(^|[^a-z])${ingredient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`,
    );

    return pattern.test(normalizedName);
  });

  if (!matchingIngredient) {
    return undefined;
  }

  const iconName = aliases[matchingIngredient] ?? matchingIngredient;

  return iconLookup.get(normalizeName(iconName));
}

export function IngredientIllustration({
  name,
  size = 40,
}: IngredientIllustrationProps) {
  const Icon = getIngredientIcon(name);

  if (!Icon) {
    return null;
  }

  return createElement(Icon, {
    size,
    color: "#786e63",
    "aria-label": name,
  });
}
