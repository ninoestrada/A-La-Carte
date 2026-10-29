-- Enforce recipe validation for all database writes.
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_title_valid
    CHECK (
      title ~ '[^[:space:]]'
      AND char_length(title) <= 100
    ),
  ADD CONSTRAINT recipes_cook_time_valid
    CHECK (
      cook_time_minutes IS NULL
      OR cook_time_minutes > 0
    );

-- Enforce ingredient validation for all database writes.
ALTER TABLE public.recipe_ingredients
  ADD CONSTRAINT recipe_ingredients_name_valid
    CHECK (
      name ~ '[^[:space:]]'
      AND char_length(name) <= 60
    ),
  ADD CONSTRAINT recipe_ingredients_quantity_valid
    CHECK (
      quantity IS NULL
      OR char_length(quantity) <= 30
    ),
  ADD CONSTRAINT recipe_ingredients_unit_valid
    CHECK (
      unit IS NULL
      OR char_length(unit) <= 30
    );

-- Enforce instruction validation for all database writes.
ALTER TABLE public.recipe_instructions
  ADD CONSTRAINT recipe_instructions_text_valid
    CHECK (
      instruction ~ '[^[:space:]]'
      AND char_length(instruction) <= 1000
    );

