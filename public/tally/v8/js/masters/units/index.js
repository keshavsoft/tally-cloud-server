import toDom from "../../common/toDom.js";

const bindings = [
    { columnName: "tallyName" }
];

const jFLocalcompanySelect = () => {
    const companySelect = document.getElementById("companySelect");
    return companySelect?.value?.trim();
};

const actions = {
    fetchUnits: async () => {
        const company = jFLocalcompanySelect();
        const fetchUrl = `/v2/ws/masters.Unit?company=${encodeURIComponent(company)}`;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        return data?.data ?? [];
    },

    renderUnits: (rows) => {
        toDom(rows, bindings);
    }
};

const startFunc = () => {
    const jVarLocalunitsSideId = document.getElementById('unitsSideId');

    if (!jVarLocalunitsSideId) return;

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const rows = await actions.fetchUnits();
        actions.renderUnits(rows);
    });
};

export { bindings, actions };
export default startFunc;