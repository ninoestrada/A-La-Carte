import { supabase } from "@/lib/supabaseClient";

export default async function HomePage() {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <pre style={{ color: "red" }}>{error.message}</pre>;

  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 16 }}>À La Carte</h1>
      <ul style={{ lineHeight: "1.8" }}>
        {data?.map((recipe) => (
          <li key={recipe.id}>{recipe.title}</li>
        ))}
      </ul>
    </main>
  );
}
