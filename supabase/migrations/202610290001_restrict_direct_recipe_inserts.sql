-- Require recipe creation through the validated RPC.
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

  IF char_length(btrim(p_title)) > 100 THEN
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
       OR NULLIF(btrim(ingredient->>'name'), '') IS NULL
       OR char_length(btrim(ingredient->>'name')) > 60
       OR char_length(btrim(ingredient->>'quantity')) > 30
       OR char_length(btrim(ingredient->>'unit')) > 30
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
       OR NULLIF(btrim(instruction #>> '{}'), '') IS NULL
       OR char_length(btrim(instruction #>> '{}')) > 1000
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
    btrim(p_title),
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
    btrim(item->>'name'),
    NULLIF(btrim(item->>'quantity'), ''),
    NULLIF(btrim(item->>'unit'), '')
  FROM jsonb_array_elements(p_ingredients) AS item;

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

-- Prevent direct inserts from bypassing recipe validation.
REVOKE INSERT ON TABLE
  public.recipes,
  public.recipe_ingredients,
  public.recipe_instructions
FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.create_recipe(
  text, text, integer, text[], jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_recipe(
  text, text, integer, text[], jsonb, jsonb
) TO authenticated;
