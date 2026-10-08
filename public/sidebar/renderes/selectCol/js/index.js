// Import JSON Renderer
import "https://keshavsoft.github.io/json-renderers/dist/v13/min.js";

// --------------------------------------------------
// 1. Data
// --------------------------------------------------

const menuItems = [{
    name: "Orders",
    icon: "file-earmark"
},
{
    name: "Customers",
    icon: "people"
},
{
    name: "Keshavsoft",
    icon: "file-earmark"
}
];

// --------------------------------------------------
// 2. Fetch Structure Blueprint
// --------------------------------------------------

const structureBlueprint = await fetch(
    new URL("../json/spec.json", import.meta.url)
).then((response) => response.json());

// --------------------------------------------------
// 3. Compile Structure + Data → Final Spec
// --------------------------------------------------

const spec = window.ks.jsonToSpec.buildSpecElement(
    structureBlueprint.sidebar || structureBlueprint,
    {
        menuItems
    }
);

// --------------------------------------------------
// 4. Render Sidebar
// --------------------------------------------------

const sidebarRenderer =
    window.ks["json-renderers"]?.buildSpecElement ||
    window.ks.jsonToTag.buildSpecElement;

document
    .getElementById("sidebarContainer")
    .prepend(sidebarRenderer(spec));

// --------------------------------------------------
// 5. Render Company Select
// --------------------------------------------------

document
    .querySelector(".btn-toolbar")
    .prepend(
        window.ks.jsonToTag.buildSpecElement(
            structureBlueprint.companySelect
        )
    );

// --------------------------------------------------
// 6. Render Select Options
// --------------------------------------------------

const render =
    window.ks?.jsonRenderers?.renderToDom ||
    window.ks?.jsonRenderers;

render({
    type: "selectOptionsOnly",
    data: [
        "Executive Suite",
        "Deluxe Room",
        "Keshavsoft"
    ],
    targetHtmlId: "companySelect"
});