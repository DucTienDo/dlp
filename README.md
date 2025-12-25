# DLP - Media Downloader

A modern, native-feeling desktop application for downloading media from various sources based on yt-dlp and gallery-dl. Built with Tauri, React, and TypeScript.

## Features

- **Media Downloader**: Download videos and images using `yt-dlp` and `gallery-dl`.
- **Modern UI**: Clean, responsive interface built with Mantine UI, designed to look and feel like a native application.
- **Multi-Window Support**: Dedicated progress windows for active downloads.
- **Advanced Logging**: Real-time log viewing with support for international characters.

## Supported Platforms

- **Current**: 
  - YouTube (Fully supported)
- **Planned (Roadmap)**:
  - TikTok
  - Douyin
  - Twitter (X)
  - Instagram
  - And more...

## Requirements

To build and run this project, you need the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [VS C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (on Windows)

## Project Structure

This project uses a standard Tauri + Vite structure:

- `/src`: Frontend React application
- `/src-tauri`: Rust backend and Tauri configuration
- `/src-tauri/binaries`: Bundled executables (`yt-dlp`, `ffmpeg`, etc.)

## Getting Started

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Run in Development Mode**

    This will start the frontend dev server and the Tauri window.

    ```bash
    npm run tauri dev
    ```

3.  **Build for Production**

    To verify the build or create a release bundle:

    ```bash
    npm run tauri build
    ```

## Bundled Binaries

This section is **critical**. The application relies on external binaries to function. You must manually place the following files in the `src-tauri/binaries` directory.

### Executables
For Windows x64, these **must** be named exactly as follows (including the `-x86_64-pc-windows-msvc` suffix):

- `yt-dlp-x86_64-pc-windows-msvc.exe`
- `gallery-dl-x86_64-pc-windows-msvc.exe`
- `ffmpeg-x86_64-pc-windows-msvc.exe`
- `ffprobe-x86_64-pc-windows-msvc.exe`
- `deno-x86_64-pc-windows-msvc.exe`

### Shared Libraries (DLLs)
The FFmpeg executables require their associated DLLs to be present in the same `binaries` folder. Ensure you have the necessary `.dll` files (versions may vary, but typically include):

- `avcodec-*.dll`
- `avdevice-*.dll`
- `avfilter-*.dll`
- `avformat-*.dll`
- `avutil-*.dll`
- `swresample-*.dll`
- `swscale-*.dll`
