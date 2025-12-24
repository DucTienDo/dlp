import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "dark",
  defaultRadius: "xs",
  fontFamily: "'Gloria Hallelujah', cursive",
  headings: {
    fontFamily: "'Gloria Hallelujah', cursive",
  },
  components: {
    Button: {
      defaultProps: {
        color: 'dark',
        variant: 'filled',
      },
      styles: {
        root: {
          border: "2px solid #000",
          borderRadius: "2% 6% 5% 4% / 1% 1% 2% 4%",
          boxShadow: "3px 3px 0px #000",
          transition: "transform 0.1s, box-shadow 0.1s",
          color: "#fff",
          "&:hover": {
            transform: "translate(-1px, -1px)",
            boxShadow: "4px 4px 0px #000",
          },
          "&:active": {
            transform: "translate(1px, 1px)",
            boxShadow: "0px 0px 0px #000",
          },
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          border: "2px solid #000",
          borderRadius: "2% 6% 5% 4% / 1% 1% 2% 4%",
          "&:focus": {
            borderColor: "#000",
            boxShadow: "2px 2px 0px #000",
          },
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          border: "2px solid #000",
          borderRadius: "2% 6% 5% 4% / 1% 1% 2% 4%",
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
          borderRadius: "2% 6% 5% 4% / 1% 1% 2% 4%",
          boxShadow: "4px 4px 0px #000",
          backgroundColor: "#fff",
        },
      },
    },
    Card: {
      styles: {
        root: {
          border: "2px solid #000",
          borderRadius: "2% 6% 5% 4% / 1% 1% 2% 4%",
          boxShadow: "4px 4px 0px #000",
          backgroundColor: "#fff",
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          background: "transparent",
        }
      }
    },
    Progress: {
      styles: {
        root: {
          border: "2px solid #000",
          borderRadius: "2% 6% 5% 4% / 1% 1% 2% 4%",
          backgroundColor: "#fff",
          overflow: "hidden"
        },
        section: {
          backgroundColor: "#000",
        }
      }
    }
  },
});
