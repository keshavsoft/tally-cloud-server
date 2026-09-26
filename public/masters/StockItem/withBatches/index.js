/**
 * StockItem withBatches Frontend Controller
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

import { initCompanyDropdown } from "/js/companyDropdown.js";

// Application State
let globalRawData = [];
let globalFilteredData = [];

/**
 * Extracts item name safely across raw, cleaned, or renamed schemas
 */
function getItemName({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "Unnamed Item";
    return localItem.name 
        ?? localItem["@_NAME"] 
        ?? localItem.NAME 
        ?? localItem["@NAME"] 
        ?? "Unnamed Item";
}

/**
 * Extracts base UOM safely across raw, cleaned, or renamed schemas
 */
function getItemUom({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "-";
    return localItem.baseUnits 
        ?? localItem.BASEUNITS 
        ?? localItem["BASEUNITS"] 
        ?? "-";
}

/**
 * Normalizes batchAllocations field which may be null, empty string, single object, or array
 * Handles both Tally raw/cleaned schema (BATCHALLOCATIONS.LIST) and renamed schema (batchAllocations).
 */
function normalizeBatches({ inItem }) {
    const localItem = inItem;

    if (!localItem || typeof localItem !== "object") {
        return [];
    }

    const rawBatches = localItem.batchAllocations 
        ?? localItem["BATCHALLOCATIONS.LIST"] 
        ?? localItem.BATCHALLOCATIONS 
        ?? localItem["BATCHALLOCATIONS"] 
        ?? null;

    if (!rawBatches || typeof rawBatches !== "object") {
        return [];
    }

    const list = Array.isArray(rawBatches) ? rawBatches : [rawBatches];

    return list.filter((b) => {
        if (!b || typeof b !== "object") return false;
        // Verify entry has actual batch identifier or balance or godown
        const batchName = b.BATCHNAME ?? b.batchName ?? b["@_NAME"] ?? b.NAME ?? b.name ?? "";
        const godown = b.GODOWNNAME ?? b.godownName ?? b.godown ?? "";
        const balance = b.OPENINGBALANCE ?? b.openingBalance ?? b.balance ?? "";
        return Boolean(String(batchName).trim() || String(godown).trim() || String(balance).trim());
    });
}

/**
 * Updates UI connection status indicator
 */
function updateStatus({ inState, inMessage }) {
    const localState = inState;
    const localMessage = inMessage;

    const statusEl = document.getElementById("connectionStatus");
    const statusTextEl = document.getElementById("statusText");
    const dotEl = statusEl ? statusEl.querySelector(".status-dot") : null;

    if (statusTextEl) {
        statusTextEl.textContent = localMessage;
    }

    if (dotEl) {
        dotEl.className = "status-dot";
        if (localState === "loading") {
            dotEl.classList.add("loading");
        } else if (localState === "error") {
            dotEl.classList.add("error");
        }
    }
}

/**
 * Calculates and renders KPI metric cards from the entire loaded dataset
 */
function renderKpis({ inRawItems }) {
    const localRawItems = inRawItems;

    let itemsWithBatchesCount = 0;
    let totalBatchesCount = 0;
    const godownSet = new Set();

    localRawItems.forEach((item) => {
        const batches = normalizeBatches({ inItem: item });
        if (batches.length > 0) {
            itemsWithBatchesCount += 1;
            totalBatchesCount += batches.length;
            batches.forEach((b) => {
                const godown = b.GODOWNNAME ?? b.godownName ?? b.godown;
                if (godown && String(godown).trim()) {
                    godownSet.add(String(godown).trim());
                }
            });
        }
    });

    const elTotal = document.getElementById("statTotalItems");
    const elWithBatches = document.getElementById("statItemsWithBatches");
    const elTotalBatches = document.getElementById("statTotalBatches");
    const elGodowns = document.getElementById("statTotalGodowns");
    const lblHasBatches = document.getElementById("lblHasBatches");

    if (elTotal) elTotal.textContent = localRawItems.length.toLocaleString();
    if (elWithBatches) elWithBatches.textContent = itemsWithBatchesCount.toLocaleString();
    if (elTotalBatches) elTotalBatches.textContent = totalBatchesCount.toLocaleString();
    if (elGodowns) elGodowns.textContent = godownSet.size.toLocaleString();

    if (lblHasBatches) {
        lblHasBatches.textContent = `Only items with batches (${itemsWithBatchesCount.toLocaleString()})`;
    }
}

/**
 * Creates HTML string for batches inside an item row
 */
function renderBatchAllocationsHtml({ inBatches }) {
    const localBatches = inBatches;

    if (!localBatches || localBatches.length === 0) {
        return `<span class="no-batch-muted"><i class="bi bi-dash-circle me-1"></i>No batch allocations</span>`;
    }

    const batchCardsHtml = localBatches.map((b) => {
        const batchName = b.BATCHNAME ?? b.batchName ?? b["@_NAME"] ?? b.NAME ?? b.name ?? "Primary / Default";
        const godownName = b.GODOWNNAME ?? b.godownName ?? b.godown ?? "-";
        const balance = b.OPENINGBALANCE ?? b.openingBalance ?? b.balance ?? b.BILLEDQTY ?? "-";
        const rate = b.OPENINGRATE ?? b.openingRate ?? b.rate ?? "-";
        const rawVal = b.OPENINGVALUE ?? b.openingValue ?? b.value ?? b.AMOUNT;
        const value = typeof rawVal === "number" ? rawVal.toLocaleString() : (rawVal || "-");

        return `
          <div class="batch-card">
            <div class="batch-title">
              <i class="bi bi-tag-fill"></i>
              <span>${batchName}</span>
            </div>
            <div class="batch-godown">
              <i class="bi bi-geo-alt-fill text-secondary me-1"></i>${godownName}
            </div>
            <div class="batch-balance">
              ${balance}
            </div>
            <div class="batch-rate">
              ${rate}
            </div>
            <div class="batch-val">
              ₹ ${value}
            </div>
          </div>
        `;
    }).join("");

    return `<div class="batch-container">${batchCardsHtml}</div>`;
}

/**
 * Renders the table view rows
 */
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
                <p>No matching stock items found for current filter.</p>
              </div>
            </td>
          </tr>
        `;
        return;
    }

    const rowsHtml = localItems.map((item, index) => {
        const batches = normalizeBatches({ inItem: item });
        const batchContent = renderBatchAllocationsHtml({ inBatches: batches });
        const itemName = getItemName({ inItem: item });
        const baseUom = getItemUom({ inItem: item });

        return `
          <tr>
            <td style="color: var(--text-muted); font-family: monospace;">${index + 1}</td>
            <td class="item-name-cell">
              <div>${itemName}</div>
              ${batches.length > 0 ? `<small class="badge-tag" style="display:inline-block; margin-top:0.25rem;">${batches.length} batch(es)</small>` : ""}
            </td>
            <td>
              <span class="uom-chip">${baseUom}</span>
            </td>
            <td>
              ${batchContent}
            </td>
          </tr>
        `;
    }).join("");

    tbody.innerHTML = rowsHtml;
}

/**
 * Applies search input and 'has batches only' checkbox filters
 */
function applyFilters({ inRawItems, inSearchQuery, inHasBatchesOnly }) {
    const localRawItems = inRawItems;
    const localSearchQuery = (inSearchQuery || "").toLowerCase().trim();
    const localHasBatchesOnly = inHasBatchesOnly;

    return localRawItems.filter((item) => {
        const batches = normalizeBatches({ inItem: item });

        if (localHasBatchesOnly && batches.length === 0) {
            return false;
        }

        if (!localSearchQuery) {
            return true;
        }

        const itemName = getItemName({ inItem: item }).toLowerCase();
        const baseUom = getItemUom({ inItem: item }).toLowerCase();

        const itemNameMatch = itemName.includes(localSearchQuery);
        const uomMatch = baseUom.includes(localSearchQuery);

        const batchMatch = batches.some((b) => {
            const bName = String(b.BATCHNAME ?? b.batchName ?? b["@_NAME"] ?? "").toLowerCase();
            const gName = String(b.GODOWNNAME ?? b.godownName ?? "").toLowerCase();
            return bName.includes(localSearchQuery) || gName.includes(localSearchQuery);
        });

        return itemNameMatch || uomMatch || batchMatch;
    });
}

/**
 * Refreshes view based on current filter states
 */
function refreshView() {
    const searchInput = document.getElementById("searchInput");
    const chkHasBatchesOnly = document.getElementById("chkHasBatchesOnly");

    const searchQuery = searchInput ? searchInput.value : "";
    const hasBatchesOnly = chkHasBatchesOnly ? chkHasBatchesOnly.checked : false;

    globalFilteredData = applyFilters({
        inRawItems: globalRawData,
        inSearchQuery: searchQuery,
        inHasBatchesOnly: hasBatchesOnly
    });

    renderTable({ inItems: globalFilteredData });
}

/**
 * Fetches StockItem.withBatches from cloud server endpoint
 */
async function fetchStockItemsWithBatches({ inCompany }) {
    const localCompany = (inCompany || "").trim();
    const btnFetch = document.getElementById("btnFetch");
    const jsonViewer = document.getElementById("jsonViewerContent");

    if (btnFetch) {
        btnFetch.disabled = true;
        btnFetch.innerHTML = `<span class="spinner"></span> <span>Fetching...</span>`;
    }

    updateStatus({ inState: "loading", inMessage: `Fetching for "${localCompany}"...` });

    try {
        const url = `/v2/ws/StockItem.withBatches?company=${encodeURIComponent(localCompany)}`;
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

        renderKpis({ inRawItems: globalRawData });
        updateStatus({ inState: "ready", inMessage: `Loaded ${items.length} items (${new Date().toLocaleTimeString()})` });
        refreshView();
    } catch (err) {
        console.error("Fetch failed:", err);
        updateStatus({ inState: "error", inMessage: `Fetch failed: ${err.message}` });

        const tbody = document.getElementById("tableBody");
        if (tbody) {
            tbody.innerHTML = `
              <tr>
                <td colspan="4">
                  <div class="empty-state">
                    <i class="bi bi-exclamation-triangle" style="color: #ef4444;"></i>
                    <p style="color: #fca5a5; font-weight: 600;">Failed to fetch from Cloud Server</p>
                    <p style="font-size:0.85rem; max-width: 500px; margin: 0 auto 1rem;">
                      Ensure <code>tally-cloud-server</code> is running on port 9011 and <code>tally-local-server</code> is connected via WebSocket to Tally Prime.
                    </p>
                    <button id="btnLoadSampleData" class="btn-docs-link" style="margin: 0 auto;">
                      <i class="bi bi-file-earmark-code"></i> Load Sample Cached Batch Data
                    </button>
                  </div>
                </td>
              </tr>
            `;

            const btnLoadSample = document.getElementById("btnLoadSampleData");
            if (btnLoadSample) {
                btnLoadSample.addEventListener("click", () => {
                    loadDemoDataset();
                });
            }
        }
    } finally {
        if (btnFetch) {
            btnFetch.disabled = false;
            btnFetch.innerHTML = `<i class="bi bi-arrow-repeat"></i> <span>Fetch Batches</span>`;
        }
    }
}

/**
 * Loads built-in sample dataset for offline / development preview
 */
function loadDemoDataset() {
    globalRawData = [
        {
            "@_NAME": "0.09/30mm High Tensile Steel",
            "BASEUNITS": "kgs",
            "BATCHALLOCATIONS.LIST": {
                "MFDON": "01-Apr-2026",
                "GODOWNNAME": "Main Location",
                "BATCHNAME": "Navratan-Rs.1210/-",
                "OPENINGBALANCE": "125.500 kgs",
                "OPENINGVALUE": 151855,
                "OPENINGRATE": "1210.00/kgs",
                "EXPIRYPERIOD": "31-Mar-2027"
            }
        },
        {
            "@_NAME": "0.11/32mm Industrial Wire",
            "BASEUNITS": "kgs",
            "BATCHALLOCATIONS.LIST": [
                {
                    "MFDON": "15-Apr-2026",
                    "GODOWNNAME": "Warehouse A",
                    "BATCHNAME": "Saif-Length-100md-Rs.2120/-",
                    "OPENINGBALANCE": "48.250 kgs",
                    "OPENINGVALUE": 102290,
                    "OPENINGRATE": "2120.00/kgs",
                    "EXPIRYPERIOD": ""
                },
                {
                    "MFDON": "20-Apr-2026",
                    "GODOWNNAME": "Main Location",
                    "BATCHNAME": "Batch-April-SecB",
                    "OPENINGBALANCE": "12.000 kgs",
                    "OPENINGVALUE": 25440,
                    "OPENINGRATE": "2120.00/kgs",
                    "EXPIRYPERIOD": ""
                }
            ]
        },
        {
            "@_NAME": "Copper Rod 10mm Pure",
            "BASEUNITS": "nos",
            "BATCHALLOCATIONS.LIST": {
                "MFDON": "10-May-2026",
                "GODOWNNAME": "Central Store",
                "BATCHNAME": "CR-10MM-LOT9",
                "OPENINGBALANCE": "350 nos",
                "OPENINGVALUE": 297500,
                "OPENINGRATE": "850.00/nos",
                "EXPIRYPERIOD": ""
            }
        },
        {
            "@_NAME": "Standard Fastener M8",
            "BASEUNITS": "box",
            "BATCHALLOCATIONS.LIST": ""
        }
    ];

    const jsonViewer = document.getElementById("jsonViewerContent");
    if (jsonViewer) {
        jsonViewer.textContent = JSON.stringify(globalRawData, null, 2);
    }

    renderKpis({ inRawItems: globalRawData });
    updateStatus({ inState: "ready", inMessage: "Loaded Demo Dataset" });
    refreshView();
}

/**
 * Initializes DOM listeners and view bindings
 */
function initEventListeners() {
    const btnFetch = document.getElementById("btnFetch");
    const companySelect = document.getElementById("companySelect");
    const searchInput = document.getElementById("searchInput");
    const chkHasBatchesOnly = document.getElementById("chkHasBatchesOnly");
    const tabTable = document.getElementById("tabTable");
    const tabJson = document.getElementById("tabJson");
    const tableView = document.getElementById("tableView");
    const jsonView = document.getElementById("jsonView");
    const btnCopyJson = document.getElementById("btnCopyJson");

    if (btnFetch && companySelect) {
        btnFetch.addEventListener("click", () => {
            fetchStockItemsWithBatches({ inCompany: companySelect.value });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            refreshView();
        });
    }

    if (chkHasBatchesOnly) {
        chkHasBatchesOnly.addEventListener("change", () => {
            refreshView();
        });
    }

    // Tab Switching
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

    // Copy JSON button
    if (btnCopyJson) {
        btnCopyJson.addEventListener("click", async () => {
            const jsonViewer = document.getElementById("jsonViewerContent");
            if (jsonViewer && jsonViewer.textContent) {
                try {
                    await navigator.clipboard.writeText(jsonViewer.textContent);
                    const originalHtml = btnCopyJson.innerHTML;
                    btnCopyJson.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
                    setTimeout(() => {
                        btnCopyJson.innerHTML = originalHtml;
                    }, 2000);
                } catch (err) {
                    console.warn("Clipboard copy error:", err);
                }
            }
        });
    }
}

// Kick off initialization
initEventListeners();

(async function init() {
    const selectedCompany = await initCompanyDropdown({
        inSelectElementId: "companySelect",
        inDefaultCompany: "mani9",
        inOnChange: ({ inCompany }) => {
            fetchStockItemsWithBatches({ inCompany });
        }
    });

    if (selectedCompany) {
        fetchStockItemsWithBatches({ inCompany: selectedCompany });
    }
})();
