"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Container,
  FileInput,
  Group,
  Image,
  MultiSelect,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";

export default function CreateRecipePage() {
  const router = useRouter();

  // 1. State
  const [title, setTitle] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookTime, setCookTime] = useState<number | string>("");

  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState([""]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 2. Ingredient and instruction functions
  function addInstruction() {
    setInstructions([...instructions, ""]);
  }

  function removeInstruction(index: number) {
    setInstructions(instructions.filter((_, i) => i !== index));
  }

  function updateInstruction(index: number, value: string) {
    setInstructions(
      instructions.map((instruction, i) => (i === index ? value : instruction)),
    );
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(
    index: number,
    field: "name" | "quantity" | "unit",
    value: string,
  ) {
    setIngredients(
      ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  }

  const isFormValid =
    title.trim().length > 0 &&
    ingredients.every((ingredient) => ingredient.name.trim().length > 0) &&
    instructions.every((instruction) => instruction.trim().length > 0);

  // 3. Photo selection, validation, and preview
  function handlePhotoChange(file: File | null) {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        alert("Please select a JPEG, PNG, or WebP image.");
        setPhoto(null);
        setPhotoPreview(null);
        return;
      }

      if (file.size > maxSize) {
        alert("Photo must be smaller than 5 MB.");
        setPhoto(null);
        setPhotoPreview(null);
        return;
      }
    }

    setPhoto(file);

    if (!file) {
      setPhotoPreview(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  // 4. Save recipe and upload photo
  async function handleSaveRecipe() {
    if (!isFormValid || isSaving) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Please sign in to create a recipe.");
        return;
      }

      const { data: recipeId, error: saveError } = await supabase.rpc(
        "create_recipe",
        {
          p_title: title.trim(),
          p_cuisine: cuisine.trim() || null,
          p_cook_time_minutes: cookTime === "" ? null : Number(cookTime),
          p_dietary_tags: dietaryTags,
          p_ingredients: ingredients.map((ingredient) => ({
            name: ingredient.name.trim(),
            quantity: ingredient.quantity.trim(),
            unit: ingredient.unit.trim(),
          })),
          p_instructions: instructions.map((instruction) => instruction.trim()),
        },
      );

      if (saveError) {
        alert("Failed to save recipe: " + saveError.message);
        return;
      }

      if (!recipeId) {
        alert("Recipe was not created.");
        return;
      }

      if (photo) {
        const extension = photo.name.split(".").pop()?.toLowerCase();
        const filePath = `${user.id}/${recipeId}/${crypto.randomUUID()}.${extension}`;

        // Upload photo to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("recipe-images")
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false,
          });

        if (uploadError) {
          alert(
            "Recipe saved, but photo upload failed: " + uploadError.message,
          );
          return;
        }

        // Save the Storage file path instead of a public URL
        const { error: updateError } = await supabase
          .from("recipes")
          .update({ image_url: filePath })
          .eq("id", recipeId)
          .eq("user_id", user.id)
          .select("id")
          .single();

        if (updateError) {
          alert(
            "Photo uploaded, but failed to link it to the recipe: " +
              updateError.message,
          );
          return;
        }
      }

      router.push(`/recipes/${recipeId}`);
    } catch (error) {
      console.error("Unexpected error saving recipe:", error);
      alert("An unexpected error occurred while saving the recipe.");
    } finally {
      setIsSaving(false);
    }
  }

  // 5. JSX
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        Create Recipe
      </Title>

      <Stack gap="md">
        <TextInput
          label="Recipe Title"
          placeholder="e.g. Spaghetti Carbonara"
          required
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
        />

        <FileInput
          label="Recipe Photo"
          placeholder="Choose a photo"
          accept="image/jpeg,image/png,image/webp"
          value={photo}
          onChange={handlePhotoChange}
          clearable
        />

        {photoPreview && (
          <Image
            src={photoPreview}
            alt="Recipe preview"
            radius="md"
            fit="cover"
            h={250}
          />
        )}

        <TextInput
          label="Cuisine"
          placeholder="e.g. Italian"
          value={cuisine}
          onChange={(event) => setCuisine(event.currentTarget.value)}
        />

        <NumberInput
          label="Cook Time (minutes)"
          placeholder="e.g. 30"
          min={1}
          allowDecimal={false}
          value={cookTime}
          onChange={setCookTime}
        />

        <MultiSelect
          label="Dietary Tags"
          placeholder="Select dietary preferences"
          data={[
            "Vegetarian",
            "Vegan",
            "Gluten-Free",
            "Dairy-Free",
            "Nut-Free",
            "Low-Carb",
            "High-Protein",
          ]}
          value={dietaryTags}
          onChange={setDietaryTags}
          searchable
          clearable
        />

        <Title order={2} mt="md">
          Ingredients
        </Title>

        {ingredients.map((ingredient, index) => (
          <Group key={index} align="end" grow>
            <TextInput
              label="Ingredient"
              placeholder="e.g. Flour"
              required
              value={ingredient.name}
              onChange={(event) =>
                updateIngredient(index, "name", event.currentTarget.value)
              }
            />

            <TextInput
              label="Quantity"
              placeholder="e.g. 2"
              value={ingredient.quantity}
              onChange={(event) =>
                updateIngredient(index, "quantity", event.currentTarget.value)
              }
            />

            <TextInput
              label="Unit"
              placeholder="e.g. cups"
              value={ingredient.unit}
              onChange={(event) =>
                updateIngredient(index, "unit", event.currentTarget.value)
              }
            />

            <Button
              color="red"
              variant="subtle"
              onClick={() => removeIngredient(index)}
              disabled={ingredients.length === 1}
            >
              Remove
            </Button>
          </Group>
        ))}

        <Button variant="outline" onClick={addIngredient}>
          + Add Ingredient
        </Button>

        <Title order={2} mt="md">
          Cooking Instructions
        </Title>

        {instructions.map((instruction, index) => (
          <Group key={index} align="end">
            <Textarea
              label={`Step ${index + 1}`}
              placeholder="Describe what to do..."
              required
              autosize
              minRows={2}
              style={{ flex: 1 }}
              value={instruction}
              onChange={(event) =>
                updateInstruction(index, event.currentTarget.value)
              }
            />

            <Button
              color="red"
              variant="subtle"
              onClick={() => removeInstruction(index)}
              disabled={instructions.length === 1}
            >
              Remove
            </Button>
          </Group>
        ))}

        <Button variant="outline" onClick={addInstruction}>
          + Add Step
        </Button>

        <Button
          disabled={!isFormValid || isSaving}
          loading={isSaving}
          onClick={handleSaveRecipe}
        >
          Save Recipe
        </Button>
      </Stack>
    </Container>
  );
}
