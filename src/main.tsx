import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import App from "./App";
import "./index.css";

const theme = createTheme({
  primaryColor: "dark",
  defaultRadius: "xs",
  fontFamily: "'Gloria Hallelujah', cursive",
  headings: {
    fontFamily: "'Gloria Hallelujah', cursive",
  },
  components: {
    Button: {
      styles: {
        root: {
          border: "2px solid #000",
          transition: "transform 0.1s, box-shadow 0.1s",
          "&:hover": {
            transform: "translate(-1px, -1px)",
          },
          "&:active": {
            transform: "translate(2px, 2px)",
            boxShadow: "1px 1px 0px #000",
          },
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          border: "2px solid #000",
          "&:focus": {
            borderColor: "#000",
            boxShadow: "2px 2px 0px #000",
          },
        },
      },
    },
    Paper: {
      styles: {
        root: {
          border: "2px solid #000",
          boxShadow: "4px 4px 0px #000",
        },
      },
    },
    Card: {
      styles: {
        root: {
          border: "2px solid #000",
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          background: "transparent",
        }
      }
    }
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
