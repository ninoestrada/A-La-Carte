import { Paper, Title } from "@mantine/core";

interface RecipeCardProps {
  image: string;
  title: string;
}

export default function RecipeCard({ image, title }: RecipeCardProps) {
  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: 300,
        width: 250,
      }}
    >
      <Title order={3}>{title}</Title>
    </Paper>
  );
}
