export default class ProgressUI {
  private container: HTMLDivElement;
  private titleEl: HTMLDivElement;
  private statusEl: HTMLDivElement;
  private progressOuter: HTMLDivElement;
  private progressInner: HTMLDivElement;
  private cancelBtn: HTMLButtonElement;
  private actionBtn: HTMLButtonElement | null = null;
  private cancelListeners: Array<() => void> = [];

  private total: number | null = null;
  private cancelled = false;

  constructor(title: string) {
    const existing = document.getElementById("wuolahextra-folder-progress");
    if (existing) {
      existing.remove();
    }

    this.container = document.createElement("div");
    this.container.id = "wuolahextra-folder-progress";
    this.container.style.position = "fixed";
    this.container.style.right = "16px";
    this.container.style.bottom = "16px";
    this.container.style.zIndex = "2147483647";
    this.container.style.background = "rgba(20, 20, 20, 0.95)";
    this.container.style.color = "#fff";
    this.container.style.border = "1px solid rgba(255,255,255,0.15)";
    this.container.style.borderRadius = "10px";
    this.container.style.padding = "12px";
    this.container.style.width = "320px";
    this.container.style.fontFamily =
      "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif";
    this.container.style.fontSize = "13px";
    this.container.style.boxShadow = "0 8px 30px rgba(0,0,0,0.35)";

    this.titleEl = document.createElement("div");
    this.titleEl.textContent = title;
    this.titleEl.style.fontWeight = "600";
    this.titleEl.style.marginBottom = "6px";

    this.statusEl = document.createElement("div");
    this.statusEl.textContent = "Iniciando…";
    this.statusEl.style.opacity = "0.9";
    this.statusEl.style.marginBottom = "10px";
    this.statusEl.style.wordBreak = "break-word";
    this.statusEl.style.whiteSpace = "pre-line";

    this.progressOuter = document.createElement("div");
    this.progressOuter.style.height = "8px";
    this.progressOuter.style.background = "rgba(255,255,255,0.12)";
    this.progressOuter.style.borderRadius = "999px";
    this.progressOuter.style.overflow = "hidden";
    this.progressOuter.style.marginBottom = "10px";

    this.progressInner = document.createElement("div");
    this.progressInner.style.height = "100%";
    this.progressInner.style.width = "0%";
    this.progressInner.style.background = "#3b82f6";
    this.progressInner.style.transition = "width 150ms linear";
    this.progressOuter.appendChild(this.progressInner);

    this.cancelBtn = document.createElement("button");
    this.cancelBtn.type = "button";
    this.cancelBtn.textContent = "Cancelar";
    this.cancelBtn.style.background = "transparent";
    this.cancelBtn.style.color = "#fff";
    this.cancelBtn.style.border = "1px solid rgba(255,255,255,0.2)";
    this.cancelBtn.style.borderRadius = "8px";
    this.cancelBtn.style.padding = "6px 10px";
    this.cancelBtn.style.cursor = "pointer";

    const footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.justifyContent = "flex-end";
    footer.appendChild(this.cancelBtn);

    this.container.appendChild(this.titleEl);
    this.container.appendChild(this.statusEl);
    this.container.appendChild(this.progressOuter);
    this.container.appendChild(footer);

    document.body.appendChild(this.container);

    this.cancelBtn.addEventListener("click", () => {
      this.cancelled = true;
      this.cancelBtn.disabled = true;
      this.cancelBtn.textContent = "Cancelado";
      this.setError("Cancelando…");

      const listeners = this.cancelListeners;
      this.cancelListeners = [];
      for (const cb of listeners) {
        try {
          cb();
        } catch {
        }
      }
    });
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  setTotal(total: number): void {
    this.total = total;
  }

  setStatus(text: string): void {
    this.statusEl.style.color = "#fff";
    this.statusEl.style.opacity = "0.9";
    this.progressInner.style.background = "#3b82f6";
    this.statusEl.textContent = text;
  }

  setAction(label: string, onClick: () => void): void {
    if (!this.actionBtn) {
      this.actionBtn = document.createElement("button");
      this.actionBtn.type = "button";
      this.actionBtn.style.background = "#2563eb";
      this.actionBtn.style.color = "#fff";
      this.actionBtn.style.border = "1px solid rgba(255,255,255,0.15)";
      this.actionBtn.style.borderRadius = "8px";
      this.actionBtn.style.padding = "6px 10px";
      this.actionBtn.style.cursor = "pointer";
      this.actionBtn.style.marginRight = "8px";

      const footer = this.container.lastElementChild as HTMLDivElement;
      footer.style.justifyContent = "space-between";
      footer.style.gap = "8px";
      footer.prepend(this.actionBtn);
    }

    this.actionBtn.textContent = label;
    this.actionBtn.disabled = false;
    this.actionBtn.onclick = () => {
      if (this.cancelled) {
        return;
      }
      onClick();
    };
  }

  clearAction(): void {
    if (this.actionBtn) {
      this.actionBtn.remove();
      this.actionBtn = null;
      const footer = this.container.lastElementChild as HTMLDivElement;
      footer.style.justifyContent = "flex-end";
    }
  }

  onCancel(cb: () => void): void {
    if (this.cancelled) {
      cb();
      return;
    }
    this.cancelListeners.push(cb);
  }

  setProgress(done: number, total?: number): void {
    const t = total ?? this.total;
    if (!t || t <= 0) {
      return;
    }
    const pct = Math.max(0, Math.min(100, Math.round((done / t) * 100)));
    this.progressInner.style.width = `${pct}%`;
  }

  setError(text: string): void {
    this.statusEl.textContent = text;
    this.statusEl.style.color = "#fca5a5";
    this.progressInner.style.background = "#ef4444";
  }

  done(text: string): void {
    this.statusEl.textContent = text;
    this.statusEl.style.color = "#86efac";
    this.progressInner.style.width = "100%";
    this.progressInner.style.background = "#22c55e";
    this.cancelBtn.disabled = true;
    this.cancelBtn.textContent = "Cerrar";
    this.cancelBtn.onclick = () => this.remove();
  }

  remove(): void {
    this.container.remove();
  }
}
