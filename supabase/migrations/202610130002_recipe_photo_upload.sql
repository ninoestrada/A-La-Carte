-- Create the recipe images Storage bucket
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'recipe-images',
  'recipe-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow authenticated users to upload images
-- only into folders matching their user ID.
CREATE POLICY "Users can upload their own recipe images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Allow authenticated users to update
-- only recipes they own.
CREATE POLICY "Users can update their own recipes"
ON public.recipes
FOR UPDATE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
)
WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- Allow reading images for public recipes or recipes owned by the user.
CREATE POLICY "Read accessible recipe images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'recipe-images'
  AND EXISTS (
    SELECT 1
    FROM public.recipes AS r
    WHERE r.id::text = (storage.foldername(name))[2]
      AND r.user_id::text = (storage.foldername(name))[1]
      AND (
        r.is_public = true
        OR r.user_id = (SELECT auth.uid())
      )
  )
);
