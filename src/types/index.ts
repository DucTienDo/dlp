export type DownloadType = "video" | "playlist" | "channel";

export interface DownloadConfig {
  url: string;
  proxy: string;
  cookies: string;
  downloadPath: string;
  downloadType: DownloadType;
}

export interface DownloaderState {
  url: string;
  proxy: string;
  cookies: string;
  downloadPath: string;
  downloadType: DownloadType;
  logs: string[];
  isDownloading: boolean;
  progress: number;
}

export interface DownloaderActions {
  setUrl: (url: string) => void;
  setProxy: (proxy: string) => void;
  setCookies: (cookies: string) => void;
  setDownloadPath: (path: string) => void;
  setDownloadType: (type: DownloadType) => void;
  handleDownload: () => Promise<void>;
  handleSelectFolder: () => Promise<void>;
  appendLog: (message: string) => void;
}
