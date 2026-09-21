import columns from "./columns.json" with { type: "json" };
import configJson from "./config.json" with { type: "json" };
import menuJson from "./menu.json" with { type: "json" };
import selectJson from "./select.json" with { type: "json" };

// import { Table } from "../../src/v5/index.js";

const { Table } = await import("https://keshavsoft.github.io/json-to-dom-table/dist/v6/min.js");

// const { default: compile } = await import("https://keshavsoft.github.io/json-to-spec/dist/v23/min.js");

import { createDataProvider } from "https://keshavsoft.github.io/json-to-dom-provider/dist/v1/min.js";

// 3. Data Provider configured with endpoints for autocomplete reading and order insertion
const dataProvider = createDataProvider({
    inReadUrl: "/last",
    inCreateUrl: "/last"
});

const startFunc = async () => {

    const data = await dataProvider.read();

    // 6. Instantiate and render Form
    const table = new Table({
        theme: "default",
        data: data.data,
        columns,
        config: configJson
    });

    const k1 = table.methods.renderContainerHeaderAndData({ targetHtmlId: "table" });

    console.log("------table--- : ", k1, data, table.methods);
};

const uom = document.getElementById("menu-desktop-UOM");

uom.addEventListener("click", async (event) => {
    const response = await fetch("/company");

    // 3. Wait for the response body to be parsed into JSON
    const company = await response.json();

    let specAsJsonToDom = window.ks['json-to-spec'].buildSpecElement({
        specJson: selectJson, dataJson: { data: company.data }
        , showLog: true
    });
    console.log("specAsJsonToDom : ", specAsJsonToDom);

    const cont1 = window.ks['json-to-tag'].buildSpecElement({ spec: specAsJsonToDom });
    const cont2 = document.getElementById("select");
    cont2.append(cont1);
    console.log("cont1 : ", cont1);
    // startFunc();
});

