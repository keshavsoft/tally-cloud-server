/**
 * Shared Dynamic Company Dropdown Loader
 * Queries /v2/ws/company and populates any <select> element.
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

export async function initCompanyDropdown({
    inSelectElementId = "companySelect",
    inDefaultCompany = "mani9",
    inOnChange = null
} = {}) {
    const localSelectId = inSelectElementId;
    const localDefault = inDefaultCompany;
    const localOnChange = inOnChange;

    const selectEl = document.getElementById(localSelectId);
    if (!selectEl) return localDefault;

    let selectedValue = localDefault;

    try {
        const response = await fetch("/v2/ws/company");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const rawList = Array.isArray(payload) ? payload : (payload.data || []);

        const companyNames = rawList.map((item) => {
            if (typeof item === "string") return item.trim();
            if (!item || typeof item !== "object") return "";
            return (item["@_NAME"] ?? item.name ?? item.NAME ?? item["@NAME"] ?? "").trim();
        }).filter(Boolean);

        const uniqueCompanies = [...new Set(companyNames)];

        if (uniqueCompanies.length > 0) {
            selectEl.innerHTML = "";
            uniqueCompanies.forEach((comp) => {
                const opt = document.createElement("option");
                opt.value = comp;
                opt.textContent = comp;
                selectEl.appendChild(opt);
            });

            // Restore from localStorage or use default
            const saved = localStorage.getItem("selectedTallyCompany");
            if (saved && uniqueCompanies.includes(saved)) {
                selectedValue = saved;
            } else if (uniqueCompanies.includes(localDefault)) {
                selectedValue = localDefault;
            } else {
                selectedValue = uniqueCompanies[0];
            }

            selectEl.value = selectedValue;
        } else {
            // Keep default if array is empty
            if (selectEl.options.length === 0) {
                const opt = document.createElement("option");
                opt.value = localDefault;
                opt.textContent = localDefault;
                selectEl.appendChild(opt);
            }
        }
    } catch (err) {
        console.warn("Could not load dynamic company list from /v2/ws/company:", err);
        if (selectEl.options.length === 0) {
            const opt = document.createElement("option");
            opt.value = localDefault;
            opt.textContent = localDefault;
            selectEl.appendChild(opt);
        }
    }

    // Bind change listener
    selectEl.addEventListener("change", (e) => {
        const newComp = e.target.value;
        localStorage.setItem("selectedTallyCompany", newComp);
        if (typeof localOnChange === "function") {
            localOnChange({ inCompany: newComp });
        }
    });

    return selectEl.value;
}
