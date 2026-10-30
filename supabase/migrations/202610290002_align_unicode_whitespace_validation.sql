-- Match JavaScript's trim() whitespace behavior.
CREATE OR REPLACE FUNCTION public.trim_recipe_text(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $function$
  SELECT pg_catalog.btrim(
    value,
    U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF'
  );
$function$;

-- Reject whitespace-only recipe titles.
ALTER TABLE public.recipes
  DROP CONSTRAINT recipes_title_valid,
  ADD CONSTRAINT recipes_title_valid
    CHECK (
      char_length(public.trim_recipe_text(title)) > 0
      AND char_length(title) <= 100
    );

-- Reject whitespace-only ingredient names.
ALTER TABLE public.recipe_ingredients
  DROP CONSTRAINT recipe_ingredients_name_valid,
  ADD CONSTRAINT recipe_ingredients_name_valid
    CHECK (
      char_length(public.trim_recipe_text(name)) > 0
      AND char_length(name) <= 60
    );

-- Reject whitespace-only instructions.
ALTER TABLE public.recipe_instructions
  DROP CONSTRAINT recipe_instructions_text_valid,
  ADD CONSTRAINT recipe_instructions_text_valid
    CHECK (
      char_length(public.trim_recipe_text(instruction)) > 0
      AND char_length(instruction) <= 1000
    );

-- Align RPC whitespace validation with JavaScript's trim().
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
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_recipe_id uuid;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'authenticated'
     OR (SELECT auth.uid()) IS NULL
  THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate recipe data.
  IF NULLIF(public.trim_recipe_text(p_title), '') IS NULL
     OR p_ingredients IS NULL
     OR jsonb_typeof(p_ingredients) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_ingredients) = 0
     OR p_instructions IS NULL
     OR jsonb_typeof(p_instructions) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_instructions) = 0
  THEN
    RAISE EXCEPTION 'Recipe title, ingredients, and instructions are required';
  END IF;

  IF char_length(public.trim_recipe_text(p_title)) > 100 THEN
    RAISE EXCEPTION 'Recipe title cannot exceed 100 characters';
  END IF;

  IF p_cook_time_minutes IS NOT NULL
     AND p_cook_time_minutes <= 0
  THEN
    RAISE EXCEPTION 'Cooking time must be a positive whole number';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_ingredients) AS ingredient
    WHERE jsonb_typeof(ingredient) IS DISTINCT FROM 'object'
       OR jsonb_typeof(ingredient->'name') IS DISTINCT FROM 'string'
       OR NULLIF(public.trim_recipe_text(ingredient->>'name'), '') IS NULL
       OR char_length(public.trim_recipe_text(ingredient->>'name')) > 60
       OR char_length(public.trim_recipe_text(ingredient->>'quantity')) > 30
       OR char_length(public.trim_recipe_text(ingredient->>'unit')) > 30
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

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_instructions) AS instruction
    WHERE jsonb_typeof(instruction) IS DISTINCT FROM 'string'
       OR NULLIF(public.trim_recipe_text(instruction #>> '{}'), '') IS NULL
       OR char_length(public.trim_recipe_text(instruction #>> '{}')) > 1000
  ) THEN
    RAISE EXCEPTION 'Invalid instruction data';
  END IF;

  -- Create recipe and related records.
  INSERT INTO public.recipes (
    title,
    cuisine,
    cook_time_minutes,
    dietary_tags,
    user_id,
    is_public
  )
  VALUES (
    public.trim_recipe_text(p_title),
    p_cuisine,
    p_cook_time_minutes,
    p_dietary_tags,
    (SELECT auth.uid()),
    false
  )
  RETURNING id INTO v_recipe_id;

  INSERT INTO public.recipe_ingredients (
    recipe_id,
    name,
    quantity,
    unit
  )
  SELECT
    v_recipe_id,
    public.trim_recipe_text(item->>'name'),
    NULLIF(public.trim_recipe_text(item->>'quantity'), ''),
    NULLIF(public.trim_recipe_text(item->>'unit'), '')
  FROM jsonb_array_elements(p_ingredients) AS item;

  INSERT INTO public.recipe_instructions (
    recipe_id,
    step_number,
    instruction
  )
  SELECT
    v_recipe_id,
    step_number::integer,
    public.trim_recipe_text(instruction)
  FROM jsonb_array_elements_text(p_instructions)
    WITH ORDINALITY AS steps(instruction, step_number);

  RETURN v_recipe_id;
END;
$function$;