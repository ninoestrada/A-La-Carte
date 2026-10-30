
-- Strengthen ingredient and instruction validation.
-- Keep the existing recipe creation behavior unchanged.

CREATE OR REPLACE FUNCTION public.create_recipe(
  p_title text,
  p_cuisine text,
  p_cook_time_minutes integer,
  p_dietary_tags text[],
  p_ingredients jsonb,
  p_instructions jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_recipe_id uuid;
BEGIN
  -- Validate required information.
  IF NULLIF(btrim(p_title), '') IS NULL
     OR p_ingredients IS NULL
     OR jsonb_typeof(p_ingredients) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_ingredients) = 0
     OR p_instructions IS NULL
     OR jsonb_typeof(p_instructions) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_instructions) = 0
  THEN
    RAISE EXCEPTION 'Recipe title, ingredients, and instructions are required';
  END IF;

  -- Validate ingredient structure and required fields.
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_ingredients) AS ingredient
    WHERE jsonb_typeof(ingredient) IS DISTINCT FROM 'object'
       OR jsonb_typeof(ingredient->'name') IS DISTINCT FROM 'string'
       OR NULLIF(btrim(ingredient->>'name'), '') IS NULL
       OR (
         ingredient ? 'quantity'
         AND jsonb_typeof(ingredient->'quantity') IS DISTINCT FROM 'string'
         AND jsonb_typeof(ingredient->'quantity') IS DISTINCT FROM 'null'
       )
       OR (
         ingredient ? 'unit'
         AND jsonb_typeof(ingredient->'unit') IS DISTINCT FROM 'string'
         AND jsonb_typeof(ingredient->'unit') IS DISTINCT FROM 'null'
       )
  ) THEN
    RAISE EXCEPTION 'Invalid ingredient data';
  END IF;

  -- Validate that every instruction is a nonempty string.
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_instructions) AS instruction
    WHERE jsonb_typeof(instruction) IS DISTINCT FROM 'string'
       OR NULLIF(btrim(instruction #>> '{}'), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid instruction data';
  END IF;

  -- Create the recipe.
  INSERT INTO public.recipes (
    title,
    cuisine,
    cook_time_minutes,
    dietary_tags,
    user_id,
    is_public
  )
  VALUES (
    btrim(p_title),
    p_cuisine,
    p_cook_time_minutes,
    p_dietary_tags,
    (SELECT auth.uid()),
    false
  )
  RETURNING id INTO v_recipe_id;

  -- Create its ingredients.
  INSERT INTO public.recipe_ingredients (
    recipe_id,
    name,
    quantity,
    unit
  )
  SELECT
    v_recipe_id,
    btrim(item->>'name'),
    NULLIF(btrim(item->>'quantity'), ''),
    NULLIF(btrim(item->>'unit'), '')
  FROM jsonb_array_elements(p_ingredients) AS item;

  -- Create its instructions.
  INSERT INTO public.recipe_instructions (
    recipe_id,
    step_number,
    instruction
  )
  SELECT
    v_recipe_id,
    step_number::integer,
    btrim(instruction)
  FROM jsonb_array_elements_text(p_instructions)
    WITH ORDINALITY AS steps(instruction, step_number);

  RETURN v_recipe_id;
END;
$function$;
