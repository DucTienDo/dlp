import { Paper, Group, Text, Badge, ScrollArea, Stack, MultiSelect, ActionIcon, Tooltip } from "@mantine/core";
import { IconTerminal2, IconTrash, IconFilter } from "@tabler/icons-react";
import { RefObject, useState, useMemo } from "react";

export interface LogEntry {
  message: string;
  timestamp: string;
  count: number;
}

interface Props {
  logs: LogEntry[];
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  height?: number | string;
  onClear?: () => void;
}

interface ParsedLog {
  label: string;
  message: string;
  color: string;
}

function parseLog(log: string): ParsedLog {
  // Extract label from [...] brackets
  const labelMatch = log.match(/\[([^\]]+)\]/);
  let label = "info";
  let message = log;

  if (labelMatch) {
    label = labelMatch[1].toLowerCase();
    // Remove the label from the message
    message = log.replace(/\[[^\]]+\]\s*/, "").trim();
  }

  // Determine color based on label
  let color = "gray";
  if (label.includes("download")) {
    color = "blue";
  } else if (label.includes("error")) {
    color = "red";
  } else if (label.includes("warning")) {
    color = "yellow";
  } else if (label.includes("info")) {
    color = "gray";
  } else if (label.includes("success")) {
    color = "green";
  } else if (label.includes("debug")) {
    color = "dimmed";
  }

  return { label, message, color };
}

export function LogViewer({ logs, scrollAreaRef, height = 450, onClear }: Props) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Memoize unique labels for the filter dropdown
  const availableLabels = useMemo(() => {
    const labels = new Set<string>();
    logs.forEach(log => {
      const match = log.message.match(/\[([^\]]+)\]/);
      if (match) {
        labels.add(match[1].toLowerCase());
      } else {
        labels.add("info");
      }
    });
    return Array.from(labels).sort();
  }, [logs]);

  // Filter logs based on selection
  const filteredLogs = useMemo(() => {
    if (selectedLabels.length === 0) return logs;
    return logs.filter(log => {
      const match = log.message.match(/\[([^\]]+)\]/);
      const label = match ? match[1].toLowerCase() : "info";
      return selectedLabels.includes(label);
    });
  }, [logs, selectedLabels]);

  return (
    <Paper p="lg" radius="lg" withBorder style={{ background: "rgba(2, 1, 1, 0.03)", height: "100%", display: "flex", flexDirection: "column" }}>
      <Group gap="xs" mb="md" justify="space-between">
        <Group gap="xs">
          <IconTerminal2 size={18} />
          <Text fw={500}>Output Logs</Text>
          {filteredLogs.length > 0 && (
            <Badge variant="light" color="gray" size="sm">
              {filteredLogs.length} lines
            </Badge>
          )}
        </Group>

        <Group gap={8}>
          <MultiSelect
            data={availableLabels}
            value={selectedLabels}
            onChange={setSelectedLabels}
            placeholder="Filter labels"
            size="xs"
            style={{ width: 540 }}
            clearable
            leftSection={<IconFilter size={12} />}
          />
          {onClear && (
            <Tooltip label="Clear logs">
              <ActionIcon variant="subtle" color="gray" onClick={onClear} size="input-xs">
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
      <ScrollArea
        h={height}
        type="auto"
        viewportRef={scrollAreaRef}
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          padding: "12px",
          fontFamily: `"Consolas", "Monaco", "Meiryo", "Yu Gothic UI", "MS PGothic", "MS Gothic", monospace`,
          fontSize: "12px",
        }}
      >
        {filteredLogs.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            {logs.length === 0 ? "Waiting for download to start..." : "No logs match filter"}
          </Text>
        ) : (
          <Stack gap={4}>
            {filteredLogs.map((log, index) => {
              const parsed = parseLog(log.message);
              return (
                <Group key={index} gap="xs" wrap="nowrap" align="flex-start">
                  <Group gap={4} wrap="nowrap" style={{ minWidth: "110px", flexShrink: 0 }}>
                    <Text size="xs" c="dimmed">
                      {log.timestamp}
                    </Text>
                    {log.count > 1 && (
                      <Badge size="xs" variant="filled" color="gray" circle>
                        {log.count}
                      </Badge>
                    )}
                  </Group>
                  <Badge
                    size="xs"
                    variant="light"
                    color={parsed.color}
                    style={{ minWidth: "80px", flexShrink: 0 }}
                  >
                    {parsed.label}
                  </Badge>
                  <Text
                    size="xs"
                    c={parsed.color}
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1 }}
                  >
                    {parsed.message}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        )}
      </ScrollArea>
    </Paper>
  );
}
