import { useState, useEffect, useRef } from "react";
import { Container, Stack, Progress, Badge, Group, Paper, Text, Grid, ScrollArea, ThemeIcon } from "@mantine/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { IconCheck, IconPlaylist } from "@tabler/icons-react";
import { LogViewer, LogEntry } from "./LogViewer";
import formatCodes from "../assets/yt_format_codes.json";

interface FinishedVideo {
  title: string;
  format: string;
  //type will be Video or Audio or Legacy
  type: string;
}

const getFormatString = (code: string): string => {
  if (!code) return "";
  code = code.split("-")[0];
  const numCode = parseInt(code);
  if (isNaN(numCode)) return code;

  // Search in dash_video (most common for f-codes)
  // @ts-ignore
  const videoFormats = formatCodes.dash_video.formats;
  for (const [resolution, formats] of Object.entries(videoFormats)) {
    // @ts-ignore
    for (const [codec, codes] of Object.entries(formats)) {
      if (Array.isArray(codes) && codes.includes(numCode)) {
        return `Video ${resolution}`;
      }
    }
  }

  // Check dash_audio
  // @ts-ignore
  const audioFormat = formatCodes.dash_audio.formats.find((f: any) => f.code === numCode);
  if (audioFormat) return `Audio ${audioFormat.bitrate}`;

  //check legacy
  const legacyFormat = formatCodes.legacy_formats.formats.find((f: any) => f.code === numCode);
  if (legacyFormat) return `Legacy ${legacyFormat.notes ? legacyFormat.notes : legacyFormat.video + ' + ' + legacyFormat.audio}`;

  return `Format ${code}`;
}

export function ProgressWindowContent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState("");
  const [eta, setEta] = useState("");
  const [title, setTitle] = useState("");
  const [currentFormat, setCurrentFormat] = useState("");
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // New state for 2-column layout
  const [finishedVideos, setFinishedVideos] = useState<FinishedVideo[]>([]);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [itemIndex, setItemIndex] = useState("");

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const window = getCurrentWebviewWindow();
  const windowLabel = window.label;

  // Sleep timer countdown
  useEffect(() => {
    let interval: number;
    if (sleepRemaining !== null && sleepRemaining > 0) {
      interval = setInterval(() => {
        setSleepRemaining((prev) => {
          if (prev === null || prev <= 0) return null;
          return Math.max(0, prev - 0.1);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [sleepRemaining !== null]);

  useEffect(() => {
    const setupListeners = async () => {
      // Helper to update logs with deduplication and progress replacement
      const updateLogs = (prev: LogEntry[], message: string): LogEntry[] => {
        const timestamp = new Date().toLocaleTimeString();

        if (prev.length > 0) {
          const lastLog = prev[prev.length - 1];

          // Check if message is exact same as previous
          if (lastLog.message === message) {
            return [
              ...prev.slice(0, -1),
              { ...lastLog, count: lastLog.count + 1 },
            ];
          }

          // Check if this is a download progress message replacement
          const isDownloadProgress = /\[download\]\s+[\d.]+%/.test(message);
          if (isDownloadProgress) {
            const lastIsDownloadProgress = /\[download\]\s+[\d.]+%/.test(lastLog.message);
            if (lastIsDownloadProgress) {
              // Replace the last download progress message
              return [...prev.slice(0, -1), { message, timestamp, count: 1 }];
            }
          }
        }

        // Otherwise, append the new message
        return [...prev, { message, timestamp, count: 1 }];
      };

      // Listen for stdout from this specific window
      await listen<string>(`${windowLabel}-stdout`, (event) => {
        const payload = event.payload;

        setLogs((prev) => updateLogs(prev, payload));

        // Parse progress
        const progressMatch = payload.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch) {
          const val = parseFloat(progressMatch[1]);
          setProgress(val);
          // If we see download progress, cancel sleep timer
          setSleepRemaining(null);
        }

        // Parse Playlist Title
        const playlistMatch = payload.match(/Downloading playlist:\s+(.+)/);
        if (playlistMatch) {
          setPlaylistTitle(playlistMatch[1]);
        }

        // Parse Item Index
        const itemMatch = payload.match(/Downloading item\s+(\d+)\s+of\s+(\d+)/);
        if (itemMatch) {
          setItemIndex(`${itemMatch[1]} of ${itemMatch[2]}`);
        }

        // Parse speed
        const speedMatch = payload.match(/at\s+([^\s]+)/);
        if (speedMatch) {
          setSpeed(speedMatch[1]);
        }

        // Parse ETA
        const etaMatch = payload.match(/ETA\s+([^\s]+)/);
        if (etaMatch) {
          setEta(etaMatch[1]);
        }

        // Parse Sleep
        const sleepMatch = payload.match(/Sleeping\s+([\d.]+)\s+seconds/);
        if (sleepMatch) {
          setSleepRemaining(parseFloat(sleepMatch[1]));
        }

        // Parse Skipped
        const skipMatch = payload.match(/(?:\[.*?\]\s*)?(.+) does not pass filter .+ skipping \.\./);
        if (skipMatch) {
          const skippedTitle = skipMatch[1].trim();
          setFinishedVideos((prev) => {
            if (!prev.some(v => v.title === skippedTitle && v.format === "Skipped")) {
              return [...prev, { title: skippedTitle, format: "Skipped", type: "Skip" }];
            }
            return prev;
          });
        }

        // // Auto-scroll
        // setTimeout(() => {
        //   if (scrollAreaRef.current) {
        //     scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        //   }
        // }, 50);
      });

      // Listen for title updates
      await listen<string>(`${windowLabel}-title`, (event) => {
        const rawTitle = event.payload;
        // Check for format code suffix like .f399 or f251-
        const match = rawTitle.match(/(.+?)\.f(\d+)/);
        if (match) {
          setCurrentFormat(match[2]);
          setTitle(match[1]);
        } else {
          setTitle(rawTitle);
        }
      });

      // Listen for stderr
      await listen<string>(`${windowLabel}-stderr`, (event) => {
        setLogs((prev) => updateLogs(prev, `[warning] ${event.payload}`));
      });

      // Listen for close
      await listen<number>(`${windowLabel}-close`, (event) => {
        if (event.payload === 0) {
          setProgress(100);
          setSpeed("");
          setEta("");
          setSleepRemaining(null);
          setIsComplete(true);
          setLogs((prev) => updateLogs(prev, "[success] Download completed successfully!"));
        } else {
          setLogs((prev) => updateLogs(prev, `[error] Download failed with exit code: ${event.payload}`));
        }
      });
    };

    setupListeners();
  }, [windowLabel]);

  // Use refs to track current state for the finished list logic
  const titleRef = useRef(title);
  const formatRef = useRef(currentFormat);
  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    formatRef.current = currentFormat;
  }, [currentFormat]);

  // Watch progress to add finished video
  useEffect(() => {
    if (progress === 100 && titleRef.current) {
      setFinishedVideos((prev) => {
        if (!prev.some(v => v.title === titleRef.current && v.format === formatRef.current)) {
          return [...prev, { title: titleRef.current, format: formatRef.current, type: getFormatString(formatRef.current).split(" ")[0] }];
        }
        return prev;
      });
    }
  }, [progress]);


  return (
    <Container fluid p="0" style={{ paddingTop: '40px !important', width: '1200px', height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Grid gutter="md" p="0">
        {/* Left Column: Logs */}
        <Grid.Col span={6} h="600px" miw="300px">
          <LogViewer logs={logs} scrollAreaRef={scrollAreaRef} height="calc(100vh - 80px)" onClear={() => setLogs([])} />
        </Grid.Col>

        {/* Right Column: Status & History */}
        <Grid.Col span={6} h="600px">
          <Stack gap="md" h="100%">

            {/* Playlist Info */}
            {(playlistTitle || itemIndex) && (
              <Paper p="md" radius="lg" withBorder style={{ background: "rgba(255,255,255,0.03)" }} >
                <Stack gap="xs">
                  {playlistTitle && (
                    <Group wrap="nowrap">
                      <IconPlaylist size={20} />
                      <Text fw={600} truncate>{playlistTitle}</Text>
                    </Group>
                  )}
                  <Group justify="space-between" mb="sm">
                    {itemIndex && (
                      <Text size="sm" c="dimmed">Item {itemIndex}</Text>
                    )}
                    <Badge variant="light" color="green">{finishedVideos.length}</Badge>
                  </Group>
                </Stack>
                <ScrollArea style={{
                  flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                  padding: "12px",
                  fontFamily: `"Consolas", "Monaco", "Meiryo", "Yu Gothic UI", "MS PGothic", "MS Gothic", monospace`,
                  fontSize: "12px",
                }} h="300px" w="600px">
                  <Stack gap="xs" w="1000px">
                    {finishedVideos.length === 0 ? (
                      <Text c="dimmed" size="sm" ta="center" py="xl">No videos finished yet</Text>
                    ) : (
                      (() => {
                        const groupedVideos: { title: string; formats: string[]; status: 'success' | 'warning' }[] = [];
                        let i = 0;
                        while (i < finishedVideos.length) {
                          const current = finishedVideos[i];
                          const next = finishedVideos[i + 1];

                          const getType = (fmt: string) => {
                            if (fmt === "Skipped") return "Skipped";
                            const detailed = getFormatString(fmt);
                            if (detailed.startsWith("Video")) return "Video";
                            if (detailed.startsWith("Audio")) return "Audio";
                            if (detailed.startsWith("Legacy")) return "Legacy";
                            return "Other";
                          };

                          const currentType = getType(current.format);

                          // Check for pair
                          if (next && current.title === next.title) {
                            const nextType = getType(next.format);
                            if (current.format !== next.format && (currentType !== nextType || currentType === "Other" || nextType === "Other")) {
                              // Merged Pair
                              groupedVideos.push({
                                title: current.title,
                                formats: [current.format, next.format],
                                status: 'success'
                              });
                              i += 2;
                              continue;
                            }
                          }

                          // Single
                          let status: 'success' | 'warning' = 'warning';
                          if (currentType === "Legacy") status = 'success';

                          groupedVideos.push({
                            title: current.title,
                            formats: [current.format],
                            status
                          });
                          i++;
                        }

                        return groupedVideos.map((vid, i) => (
                          <Group key={i} gap="xs" wrap="nowrap" justify="start">
                            {vid.formats.map((fmt, fIndex) => (
                              <Badge key={fIndex} size="xs" variant="outline" color={vid.status === "success" ? "green" : "yellow"} style={{ flexShrink: 0 }}>
                                {getFormatString(fmt)}
                              </Badge>
                            ))}
                            <Group gap="xs" wrap="nowrap" style={{ overflow: "hidden" }}>
                              <Text size="sm" truncate c={vid.status === "success" ? "green" : "dimmed"}>{vid.title}</Text>
                            </Group>
                          </Group>
                        ));
                      })()
                    )}
                  </Stack>
                </ScrollArea>
              </Paper>
            )}

            {/* Current Progress */}
            {(progress > 0 || title || sleepRemaining !== null || isComplete) && (
              <Paper p="md" radius="lg" withBorder style={{ background: "rgba(255,255,255,0.03)" }}>
                {isComplete ? (
                  <Stack align="center" gap="xs" py="md">
                    <ThemeIcon color="green" size={48} radius="xl" variant="light">
                      <IconCheck size={32} />
                    </ThemeIcon>
                    <Text fw={700} c="green" size="lg">Download Complete</Text>
                    <Text size="sm" c="dimmed">All tasks finished successfully</Text>
                  </Stack>
                ) : (
                  <>
                    {title && (
                      <Stack gap={4} mb="sm">
                        <Text size="md" fw={700} truncate title={title}>
                          {title}
                        </Text>
                        {currentFormat && (
                          <Badge size="sm" variant="outline" color="gray" style={{ alignSelf: "flex-start" }}>
                            {getFormatString(currentFormat)}
                          </Badge>
                        )}
                      </Stack>
                    )}
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Progress
                      </Text>
                      <Group gap="xs">
                        {speed && (
                          <Badge variant="dot" color="cyan" size="sm">
                            {speed}
                          </Badge>
                        )}
                        {eta && (
                          <Badge variant="dot" color="yellow" size="sm">
                            ETA {eta}
                          </Badge>
                        )}
                        <Badge variant="light" color={isComplete ? "green" : "violet"}>
                          {progress.toFixed(1)}%
                        </Badge>
                      </Group>
                    </Group>
                  </>
                )}

                <Progress
                  value={progress}
                  size="lg"
                  radius="xl"
                  animated={!isComplete}
                  color={isComplete ? "green" : "violet"}
                />

                {!isComplete && sleepRemaining !== null && (
                  <Text size="sm" c="yellow" ta="center" mt="sm" fw={500}>
                    Sleeping for {sleepRemaining.toFixed(1)} seconds...
                  </Text>
                )}
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
