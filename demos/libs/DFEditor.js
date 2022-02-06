const DFEditor = function (values, elID) {

    const thisRef = this;
    thisRef.container = document.getElementById(elID);

    thisRef.initialize = () => {
        if (thisRef.container) {
            while (thisRef.container.hasChildNodes()) {
                thisRef.container.removeChild(thisRef.container.firstChild);
            }

            thisRef.container.className = "DFE_CONTAINER";
            thisRef.setupCSS();

            const div = document.createElement("div");
            div.id = `DFE_OPTIONS`;
            div.className = "DFE_Options";
            div.innerHTML = `
                <button id="DFE_Restart">Restart</button>
                <button id="DFE_FullRestart">Full Restart</button>
                `;

            thisRef.container.append(div);

            for (const key of Object.keys(values)) {
                thisRef.setupValueEditor(values[key], key);
            }

            console.log(`DF Editor setup with ${Object.keys(values).length} values on el with ID '${elID}'`);

            setTimeout(
                () => {
                    for (const key of Object.keys(values)) {
                        thisRef.setupValueHandlers(values[key], key);
                    }
                },
                0);

            setInterval(
                () => {
                    const restartButton = document.getElementById("DFE_Restart");
                    const fullRestartButton = document.getElementById("DFE_FullRestart");

                    restartButton.onclick = () => DF.Restart();
                    fullRestartButton.onclick = () => DF.FullRestart();

                    for (const key of Object.keys(values)) {
                        thisRef.updateValueDisplay(values[key], key);
                    }
                },
                100);
        }
    }

    thisRef.setupCSS = () => {
        var style = document.createElement('style');
        style.innerHTML =
            `.DFE_CONTAINER {
                background-color: white;
                position: relative;
            }
            .DFE_OPTIONS {
                border: 1px solid black;
            }
            .DFE_OPTIONS button {
                width: 100px;
                height: 40px;
                font-weight: bold;
            }
            .DFE_Value {
                padding: 4px;
                color: black;
                border: 1px solid black;
                width: 260px;
                display: inline-block;
            }
            .DFE_Value label {
                font-weight: bold;
            }
            .DFE_Value input[type='text'] {
                width: 140px
            }
            `;
        document.head.append(style);
    }

    thisRef.setupValueEditor = (value, key) => {
        const div = document.createElement("div");
        div.id = `DFE_${key}`;
        div.className = "DFE_Value";
        div.innerHTML = `
            <label>${key}</label>
            <input type="checkbox" id="DFE_VALUE_LOCKED_${key}" checked="${value.Locked ? "checked" : ""}" />
            <input type="text" id="DFE_VALUE_INPUT_${key}" value="${value.Value}" ${value.Locked ? "" : "disabled"}/>`;

        thisRef.container.append(div);
    }

    thisRef.setupValueHandlers = (value, key) => {
        const input = document.getElementById(`DFE_VALUE_INPUT_${key}`);
        const lockedInput = document.getElementById(`DFE_VALUE_LOCKED_${key}`);
        value.DEFInput = input;
        value.DFELockedInput = lockedInput;

        input.onchange = (e) => {
            value.Value = parseFloat(e.currentTarget.value);
        };

        lockedInput.onchange = (e) => {
            value.Locked = e.currentTarget.checked;
            value.DEFInput.disabled = !value.Locked;
        }
    }

    thisRef.updateValueDisplay = (value, key) => {
        if (!value.Locked) {
            value.DEFInput.value = value.Value;
            value.DFELockedInput.checked = value.Locked;
        }
    }

    thisRef.initialize();
}