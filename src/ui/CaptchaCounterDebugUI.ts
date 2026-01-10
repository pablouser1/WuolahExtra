import Api from "../helpers/Api";

export default class CaptchaCounterDebugUI {
  private container: HTMLDivElement;
  private valueEl: HTMLSpanElement;
  private timerId: number | null = null;
  private closed = false;

  constructor() {
    const existing = document.getElementById("wuolahextra-captcha-debug");
    if (existing) {
      existing.remove();
    }

    this.container = document.createElement("div");
    this.container.id = "wuolahextra-captcha-debug";
    this.container.style.position = "fixed";
    this.container.style.top = "12px";
    this.container.style.right = "12px";
    this.container.style.zIndex = "2147483647";
    this.container.style.background = "rgba(17, 17, 17, 0.92)";
    this.container.style.color = "#fff";
    this.container.style.border = "1px solid rgba(255,255,255,0.15)";
    this.container.style.borderRadius = "10px";
    this.container.style.padding = "8px 10px";
    this.container.style.fontFamily =
      "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif";
    this.container.style.fontSize = "12px";
    this.container.style.boxShadow = "0 6px 24px rgba(0,0,0,0.35)";
    this.container.style.minWidth = "180px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.marginBottom = "6px";

    const title = document.createElement("div");
    title.textContent = "WuolahExtra Debug";
    title.style.fontWeight = "600";

    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.style.background = "transparent";
    close.style.border = "none";
    close.style.color = "rgba(255,255,255,0.85)";
    close.style.cursor = "pointer";
    close.style.fontSize = "16px";
    close.style.lineHeight = "16px";
    close.style.padding = "0 2px";

    close.addEventListener("click", () => this.stop());

    header.appendChild(title);
    header.appendChild(close);

    const line = document.createElement("div");
    line.style.opacity = "0.9";

    const label = document.createElement("span");
    label.textContent = "captchaCounter: ";

    this.valueEl = document.createElement("span");
    this.valueEl.textContent = "…";
    this.valueEl.style.fontWeight = "600";

    line.appendChild(label);
    line.appendChild(this.valueEl);

    this.container.appendChild(header);
    this.container.appendChild(line);

    (document.body || document.documentElement).appendChild(this.container);
  }

  start(intervalMs: number = 3000): void {
    if (this.timerId !== null || this.closed) {
      return;
    }

    const tick = async () => {
      if (this.closed) {
        return;
      }
      try {
        const me = await Api.me();
        const value = typeof me.captchaCounter === "number" ? me.captchaCounter : null;
        this.valueEl.textContent = value === null ? "(n/a)" : value.toString();
        this.valueEl.style.color = "#fff";
      } catch {
        this.valueEl.textContent = "(error)";
        this.valueEl.style.color = "#fca5a5";
      }
    };

    void tick();
    this.timerId = window.setInterval(() => {
      void tick();
    }, intervalMs);
  }

  stop(): void {
    this.closed = true;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.container.remove();
  }
}
