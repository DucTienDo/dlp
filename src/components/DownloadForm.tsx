import { Paper, Stack, TextInput, Textarea, Group, Button, Loader } from "@mantine/core";
import { IconLink, IconServer, IconCookie, IconFolderOpen, IconFolder, IconPlayerPlay } from "@tabler/icons-react";

interface Props {
  url: string;
  proxy: string;
  cookies: string;
  downloadPath: string;
  isDownloading: boolean;
  onUrlChange: (value: string) => void;
  onProxyChange: (value: string) => void;
  onCookiesChange: (value: string) => void;
  onDownloadPathChange: (value: string) => void;
  onBrowse: () => void;
  onDownload: () => void;
}

export function DownloadForm({
  url,
  proxy,
  cookies,
  downloadPath,
  isDownloading,
  onUrlChange,
  onProxyChange,
  onCookiesChange,
  onDownloadPathChange,
  onBrowse,
  onDownload,
}: Props) {
  return (
    <Paper p="lg" radius={0} style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      border: 'none',
    }}>
      <Stack gap="md">
        <TextInput
          label="YouTube URL"
          placeholder="https://www.youtube.com/watch?v=..."
          size="md"
          leftSection={<IconLink size={18} />}
          value={url}
          onChange={(e) => onUrlChange(e.currentTarget.value)}
        />

        <TextInput
          label="Proxy (optional)"
          placeholder="http://proxy:port or socks5://proxy:port"
          size="md"
          leftSection={<IconServer size={18} />}
          value={proxy}
          onChange={(e) => onProxyChange(e.currentTarget.value)}
        />

        <Textarea
          label="Cookies (optional)"
          placeholder="Paste cookies text here (Netscape format)"
          size="md"
          leftSection={<IconCookie size={18} />}
          value={cookies}
          onChange={(e) => onCookiesChange(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={5}
        />

        <Group align="flex-end" gap="xs">
          <TextInput
            label="Download Path (optional)"
            placeholder="Default: Downloads folder"
            size="md"
            leftSection={<IconFolderOpen size={18} />}
            value={downloadPath}
            onChange={(e) => onDownloadPathChange(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button size="md" variant="filled" leftSection={<IconFolder size={18} />} onClick={onBrowse}>
            Browse
          </Button>
        </Group>

        <Button
          size="lg"
          fullWidth
          leftSection={isDownloading ? <Loader size={18} color="white" /> : <IconPlayerPlay size={20} />}
          onClick={onDownload}
          disabled={isDownloading}
          variant="filled"
          color="dark"
        >
          {isDownloading ? "Downloading..." : "Start Download"}
        </Button>
      </Stack>
    </Paper>
  );
}
