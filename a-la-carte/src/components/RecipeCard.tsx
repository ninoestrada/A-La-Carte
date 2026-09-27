import classes from "./RecipeCard.module.css";
import { Paper, Title } from "@mantine/core";

interface RecipeCardProps {
  image: string;
  title: string;
}

export default function RecipeCard({ image, title }: RecipeCardProps) {
  return (
    <Paper
      className={classes.card}
      shadow="md"
      radius="md"
      style={{
        backgroundImage: `
          linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8),
            rgba(0, 0, 0, 0) 60%
          ),
          url(${image})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: 300,
        width: 250,
        display: "flex",
        alignItems: "flex-end",
        padding: 20,
        overflow: "hidden",
      }}
    >
      <Title order={3} c="white">
        {title}
      </Title>
    </Paper>
  );
}
