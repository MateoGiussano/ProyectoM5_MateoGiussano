import { useEffect } from "react";
import type { JSX } from "react";
import { AppRoutes } from "./routes/AppRoutes";

function App(): JSX.Element {
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return <AppRoutes />;
}

export default App;
