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

    const name = item["@_NAME"] ?? item.Name ?? item.name ?? item.NAME ?? item["@NAME"];
    return String(name ?? "").trim();
}

const startFunc = async ({
    inDefaultCompany = "mani9",
    inOnChange = null
} = {}) => {
    const localDefault = inDefaultCompany;
    const localOnChange = inOnChange;

    try {
        const response = await fetch("/v2/ws/tally.company.fetch");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        };

        const payload = await response.json();

        const companyNames = readCompanyList(payload.data.Companies).map(readCompanyName).filter(Boolean);

        const uniqueCompanies = [...new Set(companyNames)];

        if (uniqueCompanies.length > 0) {
            window.ks.jsonRenderers.renderToDom({
                type: "selectOptionsOnly",
                data: uniqueCompanies,
                targetHtmlId: "companySelect",
                appendPosition: "prepend"
            });
        };
    } catch (err) {
        console.warn("Could not load dynamic company list from /v2/ws/company:", err);
    };
};

export default startFunc;