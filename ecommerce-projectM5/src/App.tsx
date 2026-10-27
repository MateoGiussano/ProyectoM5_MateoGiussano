import type { JSX } from "react";
import { Header } from "./components/common/Header";
import { AppRoutes } from "./routes/AppRoutes";

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
