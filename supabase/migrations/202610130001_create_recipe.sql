-- Create a recipe and its ingredients and instructions.
-- New recipes belong to the signed-in user and are private by default.

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

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_ingredients) AS item
    WHERE NULLIF(btrim(item->>'name'), '') IS NULL
      ) OR EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(p_instructions) AS item(instruction)
    WHERE NULLIF(btrim(item.instruction), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'Ingredients and instructions cannot be empty';
  END IF;

  -- Create the recipe.
  INSERT INTO public.recipes (
    title, cuisine, cook_time_minutes,
    dietary_tags, user_id, is_public
  )
  VALUES (
    btrim(p_title), p_cuisine, p_cook_time_minutes,
    p_dietary_tags, (SELECT auth.uid()), false
  )
  RETURNING id INTO v_recipe_id;

  -- Create its ingredients.
  INSERT INTO public.recipe_ingredients (
    recipe_id, name, quantity, unit
  )
  SELECT
    v_recipe_id,
    btrim(item->>'name'),
    NULLIF(btrim(item->>'quantity'), ''),
    NULLIF(btrim(item->>'unit'), '')
  FROM jsonb_array_elements(p_ingredients) AS item;

  -- Create its instructions.
  INSERT INTO public.recipe_instructions (
    recipe_id, step_number, instruction
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

-- Only signed-in users can create recipes.
REVOKE EXECUTE ON FUNCTION public.create_recipe(
  text, text, integer, text[], jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_recipe(
  text, text, integer, text[], jsonb, jsonb
) TO authenticated;

-- Enable row-level security.
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_instructions ENABLE ROW LEVEL SECURITY;

-- Recipes: anyone can read public recipes.
CREATE POLICY "Public can read public recipes"
ON public.recipes
FOR SELECT TO public
USING (is_public = true);

-- Recipes: signed-in users can read their own recipes.
CREATE POLICY "Users can read their own recipes"
ON public.recipes
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Recipes: signed-in users can create recipes for themselves.
CREATE POLICY "Users can create their own recipes"
ON public.recipes
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Ingredients: readable when the recipe is public or owned by the user.
CREATE POLICY "Allow public read access to ingredients"
ON public.recipe_ingredients
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
      AND (
        recipes.is_public = true
        OR recipes.user_id = (SELECT auth.uid())
      )
  )
);

-- Ingredients: only owners can add ingredients.
CREATE POLICY "Users can add ingredients to their own recipes"
ON public.recipe_ingredients
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = (SELECT auth.uid())
  )
);

-- Instructions: readable when the recipe is public or owned by the user.
CREATE POLICY "Allow public read access to instructions"
ON public.recipe_instructions
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_instructions.recipe_id
      AND (
        recipes.is_public = true
        OR recipes.user_id = (SELECT auth.uid())
      )
  )
);

-- Instructions: only owners can add instructions.
CREATE POLICY "Users can add instructions to their own recipes"
ON public.recipe_instructions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = (SELECT auth.uid())
  )
);
