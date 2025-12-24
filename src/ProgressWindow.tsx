import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { ProgressWindowContent } from "./components/ProgressWindowContent";
import { theme } from "./theme";
import { WindowControls } from "./components/WindowControls";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark" >
      <WindowControls />
      <ProgressWindowContent />
    </MantineProvider>
  </React.StrictMode>
);
