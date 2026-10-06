// 1. Import compiler & DOM engine directly via GitHub Pages CDN
import { compile } from "https://keshavsoft.github.io/json-to-spec/dist/v1/min.js";
import { buildSpecElement } from "https://keshavsoft.github.io/json-to-dom/dist/v16/min.js";
import companyPull from "./companyDropdown.js";

// Data
const businessDataPayload = {
    menuItems: [
        { name: "Orders", icon: "file-earmark" },
        { name: "Customers", icon: "people" },
        { name: "Keshavsoft", icon: "file-earmark" }
    ]
};

// Fetch Blueprint
const structureBlueprint = await fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json());

// 2. Compile structure.json (HOW) + data.json (WHAT) → spec
const spec = compile({
    inStructure: structureBlueprint.sidebar || structureBlueprint,
    inData: businessDataPayload
});

// 3. Render directly into native browser DOM elements by ID
const domNode = buildSpecElement({ inSpec: spec });
const app = document.getElementById("sidebarContainer");
app.querySelector(".sidebar")?.remove();
app.prepend(domNode);

// 4. Handle active selection & company dropdown
app.querySelectorAll(".nav-link").forEach(link => {
    link.onclick = (e) => {
        if (!link.getAttribute("href") || link.getAttribute("href") === "#") e.preventDefault();
        app.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
    };
});

companyPull();
