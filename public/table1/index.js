import columns from "./columns.json" with { type: "json" };
import configJson from "./config.json" with { type: "json" };

// import { Table } from "../../src/v5/index.js";

const { Table } = await import("https://keshavsoft.github.io/json-to-dom-table/dist/v5/min.js");

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

startFunc();
