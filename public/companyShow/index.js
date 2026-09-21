import columns from "./columns.json" with { type: "json" };
import configJson from "./config.json" with { type: "json" };

// import { Table } from "../../src/v5/index.js";
import structure from './structure.json' with {type: 'json'};

const { default: compile } = await import("https://keshavsoft.github.io/json-to-spec/dist/v23/min.js");

const { specToDom } = await import("https://keshavsoft.github.io/json-to-dom/dist/v31/min.js");

const { Table } = await import("https://keshavsoft.github.io/json-to-dom-table/dist/v5/min.js");

import { createDataProvider } from "https://keshavsoft.github.io/json-to-dom-provider/dist/v1/min.js";

// 3. Data Provider configured with endpoints for autocomplete reading and order insertion
const dataProvider = createDataProvider({
    inReadUrl: "/last",
    inCreateUrl: "/last"
});

let jFLocalactionId = () => {
    let jVarLocalactionId = 'actionId'
    let jVarLocalHtmlId = document.getElementById(jVarLocalactionId);

    if (jVarLocalHtmlId === null === false) {
        return jVarLocalHtmlId.value.trim();
    };
};

let jFLocalselect = () => {
    let jVarLocalselect = 'select'
    let jVarLocalHtmlId = document.getElementById(jVarLocalselect);

    if (jVarLocalHtmlId === null === false) {
        return jVarLocalHtmlId.value.trim();
    };
};

const startFunc = async () => {
    const data = await dataProvider.read();

    let specAsJsonToDom = compile({
        specJson: structure, dataJson: { data: data.data }
        , showLog: true
    });
    // 6. Instantiate and render Form
    specToDom({ spec: specAsJsonToDom, targetHtmlId: "table" });
    // const k1 = table.methods.renderContainerHeaderAndData({ targetHtmlId: "table" });

    console.log("------table--- : ", data, specAsJsonToDom);
    const btnShow = document.getElementById("btnShow");

    document.addEventListener("click", (event) => {
        const currentTarget = event.currentTarget;
        const action = jFLocalactionId();
        const company = jFLocalselect();

        console.log("------action--- : ", company, action);

    });

};

startFunc();
