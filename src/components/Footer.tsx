import { Box, Stack, Text } from "@mantine/core";
import classes from "./Footer.module.css";
import { greatVibes } from "@/lib/fonts";

export default function Footer() {
  return (
    <Box component="footer" className={classes.footer}>
      <Stack align="center" gap={4}>
        <Text className={classes.chefTitle}>Chef de Cuisine</Text>

        <Text className={`${greatVibes.className} ${classes.chefName}`}>
          Nino Estrada
        </Text>

        <Text className={classes.copyright}>
          © {new Date().getFullYear()} À La Carte
        </Text>
      </Stack>
    </Box>
  );
}
