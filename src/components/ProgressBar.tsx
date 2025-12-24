import { Paper, Group, Text, Badge, Progress as MantineProgress } from "@mantine/core";

interface Props {
  progress: number;
  isVisible: boolean;
}

export function ProgressBar({ progress, isVisible }: Props) {
  if (!isVisible) return null;

  return (
    <Paper p="md" radius="lg" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>
          Progress
        </Text>
        <Badge variant="outline" color="dark">
          {progress.toFixed(1)}%
        </Badge>
      </Group>
      <MantineProgress value={progress} size="lg" radius="xl" animated color="dark" />
    </Paper>
  );
}
