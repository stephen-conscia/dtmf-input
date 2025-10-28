export class DtmfInput extends HTMLElement {
  private input!: HTMLInputElement;
  private form!: HTMLFormElement;
  private pasteButton!: HTMLButtonElement;
  private _active = false;

  static get observedAttributes() {
    return ['darkmode']; // now observed
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        form {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: opacity 0.3s, transform 0.3s;
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
          border: 1px solid currentColor;
          border-radius: 0.4em;
          outline: none;
          max-height: 64px;
          box-sizing: border-box;
          background: var(--input-bg, #f8f8f8);
          color: var(--input-fg, #222);
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.3);
        }

        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.4em 0.6em;
          border: none;
          border-radius: 0.4em;
          font-size: 1rem;
          cursor: pointer;
          max-height: 64px;
          transition: background 0.25s;
          background: var(--button-bg, #3b82f6);
          color: var(--button-fg, white);
        }

        button:hover {
          background: var(--button-bg-hover, #2563eb);
        }

        :host([darkmode]) input {
          --input-bg: #333;
          --input-fg: #eee;
          background: var(--input-bg);
          color: var(--input-fg);
          border-color: #555;
        }

        :host([darkmode]) button {
          --button-bg: #2563eb;
          --button-bg-hover: #1d4ed8;
          --button-fg: white;
          background: var(--button-bg);
          color: var(--button-fg);
        }
      </style>

      <form>
        <button type="button" data-role="paste" aria-label="Paste from clipboard">Paste</button>
        <input type="text" placeholder="Enter DTMF" maxlength="10" aria-label="DTMF Input" />
        <button type="submit" aria-label="Submit DTMF">Submit</button>
      </form>
    `;
  }

  connectedCallback() {
    console.log("connectedCallback");

    this.form = this.shadowRoot!.querySelector('form')!;
    this.input = this.shadowRoot!.querySelector('input')!;
    this.pasteButton = this.shadowRoot!.querySelector('[data-role="paste"]')!;

    this.pasteButton.addEventListener("click", () => {
      console.log("paste button clicked");

      if (!navigator.clipboard?.readText) {
        alert("Please accept permissions to access clipboard");
        return;
      }
      navigator.clipboard
        .readText()
        .then((clipText) => (clipText.length && (this.input.value = clipText)))
        .catch(error => console.log("error", error));

    });

    this.input.addEventListener("input", () => {
      const filtered = this.input.value.replace(/[^0-9*#]/g, '');
      if (this.input.value !== filtered) {
        this.input.value = filtered;
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = this.input.value.trim().replace(/[^0-9*#]/gi, '');
      if (value) {
        console.log("input", value);
      }
      this.input.value = '';
    });

    this.show();
  }

  /** Show the form internally */
  show() {
    this._active = true;
    this.form.classList.add('active');
    this.input.focus(); // optional: autofocus on show
  }

  /** Hide the form internally */
  hide() {
    this._active = false;
    this.form.classList.remove('active');
  }

  /** Current active state */
  get active() {
    return this._active;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(`${name} has changed from ${oldValue} to ${newValue}.`);
    if (name === "darkmode") {
      if (this.hasAttribute("darkmode")) {
        this.classList.add("darkmode");
      } else {
        this.classList.remove("darkmode");
      }
    }
  }
}

customElements.define('dtmf-input', DtmfInput);

