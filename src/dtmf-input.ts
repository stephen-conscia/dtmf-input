import { Desktop } from "@wxcc-desktop/sdk";

//const dtmfLogger = Desktop.logger.createLogger('dtmf-input-logger');

class DtmfInput extends HTMLElement {
  private container!: HTMLDivElement;
  private input!: HTMLInputElement;
  private pasteButton!: HTMLButtonElement;
  private submitButton!: HTMLButtonElement;

  static get observedAttributes(): string[] {
    return ['darkmode'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          font-family: sans-serif;
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 10px;
          padding: 1rem;
          box-sizing: border-box;
          background: #f0f4f8;
          color: #222;
        }

        .container.darkmode {
          background: #1f2937;
          color: #f1f5f9;
        }

        .title {
          font-size: 1.2rem;
          font-weight: bold;
        }

        form {
          display: flex;
          gap: 0.5rem;
        }

        input {
          padding: 0.5em 0.75em;
          font-size: 1rem;
          border: 1px solid #b0b2b6;
          border-radius: 0.4em;
          outline: none;
        }

        .container.darkmode input {
          background: #374151;
          color: #f1f5f9;
          border-color: #4b5563;
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5em 1em;
          font-size: 1rem;
          border: none;
          border-radius: 0.4em;
          cursor: pointer;
          transition: background 0.2s;
        }

        .button.submit {
          background-color: #3b82f6;
          color: white;
        }

        .button.submit:hover {
          background-color: #2563eb;
        }

        .button.paste {
          background-color: #ecf3fe;
          color: #222;
          width: 38px;
          height: 38px;
          padding: 0;
        }

        .container.darkmode .button.paste {
          background-color: #2c374e;
          color: #f1f5f9;
        }

        .button.paste svg {
          width: 24px;
          height: 24px;
        }

        .button.paste:hover {
          background-color: #d4e0f8;
        }

        .container.darkmode .button.paste:hover {
          background-color: #334155;
        }
      </style>

      <div class="container">
        <div class="title">Input DTMF</div>
        <form>
          <button type="button" class="button paste" title="Paste">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="m720-120-56-57 63-63H480v-80h247l-63-64 56-56 160 160-160 160Zm120-400h-80v-240h-80v120H280v-120h-80v560h200v80H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v240ZM480-760q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z"/>
            </svg>
          </button>
          <input type="text" placeholder="Enter DTMF" maxlength="10"/>
          <button type="submit" class="button submit">Submit</button>
        </form>
      </div>
    `;

    // dtmfLogger.info("Constructor");
  }

  connectedCallback() {
    //dtmfLogger.info("Connected Callback");
    //Desktop.config.init({ widgetName: "dtmf-input", widgetProvider: "Conscia" });
    this.container = this.shadowRoot!.querySelector('.container')!;
    this.input = this.shadowRoot!.querySelector('input')!;
    this.pasteButton = this.shadowRoot!.querySelector('.button.paste')!;
    this.submitButton = this.shadowRoot!.querySelector('.button.submit')!;

    // Paste button event
    this.pasteButton.addEventListener('click', async () => {
      if (!navigator.clipboard?.readText) return;
      const text = await navigator.clipboard.readText();
      this.input.value = text.replace(/[^0-9*#]/g, '');
      this.input.focus();
    });

    // Submit button event
    this.submitButton.addEventListener('click', (e: Event) => {
      e.preventDefault();
      const value = this.input.value.trim();
      if (value) alert(value); //Desktop.agentContact.sendDtmf(value);
      this.input.value = '';
    });

    // Restrict input to 0-9, *, #
    this.input.addEventListener('input', () => {
      this.input.value = this.input.value.replace(/[^0-9*#]/g, '');
    });
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'darkmode') {
      if (newValue === 'true') {
        this.container.classList.add('darkmode');
      } else {
        this.container.classList.remove('darkmode');
      }
    }
  }
}

customElements.define('dtmf-input', DtmfInput);

