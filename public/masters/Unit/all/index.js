/**
 * Unit.all Frontend Controller
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

let globalRawData = [];
let globalFilteredData = [];

function getUnitSymbol({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "-";
    return localItem.name ?? localItem["@_NAME"] ?? localItem.NAME ?? localItem.symbol ?? "-";
}

function getUnitFormalName({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "-";
    return localItem.originalName ?? localItem.ORIGINALNAME ?? localItem.formalName ?? "-";
}

function getUnitDecimals({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "0";
    return String(localItem.decimalPlaces ?? localItem.DECIMALPLACES ?? "0");
}

function updateStatus({ inState, inMessage }) {
    const localState = inState;
    const localMessage = inMessage;

    const statusEl = document.getElementById("connectionStatus");
    const statusTextEl = document.getElementById("statusText");
    const dotEl = statusEl ? statusEl.querySelector(".status-dot") : null;

    if (statusTextEl) statusTextEl.textContent = localMessage;

    if (dotEl) {
        dotEl.className = "status-dot";
        if (localState === "loading") dotEl.classList.add("loading");
        else if (localState === "error") dotEl.classList.add("error");
    }
}

function renderKpis({ inRawItems, inFilteredItems }) {
    const localRawItems = inRawItems;
    const localFilteredItems = inFilteredItems;

    const elTotal = document.getElementById("statTotalUnits");
    const elMatching = document.getElementById("statMatchingUnits");

    if (elTotal) elTotal.textContent = localRawItems.length.toLocaleString();
    if (elMatching) elMatching.textContent = localFilteredItems.length.toLocaleString();
}

function renderTable({ inItems }) {
    const localItems = inItems;
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (!localItems || localItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4">
              <div class="empty-state">
                <i class="bi bi-search"></i>
                <p>No matching units found.</p>
              </div>
            </td>
          </tr>
        `;
        return;
    }

    const rowsHtml = localItems.map((item, index) => {
        const symbol = getUnitSymbol({ inItem: item });
        const formalName = getUnitFormalName({ inItem: item });
        const decimals = getUnitDecimals({ inItem: item });

        return `
          <tr>
            <td style="color: var(--text-muted); font-family: var(--font-mono);">${index + 1}</td>
            <td>
              <span class="chip chip-cyan">${symbol}</span>
            </td>
            <td class="cell-title">${formalName}</td>
            <td class="cell-mono">${decimals}</td>
          </tr>
        `;
    }).join("");

    tbody.innerHTML = rowsHtml;
}

function applyFilters({ inRawItems, inSearchQuery }) {
    const localRawItems = inRawItems;
    const localSearchQuery = (inSearchQuery || "").toLowerCase().trim();

    if (!localSearchQuery) return localRawItems;

    return localRawItems.filter((item) => {
        const symbol = getUnitSymbol({ inItem: item }).toLowerCase();
        const formalName = getUnitFormalName({ inItem: item }).toLowerCase();
        return symbol.includes(localSearchQuery) || formalName.includes(localSearchQuery);
    });
}

function refreshView() {
    const searchInput = document.getElementById("searchInput");
    const searchQuery = searchInput ? searchInput.value : "";

    globalFilteredData = applyFilters({
        inRawItems: globalRawData,
        inSearchQuery: searchQuery
    });

    renderKpis({ inRawItems: globalRawData, inFilteredItems: globalFilteredData });
    renderTable({ inItems: globalFilteredData });
}

async function fetchUnits({ inCompany }) {
    const localCompany = (inCompany || "").trim();
    const btnFetch = document.getElementById("btnFetch");
    const jsonViewer = document.getElementById("jsonViewerContent");

    if (btnFetch) {
        btnFetch.disabled = true;
        btnFetch.innerHTML = `<span class="spinner"></span> <span>Fetching...</span>`;
    }

    updateStatus({ inState: "loading", inMessage: `Fetching units for "${localCompany}"...` });

    try {
        const url = `/v2/ws/Unit.all?company=${encodeURIComponent(localCompany)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const payload = await response.json();
        const items = Array.isArray(payload) ? payload : (payload.data || []);

        globalRawData = items;

        if (jsonViewer) {
            jsonViewer.textContent = JSON.stringify(payload, null, 2);
        }

        updateStatus({ inState: "ready", inMessage: `Loaded ${items.length} units (${new Date().toLocaleTimeString()})` });
        refreshView();
    } catch (err) {
        console.error("Fetch units failed:", err);
        updateStatus({ inState: "error", inMessage: `Fetch failed: ${err.message}` });
    } finally {
        if (btnFetch) {
            btnFetch.disabled = false;
            btnFetch.innerHTML = `<i class="bi bi-arrow-repeat"></i> <span>Fetch Units</span>`;
        }
    }
}

function initEventListeners() {
    const btnFetch = document.getElementById("btnFetch");
    const companyInput = document.getElementById("companyInput");
    const searchInput = document.getElementById("searchInput");
    const tabTable = document.getElementById("tabTable");
    const tabJson = document.getElementById("tabJson");
    const tableView = document.getElementById("tableView");
    const jsonView = document.getElementById("jsonView");
    const btnCopyJson = document.getElementById("btnCopyJson");

    if (btnFetch && companyInput) {
        btnFetch.addEventListener("click", () => {
            fetchUnits({ inCompany: companyInput.value });
        });

        companyInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") fetchUnits({ inCompany: companyInput.value });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => refreshView());
    }

    if (tabTable && tabJson && tableView && jsonView) {
        tabTable.addEventListener("click", () => {
            tabTable.classList.add("active");
            tabJson.classList.remove("active");
            tableView.style.display = "block";
            jsonView.style.display = "none";
        });

        tabJson.addEventListener("click", () => {
            tabJson.classList.add("active");
            tabTable.classList.remove("active");
            tableView.style.display = "none";
            jsonView.style.display = "block";
        });
    }

    if (btnCopyJson) {
        btnCopyJson.addEventListener("click", async () => {
            const jsonViewer = document.getElementById("jsonViewerContent");
            if (jsonViewer && jsonViewer.textContent) {
                await navigator.clipboard.writeText(jsonViewer.textContent);
                btnCopyJson.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
                setTimeout(() => { btnCopyJson.innerHTML = `<i class="bi bi-clipboard"></i> Copy JSON`; }, 2000);
            }
        });
    }
}

initEventListeners();

const initialCompanyInput = document.getElementById("companyInput");
if (initialCompanyInput && initialCompanyInput.value) {
    fetchUnits({ inCompany: initialCompanyInput.value });
}
