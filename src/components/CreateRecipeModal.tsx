"use client";

import { Modal, Divider, Stack, Text } from "@mantine/core";
import { IconArrowLeft, IconX } from "@tabler/icons-react";

import CreateRecipeForm from "./CreateRecipeForm";
import Footer from "./Footer";
import { cormorant, greatVibes } from "@/lib/fonts";

import modalClasses from "./FullRecipeModal.module.css";
import classes from "./CreateRecipeModal.module.css";

interface CreateRecipeModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (recipeId: string) => void;
}

export default function CreateRecipeModal({
  opened,
  onClose,
  onSuccess,
}: CreateRecipeModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="100%"
      centered
      withCloseButton={false}
      padding={0}
      radius={0}
      scrollAreaComponent={undefined}
      closeOnEscape
      classNames={{
        overlay: modalClasses.overlay,
        content: modalClasses.modalContent,
        body: modalClasses.modalBody,
        inner: modalClasses.modalInner,
      }}
      transitionProps={{
        transition: "pop",
        duration: 450,
        timingFunction: "ease",
      }}
      title="Create Recipe"
      styles={{ header: { display: "none" } }}
    >
      <main className={modalClasses.recipePaper}>
        <div className={modalClasses.topBar}>
          <button
            type="button"
            className={`${cormorant.className} ${modalClasses.backLink}`}
            onClick={onClose}
          >
            <IconArrowLeft size={18} stroke={1.6} />
            Back to Menu
          </button>

          <button
            type="button"
            className={modalClasses.closeButton}
            onClick={onClose}
            aria-label="Close create recipe"
          >
            <IconX size={20} stroke={1.6} />
          </button>
        </div>

        <Stack gap="lg">
          <header className={modalClasses.header}>
            <Text
              className={`${greatVibes.className} ${modalClasses.menuTitle}`}
            >
              À La Carte
            </Text>

            <h1
              className={`${cormorant.className} ${modalClasses.recipeTitle}`}
            >
              Create Recipe
            </h1>
          </header>

          <Divider className={modalClasses.divider} />

          <div className={classes.formContainer}>
            <CreateRecipeForm onSuccess={onSuccess} embedded />
          </div>

          <Divider className={modalClasses.divider} />

          <Footer />
        </Stack>
      </main>
    </Modal>
  );
}
