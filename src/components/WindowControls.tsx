import { ActionIcon, Group, Box } from "@mantine/core";
import { IconMinus, IconX } from "@tabler/icons-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";

export function WindowControls() {
  const appWindow = getCurrentWindow();
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      data-tauri-drag-region
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "40px",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingRight: "10px",
      }}
    >
      <Group gap="xs" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
        <ActionIcon
          onClick={() => appWindow.minimize()}
          variant="filled"
          color="yellow"
          size="md"
          radius="xl"
        >
          <IconMinus size={16} stroke={3} />
        </ActionIcon>
        <ActionIcon
          onClick={() => appWindow.close()}
          variant="filled"
          color="red"
          size="md"
          radius="xl"
        >
          <IconX size={16} stroke={3} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
