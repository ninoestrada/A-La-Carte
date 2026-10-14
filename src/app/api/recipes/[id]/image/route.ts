import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Retrieve the recipe using the visitor's permissions.
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("image_url, user_id")
    .eq("id", id)
    .maybeSingle();

  if (recipeError) {
    console.error("Error retrieving recipe:", recipeError);
    return new NextResponse("Unable to load image", { status: 500 });
  }

  if (!recipe?.image_url) {
    return new NextResponse("Image not found", { status: 404 });
  }

  // 2. The database stores a Storage path, not a public URL.
  const filePath = recipe.image_url;
  const parts = filePath.split("/");

  // Verify the image belongs to the recipe and its owner.
  if (parts.length !== 3 || parts[0] !== recipe.user_id || parts[1] !== id) {
    return new NextResponse("Image not found", { status: 404 });
  }

  // 3. Download the photo using the visitor's Supabase session.
  const { data: image, error: downloadError } = await supabase.storage
    .from("recipe-images")
    .download(filePath);

  if (downloadError || !image) {
    return new NextResponse("Image not found", { status: 404 });
  }

  // 4. Return the image without allowing it to be cached.
  return new NextResponse(image, {
    headers: {
      "Content-Type": image.type || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
