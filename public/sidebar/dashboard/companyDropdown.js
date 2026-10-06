import structure from "./structure.json" with {type: "json"};

const render = (structure, data) => {
    let specAsJsonToDom = window.ks.jsonToSpec.buildSpecElement(structure, data);
    console.log("specAsJsonToDom : ", specAsJsonToDom);

    if (!("tagName" in specAsJsonToDom)) {
        specAsJsonToDom = specAsJsonToDom.children;
    };

    const container = document.getElementById("companySelect");

    if (container) container.innerHTML = "";

    const content = window.ks.jsonToTag.buildSpecElement(specAsJsonToDom);
    container.append(content);

    console.log("content : ", content);

};

function ensureCompanySelect(elementId) {
    const target = document.getElementById(elementId);
    if (!target) return null;
    if (target.localName === "select") return target;

    const select = document.createElement("select");
    select.id = elementId;
    select.className = target.className;
    select.classList.add("control-select");
    if (target.hasAttribute("style")) {
        select.setAttribute("style", target.getAttribute("style"));
    }
    target.replaceWith(select);
    return select;
}

function readCompanyList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.companies)) return payload.data.companies;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.companies)) return payload.companies;
    return [];
}

function readCompanyName(item) {
    if (typeof item === "string") return item.trim();
    if (!item || typeof item !== "object") return "";

    const name = item["@_NAME"] ?? item.name ?? item.NAME ?? item["@NAME"];
    return String(name ?? "").trim();
}

function populateCompanySelect(selectElement, companyNames) {
    const options = companyNames.map((companyName) => {
        const option = document.createElement("option");
        option.value = companyName;
        option.textContent = companyName;
        return option;
    });

    selectElement.replaceChildren(...options);
};

function ensureFallbackCompany(selectElement, companyName) {
    if (selectElement.options.length > 0) return;

    const option = document.createElement("option");
    option.value = companyName;
    option.textContent = companyName;
    selectElement.append(option);
};

/**
 * Shared Dynamic Company Dropdown Loader
 * Queries /v2/ws/company and fills an existing <select> or select mount point.
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

const startFunc = async ({
    inDefaultCompany = "mani9",
    inOnChange = null
} = {}) => {
    const localDefault = inDefaultCompany;
    const localOnChange = inOnChange;

    try {
        const response = await fetch("/v2/ws/company");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        console.log("payload--- : ", payload);
        // debugger
        const companyNames = readCompanyList(payload.data.companies).map(readCompanyName).filter(Boolean);

        const uniqueCompanies = [...new Set(companyNames)];

        if (uniqueCompanies.length > 0) {
            console.log("uniqueCompanies:", uniqueCompanies);

            window.ks.jsonRenderers.renderToDom({
                type: "selectOptionsOnly",
                data: uniqueCompanies,
                targetHtmlId: "companySelect"
            });

            // render(structure, { companies: uniqueCompanies });
        };
    } catch (err) {
        console.warn("Could not load dynamic company list from /v2/ws/company:", err);
    };

    ensureFallbackCompany(selectEl, localDefault);

    // Bind change listener
    if (selectEl.dataset.companyDropdownBound !== "true") {
        selectEl.addEventListener("change", (e) => {
            const newComp = e.target.value;
            localStorage.setItem("selectedTallyCompany", newComp);
            if (typeof localOnChange === "function") {
                localOnChange({ inCompany: newComp });
            }
        });
        selectEl.dataset.companyDropdownBound = "true";
    }

    return selectEl.value;
}


export default startFunc;