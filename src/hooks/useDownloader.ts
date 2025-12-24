import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { downloadDir } from "@tauri-apps/api/path";
import { buildYtDlpArgs } from "../utils/ytdlp";

export function useDownloader() {
  const [url, setUrl] = useState("");
  const [proxy, setProxy] = useState("");
  const [cookies, setCookies] = useState("");
  const [downloadPath, setDownloadPath] = useState("");

  // Initialize download path to user's Downloads folder
  useEffect(() => {
    const initDownloadPath = async () => {
      try {
        const downloadsPath = await downloadDir();
        setDownloadPath(downloadsPath);
      } catch (error) {
        console.error("Error getting downloads directory:", error);
      }
    };
    initDownloadPath();
  }, []);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Download Folder",
      });
      if (selected && typeof selected === "string") {
        setDownloadPath(selected);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!url.trim()) {
      alert("❌ Error: Please enter a URL");
      return;
    }

    setIsDownloading(true);

    try {
      // Create progress window
      const windowLabel = `progress-${Date.now()}`;

      // Use dev server URL in dev mode, relative path in production
      const isDev = window.location.hostname === "localhost";
      const windowUrl = isDev
        ? "http://localhost:1420/progress.html"
        : "/progress.html";

      console.log("Creating progress window:", windowLabel, windowUrl);

      const progressWindow = new WebviewWindow(windowLabel, {
        url: windowUrl,
        title: "Downloading...",
        width: 800,
        height: 800,
        decorations: false,
      });

      progressWindow.once("tauri://created", () => {
        console.log("Progress window created successfully:", windowLabel);
      });

      progressWindow.once("tauri://error", (e) => {
        console.error("Error creating progress window:", e);
        alert(`Failed to create progress window: ${e}`);
      });

      // Wait for window to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save cookies to temp file if provided
      let cookiesFilePath = "";
      if (cookies.trim()) {
        cookiesFilePath = await invoke<string>("save_cookies_to_temp", {
          cookiesText: cookies,
        });
      }

      // Get sidecar paths for ffmpeg and deno
      const ffmpegPath = await invoke<string>("get_sidecar_path", {
        binaryName: "ffmpeg-x86_64-pc-windows-msvc.exe",
      });
      const denoPath = await invoke<string>("get_sidecar_path", {
        binaryName: "deno-x86_64-pc-windows-msvc.exe",
      });

      const args = buildYtDlpArgs(
        { url, proxy, cookies: cookiesFilePath, downloadPath },
        ffmpegPath,
        denoPath
      );

      // Call custom Rust command with window label
      await invoke("execute_downloader", {
        windowLabel: windowLabel,
        binaryName: "yt-dlp-x86_64-pc-windows-msvc.exe",
        args: args,
      });
    } catch (error) {
      console.error("Download error:", error);
      alert(`❌ Error: ${error}`);
    } finally {
      setIsDownloading(false);
    }
  }, [url, proxy, cookies, downloadPath]);

  return {
    // State
    url,
    proxy,
    cookies,
    downloadPath,
    isDownloading,
    // Setters
    setUrl,
    setProxy,
    setCookies,
    setDownloadPath,
    // Actions
    handleDownload,
    handleSelectFolder,
  };
}
