import type { AxiosError, AxiosInstance } from "axios";
import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import Swal from "sweetalert2";

import DefaultLoadingSpinner from "@/components/ui/default-loading-spinner";

/* ───────────── global spinner root ───────────── */
let root: Root | null = null;
let el: HTMLDivElement | null = null;

function mountSpinner() {
  if (root) return;
  el = document.createElement("div");
  el.id = "global-spinner";
  el.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm";
  document.body.appendChild(el);

  root = createRoot(el);
  root.render(
    <StrictMode>
      <DefaultLoadingSpinner />
    </StrictMode>,
  );
}

function unmountSpinner() {
  if (!root || !el) return;
  root.unmount();
  el.remove();
  root = null;
  el = null;
}

let pending = 0;
const inc = () => {
  if (++pending === 1) mountSpinner();
};
const dec = () => {
  if (pending === 0) return;
  if (--pending === 0) unmountSpinner();
};

export function setupInterceptors(api: AxiosInstance) {
  /* ───────────── request ───────────── */
  api.interceptors.request.use((cfg) => {
    inc();
    return cfg;
  });

  /* ───────────── response ──────────── */
  api.interceptors.response.use(
    (res) => {
      dec();
      return res;
    },
    (err: AxiosError) => {
      dec();

      /* Network error (no response) */
      if (!err.response) {
        void Swal.fire({
          icon: "error",
          text: "Erro de rede. Verifique sua conexão e tente novamente.",
        });
        return Promise.reject(err);
      }

      /* 5xx server error */
      const { status } = err.response;
      if (status >= 500) {
        void Swal.fire({
          icon: "error",
          text: "Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.",
        });
      }

      return Promise.reject(err);
    },
  );
}
