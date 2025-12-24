import { Box, Group, Title, Text, ThemeIcon } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

export function Header() {
  return (
    <Box ta="center">
      <Group justify="center" gap="sm" mb="xs">
        <ThemeIcon
          size={56}
          radius="xl"
          color="white"
          style={{
            border: '2px solid #000',
            color: '#000',
            boxShadow: '3px 3px 0px #000',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
          }}
        >
          <IconDownload size={32} />
        </ThemeIcon>
      </Group>
      <Title
        order={1}
        mb="xs"
        style={{
          textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
        }}
      >
        DLP Dashboard
      </Title>
      <Text c="dimmed" size="sm" mt="xs" style={{ fontStyle: 'italic' }}>
        Download videos, playlists, and channels from YouTube
      </Text>
    </Box>
  );
}
