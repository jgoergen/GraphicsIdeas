class DFEditor {
    constructor(values, elID) {
        this.values = values;
        this.container = document.getElementById(elID);

        if (!this.container) {
            console.error(`DFEditor Initialization Error: Element with ID '${elID}' not found.`);
            return;
        }

        this.back = this.back.bind(this);
        this.restart = this.restart.bind(this);
        this.fullRestart = this.fullRestart.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleLockChange = this.handleLockChange.bind(this);

        this.initialize();
    }

    back() {
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete("script");
            window.location = url.href;
        } catch (error) {
            console.error('DFEditor Back Navigation Error:', error);
        }
    }

    restart() {
        if (typeof DF !== 'undefined' && typeof DF.Restart === 'function') {
            DF.Restart();
            this.updateValueDisplays();
        } else {
            console.warn('DF.Restart function is not defined.');
        }
    }

    fullRestart() {
        if (typeof DF !== 'undefined' && typeof DF.FullRestart === 'function') {
            DF.FullRestart();
            this.updateValueDisplays();
        } else {
            console.warn('DF.FullRestart function is not defined.');
        }
    }

    initialize() {
        this.clearContainer();
        this.setupCSS();
        this.createOptions();
        this.setupValueEditors();
        this.setupEventListeners();

        console.info(`DFEditor initialized with ${Object.keys(this.values).length} values in element '#${this.container.id}'.`);
    }

    clearContainer() {
        this.container.innerHTML = '';
        this.container.classList.add("DFE_CONTAINER");
    }

    setupCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .DFE_CONTAINER {
                background-color: white;
                position: relative;
                padding: 10px;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            .DFE_OPTIONS {
                border: 1px solid #ccc;
                padding: 10px;
                margin-bottom: 15px;
                display: flex;
                gap: 10px;
            }
            .DFE_OPTIONS button {
                flex: 1;
                padding: 10px;
                font-weight: bold;
                cursor: pointer;
                background-color: #f0f0f0;
                border: 1px solid #999;
                border-radius: 4px;
                transition: background-color 0.3s;
            }
            .DFE_OPTIONS button:hover {
                background-color: #e0e0e0;
            }
            .DFE_Value {
                padding: 8px;
                color: #333;
                border: 1px solid #ccc;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-sizing: border-box;
            }
            .DFE_Value label {
                flex: 1;
                font-weight: bold;
            }
            .DFE_Value input[type='checkbox'] {
                transform: scale(1.2);
                cursor: pointer;
            }
            .DFE_Value input[type='text'] {
                flex: 2;
                padding: 5px;
                border: 1px solid #999;
                border-radius: 4px;
                font-size: 1em;
            }
            .DFE_Value input[type='text']:disabled {
                background-color: #f9f9f9;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }

    createOptions() {
        const optionsDiv = document.createElement("div");
        optionsDiv.id = "DFE_OPTIONS";
        optionsDiv.className = "DFE_OPTIONS";

        const backButton = document.createElement("button");
        backButton.id = "DFE_Back";
        backButton.setAttribute('aria-label', 'Go Back');
        backButton.textContent = "Back";
        optionsDiv.appendChild(backButton);

        const restartButton = document.createElement("button");
        restartButton.id = "DFE_Restart";
        restartButton.setAttribute('aria-label', 'Restart');
        restartButton.textContent = "Restart";
        optionsDiv.appendChild(restartButton);

        const fullRestartButton = document.createElement("button");
        fullRestartButton.id = "DFE_FullRestart";
        fullRestartButton.setAttribute('aria-label', 'Full Restart');
        fullRestartButton.textContent = "Full Restart";
        optionsDiv.appendChild(fullRestartButton);

        this.container.appendChild(optionsDiv);
    }

    setupValueEditors() {
        this.valueEditors = {}; // To keep track of value editor elements
        for (const [key, value] of Object.entries(this.values)) {
            this.createValueEditor(value, key);
        }
    }

    createValueEditor(value, key) {
        const valueDiv = document.createElement("div");
        valueDiv.id = `DFE_${key}`;
        valueDiv.className = "DFE_Value";

        const label = document.createElement('label');
        label.setAttribute('for', `DFE_VALUE_INPUT_${key}`);
        label.textContent = key;
        valueDiv.appendChild(label);

        const lockedCheckbox = document.createElement('input');
        lockedCheckbox.type = 'checkbox';
        lockedCheckbox.id = `DFE_VALUE_LOCKED_${key}`;
        lockedCheckbox.checked = Boolean(value.Locked);
        lockedCheckbox.setAttribute('aria-label', `Lock ${key} input`);
        valueDiv.appendChild(lockedCheckbox);

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = `DFE_VALUE_INPUT_${key}`;
        textInput.value = value.Value;
        textInput.disabled = !value.Locked;
        textInput.setAttribute('aria-label', `Edit value for ${key}`);
        valueDiv.appendChild(textInput);

        this.container.appendChild(valueDiv);

        this.valueEditors[key] = {
            value,
            elements: {
                lockedCheckbox,
                textInput
            }
        };
    }

    setupEventListeners() {
        const backButton = this.container.querySelector("#DFE_Back");
        const restartButton = this.container.querySelector("#DFE_Restart");
        const fullRestartButton = this.container.querySelector("#DFE_FullRestart");

        if (backButton) backButton.addEventListener('click', this.back);
        if (restartButton) restartButton.addEventListener('click', this.restart);
        if (fullRestartButton) fullRestartButton.addEventListener('click', this.fullRestart);

        for (const [key, editor] of Object.entries(this.valueEditors)) {
            const { lockedCheckbox, textInput } = editor.elements;
            textInput.addEventListener('change', (e) => this.handleValueChange(e, key));
            lockedCheckbox.addEventListener('change', (e) => this.handleLockChange(e, key));
        }
    }

    handleValueChange(event, key) {
        const inputValue = event.target.value.trim();
        const parsedValue = parseFloat(inputValue);

        if (!isNaN(parsedValue)) {
            this.values[key].Value = parsedValue;
            console.debug(`DFEditor: Value for '${key}' updated to ${parsedValue}.`);
        } else {
            console.warn(`DFEditor: Invalid input for '${key}'. Reverting to previous value.`);
            event.target.value = this.values[key].Value;
        }
    }

    handleLockChange(event, key) {
        const isLocked = event.target.checked;
        this.values[key].Locked = isLocked;
        this.valueEditors[key].elements.textInput.disabled = !isLocked;
        console.debug(`DFEditor: '${key}' input ${isLocked ? 'locked' : 'unlocked'}.`);
    }

    updateValueDisplays() {
        for (const [key, editor] of Object.entries(this.valueEditors)) {
            const { value, elements: { lockedCheckbox, textInput } } = editor;

            if (!value.Locked) {
                textInput.value = value.Value;
                lockedCheckbox.checked = value.Locked;
                textInput.disabled = !value.Locked;
            }
        }
    }

    destroy() {
        const backButton = this.container.querySelector("#DFE_Back");
        const restartButton = this.container.querySelector("#DFE_Restart");
        const fullRestartButton = this.container.querySelector("#DFE_FullRestart");

        if (backButton) backButton.removeEventListener('click', this.back);
        if (restartButton) restartButton.removeEventListener('click', this.restart);
        if (fullRestartButton) fullRestartButton.removeEventListener('click', this.fullRestart);

        for (const [key, editor] of Object.entries(this.valueEditors)) {
            const { lockedCheckbox, textInput } = editor.elements;

            lockedCheckbox.removeEventListener('change', (e) => this.handleLockChange(e, key));
            textInput.removeEventListener('change', (e) => this.handleValueChange(e, key));
        }

        const styleElement = document.querySelector('style');
        if (styleElement) {
            styleElement.remove();
        }

        this.container.innerHTML = '';
        console.info('DFEditor instance destroyed and cleaned up.');
    }
}