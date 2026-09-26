/**
 * StockGroup withParent Frontend Controller
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

import { initCompanyDropdown } from "/js/companyDropdown.js";

let globalRawData = [];
let globalFilteredData = [];

function getGroupName({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "Unnamed Group";
    return localItem.name ?? localItem["@_NAME"] ?? localItem.NAME ?? "Unnamed Group";
}

function getGroupParent({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "Primary";
    const parent = localItem.parent ?? localItem.PARENT ?? "";
    return parent && String(parent).trim() ? String(parent).trim() : "Primary";
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

    let primaryCount = 0;
    localRawItems.forEach((item) => {
        const parent = getGroupParent({ inItem: item }).toLowerCase();
        if (parent === "primary") primaryCount += 1;
    });

    const elTotal = document.getElementById("statTotalGroups");
    const elPrimary = document.getElementById("statPrimaryGroups");
    const elMatching = document.getElementById("statMatching");

    if (elTotal) elTotal.textContent = localRawItems.length.toLocaleString();
    if (elPrimary) elPrimary.textContent = primaryCount.toLocaleString();
    if (elMatching) elMatching.textContent = localFilteredItems.length.toLocaleString();
}

function renderTable({ inItems }) {
    const localItems = inItems;
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (!localItems || localItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="3">
              <div class="empty-state">
                <i class="bi bi-search"></i>
                <p>No matching stock groups found.</p>
              </div>
            </td>
          </tr>
        `;
        return;
    }

    const rowsHtml = localItems.map((item, index) => {
        const name = getGroupName({ inItem: item });
        const parent = getGroupParent({ inItem: item });
        const isPrimary = parent.toLowerCase() === "primary";

        return `
          <tr>
            <td style="color: var(--text-muted); font-family: var(--font-mono);">${index + 1}</td>
            <td class="cell-title">${name}</td>
            <td>
              <span class="chip ${isPrimary ? 'chip-cyan' : 'chip-purple'}">
                <i class="bi ${isPrimary ? 'bi-shield-check' : 'bi-arrow-return-right'} me-1"></i>${parent}
              </span>
            </td>
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
        const name = getGroupName({ inItem: item }).toLowerCase();
        const parent = getGroupParent({ inItem: item }).toLowerCase();
        return name.includes(localSearchQuery) || parent.includes(localSearchQuery);
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

async function fetchGroups({ inCompany }) {
    const localCompany = (inCompany || "").trim();
    const btnFetch = document.getElementById("btnFetch");
    const jsonViewer = document.getElementById("jsonViewerContent");

    if (btnFetch) {
        btnFetch.disabled = true;
        btnFetch.innerHTML = `<span class="spinner"></span> <span>Fetching...</span>`;
    }

    updateStatus({ inState: "loading", inMessage: `Fetching for "${localCompany}"...` });

    try {
        const url = `/v2/ws/StockGroup.withParent?company=${encodeURIComponent(localCompany)}`;
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

        updateStatus({ inState: "ready", inMessage: `Loaded ${items.length} groups (${new Date().toLocaleTimeString()})` });
        refreshView();
    } catch (err) {
        console.error("Fetch groups failed:", err);
        updateStatus({ inState: "error", inMessage: `Fetch failed: ${err.message}` });
    } finally {
        if (btnFetch) {
            btnFetch.disabled = false;
            btnFetch.innerHTML = `<i class="bi bi-arrow-repeat"></i> <span>Fetch Groups</span>`;
        }
    }
}

function initEventListeners() {
    const btnFetch = document.getElementById("btnFetch");
    const companySelect = document.getElementById("companySelect");
    const searchInput = document.getElementById("searchInput");
    const tabTable = document.getElementById("tabTable");
    const tabJson = document.getElementById("tabJson");
    const tableView = document.getElementById("tableView");
    const jsonView = document.getElementById("jsonView");
    const btnCopyJson = document.getElementById("btnCopyJson");

    if (btnFetch && companySelect) {
        btnFetch.addEventListener("click", () => {
            fetchGroups({ inCompany: companySelect.value });
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

(async function init() {
    const selectedCompany = await initCompanyDropdown({
        inSelectElementId: "companySelect",
        inDefaultCompany: "mani9",
        inOnChange: ({ inCompany }) => {
            fetchGroups({ inCompany });
        }
    });

    if (selectedCompany) {
        fetchGroups({ inCompany: selectedCompany });
    }
})();
