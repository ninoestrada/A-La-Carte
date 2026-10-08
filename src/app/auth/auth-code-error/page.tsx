import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        backgroundColor: "#141414",
        color: "#ffffff",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <h1>Sign-in failed</h1>

      <p>Something went wrong while signing in. Please try again.</p>

      <Link href="/">Back to À La Carte</Link>
    </main>
  );
}
