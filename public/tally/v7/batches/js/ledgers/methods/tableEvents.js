import "https://keshavsoft.github.io/dom-primitive-engine/dist/v13/min.js";

const rowInstructions = columns => [
  {
    sourcePath: { fileName: "root" },
    func: "closest",
    arguments: { selector: "tr" }
  },
  {
    sourcePath: { fileName: "previous" },
    func: "querySelectorAll",
    arguments: { selector: "td" }
  },
  {
    sourcePath: { fileName: "previous" },
    func: "mapValues",
    arguments: { columns, read: "text" }
  }
];

const footerInstructions = [
  {
    sourcePath: { fileName: "root" },
    func: "closest",
    arguments: { selector: "tfoot tr" },
    required: true
  },
  {
    sourcePath: { fileName: "previous" },
    func: "querySelectorAll",
    arguments: { selector: "input, select, textarea" }
  },
  {
    sourcePath: { fileName: "previous" },
    func: "mapNamedValues"
  }
];

export const readRow = (button, columns) => {
  if (!button) throw new TypeError("A row button is required.");
  return window.ks.domPrimitiveEngine.runInstructions(button, rowInstructions(columns));
};

export const readFooter = button => {
  if (!button) throw new TypeError("The footer Save button is required.");
  return window.ks.domPrimitiveEngine.runInstructions(button, footerInstructions);
};
