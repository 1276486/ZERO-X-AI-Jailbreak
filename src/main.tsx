import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 界面由 Astryx 主题与 ./ui.css 构成。
import { App } from "./App";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
