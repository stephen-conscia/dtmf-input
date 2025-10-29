export class DtmfInput extends HTMLElement {
  private input!: HTMLInputElement;
  private form!: HTMLFormElement;
  private pasteButton!: HTMLButtonElement;
  private _active = false;

  static get observedAttributes() {
    return ['darkmode'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          /* Light mode defaults */
          --input-bg: #f8f8f8;
          --input-fg: #222;
          --input-border: #d1d5db;
          --button-bg: #3b82f6;
          --button-fg: white;
          --button-hover: #2563eb;
          --icon-bg: transparent;
          --icon-fg: #6b7280;
          --icon-border: #d1d5db;
          --icon-hover-bg: #f3f4f6;
        }

        /* Dark mode - activated via .dark class */
        :host(.dark) {
          --input-bg: #1f2937;
          --input-fg: #f1f5f9;
          --input-border: #4b5563;
          --button-bg: #3b82f6;
          --button-fg: white;
          --button-hover: #2563eb;
          --icon-bg: transparent;
          --icon-fg: #94a3b8;
          --icon-border: #64748b;
          --icon-hover-bg: #334155;
        }

        form {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
        }

        form.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        input {
          width: 12ch;
          font-size: 1rem;
          padding: 0.4em 0.6em;
          border: 1px solid var(--input-border);
          border-radius: 0.4em;
          outline: none;
          background: var(--input-bg);
          color: var(--input-fg);
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          max-height: 38px;
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.4em 0.75em;
          border: none;
          border-radius: 0.4em;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 38px;
        }

        /* Submit Button - Primary */
        .button--submit {
          background: var(--button-bg);
          color: var(--button-fg);
          font-weight: 600;
        }

        .button--submit:hover {
          background: var(--button-hover);
        }

        .button--submit:active {
          transform: translateY(1px);
        }

        /* Icon Button - Gray / Secondary */
        .button--icon {
          width: 38px;
          height: 38px;
          padding: 0.4em;
          background: var(--icon-bg);
          color: var(--icon-fg);
          border: 1px solid var(--icon-border);
          border-radius: 0.4em;
          aspect-ratio: 1;
          transition: all 0.2s ease;
        }

        .button--icon:hover {
          background: var(--icon-hover-bg);
          border-color: var(--icon-fg);
        }

        .button--icon:active {
          background: var(--icon-border);
        }

        .button__icon {
          width: 1.25em;
          height: 1.25em;
          fill: currentColor;
        }

        /* Dark mode input focus glow */
        :host(.dark) input:focus {
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
        }
      </style>

      <form>
        <button type="button" class="button button--icon" data-role="paste" aria-label="Paste from clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" class="button__icon" viewBox="0 -960 960 960">
            <path d="m720-120-56-57 63-63H480v-80h247l-63-64 56-56 160 160-160 160Zm120-400h-80v-240h-80v120H280v-120h-80v560h200v80H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v240ZM480-760q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z" />
          </svg>
        </button>
        <input type="text" placeholder="Enter DTMF" maxlength="10" aria-label="DTMF Input" />
        <button type="submit" class="button button--submit">Submit</button>
      </form>
    `;
  }

  connectedCallback() {
    this.form = this.shadowRoot!.querySelector('form')!;
    this.input = this.shadowRoot!.querySelector('input')!;
    this.pasteButton = this.shadowRoot!.querySelector('[data-role="paste"]')!;

    // Paste from clipboard
    this.pasteButton.addEventListener("click", async () => {
      if (!navigator.clipboard?.readText) {
        alert("Clipboard access not supported. Please paste manually.");
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        const filtered = text.replace(/[^0-9*#]/g, '');
        this.input.value = filtered;
        this.input.dispatchEvent(new Event('input'));
      } catch (err) {
        console.warn("Clipboard error:", err);
        alert("Failed to paste. Try Ctrl+V.");
      }
    });

    // Filter input in real-time
    this.input.addEventListener("input", () => {
      const filtered = this.input.value.replace(/[^0-9*#]/g, '');
      if (this.input.value !== filtered) {
        this.input.value = filtered;
      }
    });

    // Handle form submit
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = this.input.value.trim();
      if (value) {
        console.log("value", value);
      }
      this.input.value = '';
    });

    setTimeout(() => this.show(), 500);
  }

  show() {
    this._active = true;
    requestAnimationFrame(() => this.form.classList.add('active'));
    setTimeout(() => this.input.focus(), 150);
  }

  hide() {
    this._active = false;
    this.form.classList.remove('active');
  }

  get active() {
    return this._active;
  }

  // Handle darkmode="true" | "false"
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'darkmode') {
      const isDark = newValue === 'true';
      if (isDark) {
        this.classList.add('dark');
      } else {
        this.classList.remove('dark');
      }
    }
  }
}

customElements.define('dtmf-input', DtmfInput);
