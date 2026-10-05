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
}

function ensureFallbackCompany(selectElement, companyName) {
    if (selectElement.options.length > 0) return;

    const option = document.createElement("option");
    option.value = companyName;
    option.textContent = companyName;
    selectElement.append(option);
}
/**
 * Shared Dynamic Company Dropdown Loader
 * Queries /v2/ws/company and fills an existing <select> or select mount point.
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

const startFunc = async ({
    inSelectElementId = "companySelect",
    inDefaultCompany = "mani9",
    inOnChange = null
} = {}) => {
    const localSelectId = inSelectElementId;
    const localDefault = inDefaultCompany;
    const localOnChange = inOnChange;

    const selectEl = ensureCompanySelect(localSelectId);
    if (!selectEl) return localDefault;

    let selectedValue = localDefault;

    try {
        const response = await fetch("/v2/ws/company");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const companyNames = readCompanyList(payload).map(readCompanyName).filter(Boolean);

        const uniqueCompanies = [...new Set(companyNames)];

        if (uniqueCompanies.length > 0) {
            const saved = localStorage.getItem("selectedTallyCompany");
            if (saved && uniqueCompanies.includes(saved)) {
                selectedValue = saved;
            } else if (uniqueCompanies.includes(localDefault)) {
                selectedValue = localDefault;
            } else {
                selectedValue = uniqueCompanies[0];
            }

            populateCompanySelect(selectEl, uniqueCompanies);
            selectEl.value = selectedValue;
        }
    } catch (err) {
        console.warn("Could not load dynamic company list from /v2/ws/company:", err);
    }

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
