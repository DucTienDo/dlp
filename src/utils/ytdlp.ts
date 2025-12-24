const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

export function buildYtDlpArgs(config: { url: string; proxy: string; cookies: string; downloadPath: string }, ffmpegPath?: string, denoPath?: string): string[] {
  const { url, proxy, cookies, downloadPath } = config;
  const args: string[] = [];

  // FFmpeg location (for video processing)
  if (ffmpegPath) {
    args.push("--ffmpeg-location", ffmpegPath);
  }

  // JavaScript runtime (deno for YouTube extraction)
  if (denoPath) {
    args.push("--js-runtimes", `deno:${denoPath}`);
  }

  // Enhanced anti-bot settings
  args.push("--sleep-interval", "7");
  args.push("--max-sleep-interval", "15");

  // Retry settings
  args.push("--retries", "5");
  args.push("--fragment-retries", "5");
  args.push("--file-access-retries", "3");
  args.push("--extractor-retries", "3");

  // Resume and progress settings
  args.push("--continue");
  args.push("--no-part");
  args.push("--progress");

  // Error handling
  args.push("--ignore-errors");
  args.push("--skip-unavailable-fragments");
  args.push("--no-abort-on-error");

  // Verbose output
  args.push("--verbose");
  args.push("--no-quiet");

  // User agent
  args.push("--user-agent", USER_AGENT);

  // Force UTF-8 encoding to prevent sanitization of non-ASCII characters
  args.push("--encoding", "utf-8");

  // Filter member-only content
  args.push("--match-filter", "!is_live & availability!=premium_only & availability!=subscriber_only");

  // Proxy
  if (proxy.trim()) {
    args.push("--proxy", proxy.trim());
  }

  // Cookies file
  if (cookies.trim()) {
    args.push("--cookies", cookies.trim());
  }

  // Output template with uploader folder structure
  if (downloadPath.trim()) {
    const outputTemplate = `${downloadPath.replace(/\\/g, "/")}/%(uploader)s/%(title)s.%(ext)s`;
    args.push("-o", outputTemplate);
  } else {
    args.push("-o", "%(uploader)s/%(title)s.%(ext)s");
  }

  // URL (must be last)
  args.push(url.trim());

  return args;
}

export function parseProgress(line: string): number | null {
  const match = line.match(/\[download\]\s+([\d.]+)%/);
  return match ? parseFloat(match[1]) : null;
}
