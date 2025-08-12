import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#36bd78", // OLD: #5536DA
      contrastText: "#ffffff", // white text on primary (green) buttons
    },
    secondary: {
      main: "#BDBDBD",
      contrastText: "#ffffff",
    },
    background: {
      main: "#F8F9FD",
      default: "#00000",
    },
    red: {
      main: "#cc0c0c",
    },
    default: {
      main: "#fffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontSize: "2rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          color: "#ffffff", // ensure white text for primary contained buttons
        },
      },
    },
  },
});

export default theme;
