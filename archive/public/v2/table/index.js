// import { default as compile } from "../../src/index.js";
// import * as domEngine from "./json-to-dom.v27.min.js";

import { default as compile } from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";

import { specToDom } from "https://keshavsoft.github.io/json-to-dom/dist/v31/min.js";

const folder = "input";
let actionBinding = null;
let state = { structure: null, data: null, compiled: null };
const htmlId2 = "table-body";
const htmlId1 = "body-row";
const htmlId = "table";

const loadInput = async () => {
  const [structure, columns, data] = await Promise.all([
    fetch(`./${folder}/structure.json`).then((r) => r.json()),
    fetch(`./${folder}/data.json`).then((r) => r.json()),
    fetch(`/last`).then((r) => r.json())
  ]);

  return {
    structure,
    columns,
    data
  };
};

const render = (structure, data) => {
  let specAsJsonToDom = compile({
    specJson: structure, dataJson: data
  });
  console.log("specAsJsonToDom------------ : ", data);

  if (!("tagName" in specAsJsonToDom)) {
    specAsJsonToDom = specAsJsonToDom.children;
  };

  const container = document.getElementById(htmlId);

  if (container) container.innerHTML = "";

  specToDom({ spec: specAsJsonToDom, targetHtmlId: htmlId });
};

const start = async () => {
  try {
    const {
      structure,
      columns,
      data
    } = await loadInput();

    columns.data = data.data;

    render(structure, columns);
  } catch (err) {
    const container = document.getElementById("dom-render-container");
    if (container) container.innerHTML = `<div style="color:#b91c1c">Error: ${err.message}</div>`;
  }
};

start();

const head1 = document.getElementById("head1");
const version = window?.ks?.["json-to-spec"]?.meta?.version;
if (version && head1) {
  head1.innerHTML += ` - ${version}`;
};
