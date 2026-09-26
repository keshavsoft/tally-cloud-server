/**
 * Ledger withGstDetails Frontend Controller
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

let globalRawData = [];
let globalFilteredData = [];

function getLedgerName({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "Unnamed Ledger";
    return localItem.name ?? localItem["@_NAME"] ?? localItem.NAME ?? "Unnamed Ledger";
}

function getGstDetails({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return null;

    const rawGst = localItem.gstRegDetails 
        ?? localItem["LEDGSTREGDETAILS.LIST"] 
        ?? localItem.LEDGSTREGDETAILS 
        ?? null;

    if (!rawGst || typeof rawGst !== "object") return null;

    if (Array.isArray(rawGst)) {
        return rawGst.length > 0 ? rawGst[0] : null;
    }

    return Object.keys(rawGst).length > 0 ? rawGst : null;
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

    let registeredCount = 0;
    const stateSet = new Set();

    localRawItems.forEach((item) => {
        const gst = getGstDetails({ inItem: item });
        if (gst) {
            const regType = gst.GSTREGISTRATIONTYPE ?? gst.gstRegistrationType ?? "";
            if (regType) registeredCount += 1;

            const state = gst.STATE ?? gst.state ?? gst.PLACEOFSUPPLY ?? "";
            if (state && String(state).trim()) stateSet.add(String(state).trim());
        }
    });

    const elTotal = document.getElementById("statTotalLedgers");
    const elRegistered = document.getElementById("statGstRegistered");
    const elStates = document.getElementById("statTotalStates");
    const elMatching = document.getElementById("statMatching");
    const lblHasGst = document.getElementById("lblHasGst");

    if (elTotal) elTotal.textContent = localRawItems.length.toLocaleString();
    if (elRegistered) elRegistered.textContent = registeredCount.toLocaleString();
    if (elStates) elStates.textContent = stateSet.size.toLocaleString();
    if (elMatching) elMatching.textContent = localFilteredItems.length.toLocaleString();

    if (lblHasGst) {
        lblHasGst.textContent = `Only with GST Details (${registeredCount.toLocaleString()})`;
    }
}

function renderTable({ inItems }) {
    const localItems = inItems;
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (!localItems || localItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5">
              <div class="empty-state">
                <i class="bi bi-search"></i>
                <p>No matching ledgers found.</p>
              </div>
            </td>
          </tr>
        `;
        return;
    }

    const rowsHtml = localItems.map((item, index) => {
        const name = getLedgerName({ inItem: item });
        const gst = getGstDetails({ inItem: item });

        const regType = gst?.GSTREGISTRATIONTYPE ?? gst?.gstRegistrationType ?? "-";
        const state = gst?.STATE ?? gst?.state ?? gst?.PLACEOFSUPPLY ?? "-";
        const appFrom = gst?.APPLICABLEFROM ?? gst?.applicableFrom ?? "-";

        let chipClass = "chip-purple";
        if (regType.toLowerCase() === "regular") chipClass = "chip-emerald";
        else if (regType.toLowerCase().includes("composition")) chipClass = "chip-cyan";

        return `
          <tr>
            <td style="color: var(--text-muted); font-family: var(--font-mono);">${index + 1}</td>
            <td class="cell-title">${name}</td>
            <td>
              ${regType !== "-" ? `<span class="chip ${chipClass}">${regType}</span>` : `<span style="color:var(--text-muted); font-style:italic;">Not registered</span>`}
            </td>
            <td>${state}</td>
            <td class="cell-mono">${appFrom}</td>
          </tr>
        `;
    }).join("");

    tbody.innerHTML = rowsHtml;
}

function applyFilters({ inRawItems, inSearchQuery, inHasGstOnly }) {
    const localRawItems = inRawItems;
    const localSearchQuery = (inSearchQuery || "").toLowerCase().trim();
    const localHasGstOnly = inHasGstOnly;

    return localRawItems.filter((item) => {
        const gst = getGstDetails({ inItem: item });

        if (localHasGstOnly && !gst) {
            return false;
        }

        if (!localSearchQuery) return true;

        const name = getLedgerName({ inItem: item }).toLowerCase();
        const regType = (gst?.GSTREGISTRATIONTYPE ?? gst?.gstRegistrationType ?? "").toLowerCase();
        const state = (gst?.STATE ?? gst?.state ?? gst?.PLACEOFSUPPLY ?? "").toLowerCase();

        return name.includes(localSearchQuery) || regType.includes(localSearchQuery) || state.includes(localSearchQuery);
    });
}

function refreshView() {
    const searchInput = document.getElementById("searchInput");
    const chkHasGstOnly = document.getElementById("chkHasGstOnly");

    const searchQuery = searchInput ? searchInput.value : "";
    const hasGstOnly = chkHasGstOnly ? chkHasGstOnly.checked : false;

    globalFilteredData = applyFilters({
        inRawItems: globalRawData,
        inSearchQuery: searchQuery,
        inHasGstOnly: hasGstOnly
    });

    renderKpis({ inRawItems: globalRawData, inFilteredItems: globalFilteredData });
    renderTable({ inItems: globalFilteredData });
}

async function fetchLedgers({ inCompany }) {
    const localCompany = (inCompany || "").trim();
    const btnFetch = document.getElementById("btnFetch");
    const jsonViewer = document.getElementById("jsonViewerContent");

    if (btnFetch) {
        btnFetch.disabled = true;
        btnFetch.innerHTML = `<span class="spinner"></span> <span>Fetching...</span>`;
    }

    updateStatus({ inState: "loading", inMessage: `Fetching for "${localCompany}"...` });

    try {
        const url = `/v2/ws/Ledger.withGstDetails?company=${encodeURIComponent(localCompany)}`;
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

        updateStatus({ inState: "ready", inMessage: `Loaded ${items.length} ledgers (${new Date().toLocaleTimeString()})` });
        refreshView();
    } catch (err) {
        console.error("Fetch ledgers failed:", err);
        updateStatus({ inState: "error", inMessage: `Fetch failed: ${err.message}` });
    } finally {
        if (btnFetch) {
            btnFetch.disabled = false;
            btnFetch.innerHTML = `<i class="bi bi-arrow-repeat"></i> <span>Fetch Ledgers</span>`;
        }
    }
}

function initEventListeners() {
    const btnFetch = document.getElementById("btnFetch");
    const companyInput = document.getElementById("companyInput");
    const searchInput = document.getElementById("searchInput");
    const chkHasGstOnly = document.getElementById("chkHasGstOnly");
    const tabTable = document.getElementById("tabTable");
    const tabJson = document.getElementById("tabJson");
    const tableView = document.getElementById("tableView");
    const jsonView = document.getElementById("jsonView");
    const btnCopyJson = document.getElementById("btnCopyJson");

    if (btnFetch && companyInput) {
        btnFetch.addEventListener("click", () => {
            fetchLedgers({ inCompany: companyInput.value });
        });

        companyInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") fetchLedgers({ inCompany: companyInput.value });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => refreshView());
    }

    if (chkHasGstOnly) {
        chkHasGstOnly.addEventListener("change", () => refreshView());
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
    fetchLedgers({ inCompany: initialCompanyInput.value });
}
