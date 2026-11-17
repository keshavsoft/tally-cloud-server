/**
 * Purchase Vouchers by Period Frontend Controller
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

import { initCompanyDropdown } from "/js/companyDropdown.js";

let globalRawData = [];
let globalFilteredData = [];
let expandedIndices = new Set();
let activeTabs = {}; // Map of index -> "inventory" | "ledgers" | "raw"

function formatDateForDisplay({ inDateStr }) {
    const localDateStr = String(inDateStr || "");
    if (!localDateStr) return "-";
    // Check if YYYYMMDD
    if (localDateStr.length === 8 && !localDateStr.includes("-")) {
        const y = localDateStr.substring(0, 4);
        const m = localDateStr.substring(4, 6);
        const d = localDateStr.substring(6, 8);
        return `${d}-${m}-${y}`;
    }
    return localDateStr;
}

function getVoucherDate({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "-";
    return localItem.date ?? localItem.DATE ?? localItem["@_DATE"] ?? "-";
}

function getVoucherNumber({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "-";
    return localItem.voucherNumber ?? localItem.VOUCHERNUMBER ?? localItem["@_VOUCHERNUMBER"] ?? "-";
}

function getPartyName({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "-";
    const directName = localItem.partyLedgerName ?? localItem.PARTYLEDGERNAME ?? localItem.PARTYNAME ?? localItem.BASICBUYERNAME;
    if (directName && typeof directName === "string" && directName.trim() && directName.trim() !== "-") {
        return directName.trim();
    }
    // Fallback: search in ALLLEDGERENTRIES.LIST
    const entries = localItem["ALLLEDGERENTRIES.LIST"] || localItem.ledgerEntries || localItem.allLedgerEntries;
    if (Array.isArray(entries) && entries.length > 0) {
        const partyEntry = entries.find((e) => e.ISPARTYLEDGER === "Yes" || e.isPartyLedger === "Yes");
        if (partyEntry) {
            const name = partyEntry.LEDGERNAME ?? partyEntry.ledgerName;
            if (name) return String(name).trim();
        }
        const firstEntry = entries[0];
        if (firstEntry && (firstEntry.LEDGERNAME || firstEntry.ledgerName)) {
            return String(firstEntry.LEDGERNAME || firstEntry.ledgerName).trim();
        }
    }
    return "-";
}

function getVoucherType({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return "Purchase";
    return localItem.voucherTypeName ?? localItem.VOUCHERTYPENAME ?? "Purchase";
}

function getVoucherAmount({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return 0;
    const rawAmt = localItem.amount ?? localItem.AMOUNT;
    if (rawAmt !== undefined && rawAmt !== null && rawAmt !== "") {
        const num = parseFloat(rawAmt);
        if (!isNaN(num)) return Math.abs(num);
    }
    // Fallback: search in ALLLEDGERENTRIES.LIST
    const entries = localItem["ALLLEDGERENTRIES.LIST"] || localItem.ledgerEntries || localItem.allLedgerEntries;
    if (Array.isArray(entries) && entries.length > 0) {
        const partyEntry = entries.find((e) => e.ISPARTYLEDGER === "Yes" || e.isPartyLedger === "Yes");
        if (partyEntry && (partyEntry.AMOUNT !== undefined || partyEntry.amount !== undefined)) {
            const num = parseFloat(partyEntry.AMOUNT ?? partyEntry.amount);
            if (!isNaN(num)) return Math.abs(num);
        }
        for (const e of entries) {
            const val = e.AMOUNT ?? e.amount;
            if (val !== undefined && val !== null && val !== "") {
                const num = parseFloat(val);
                if (!isNaN(num) && num !== 0) return Math.abs(num);
            }
        }
    }
    return 0;
}

function getInventoryEntries({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return [];
    const raw = localItem.inventoryEntries 
        ?? localItem["ALLINVENTORYENTRIES.LIST"] 
        ?? localItem.ALLINVENTORYENTRIES 
        ?? null;
    if (!raw || typeof raw !== "object") return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.filter((e) => e && typeof e === "object" && (e.STOCKITEMNAME || e.stockItemName || e.AMOUNT || e.amount || e.ACTUALQTY || e.billedQty));
}

function getLedgerEntries({ inItem }) {
    const localItem = inItem;
    if (!localItem || typeof localItem !== "object") return [];
    const raw = localItem.ledgerEntries 
        ?? localItem["ALLLEDGERENTRIES.LIST"] 
        ?? localItem.ALLLEDGERENTRIES 
        ?? null;
    if (!raw || typeof raw !== "object") return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.filter((e) => e && typeof e === "object" && (e.LEDGERNAME || e.ledgerName));
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

    let totalGross = 0;
    const partySet = new Set();

    localRawItems.forEach((item) => {
        totalGross += getVoucherAmount({ inItem: item });
        const party = getPartyName({ inItem: item });
        if (party && party !== "-") partySet.add(party.trim());
    });

    const elTotal = document.getElementById("statTotalVouchers");
    const elAmount = document.getElementById("statTotalAmount");
    const elParties = document.getElementById("statTotalParties");
    const elMatching = document.getElementById("statMatching");

    if (elTotal) elTotal.textContent = localRawItems.length.toLocaleString();
    if (elAmount) elAmount.textContent = `₹ ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elParties) elParties.textContent = partySet.size.toLocaleString();
    if (elMatching) elMatching.textContent = localFilteredItems.length.toLocaleString();
}

function renderTable({ inItems }) {
    const localItems = inItems;
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (!localItems || localItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8">
              <div class="empty-state">
                <i class="bi bi-search"></i>
                <p>No matching purchase vouchers found for this period.</p>
              </div>
            </td>
          </tr>
        `;
        return;
    }

    const rowsHtml = localItems.map((item, index) => {
        const dateStr = formatDateForDisplay({ inDateStr: getVoucherDate({ inItem: item }) });
        const vNo = getVoucherNumber({ inItem: item });
        const party = getPartyName({ inItem: item });
        const vType = getVoucherType({ inItem: item });
        const amount = getVoucherAmount({ inItem: item });
        const invList = getInventoryEntries({ inItem: item });
        const ledgerList = getLedgerEntries({ inItem: item });
        const isExpanded = expandedIndices.has(index);

        // Determine active tab if expanded
        if (!activeTabs[index]) {
            activeTabs[index] = invList.length > 0 ? "inventory" : (ledgerList.length > 0 ? "ledgers" : "raw");
        }
        const currentTab = activeTabs[index];

        // Pills for items/ledgers
        const pillsHtml = [];
        if (invList.length > 0) {
            pillsHtml.push(`
              <button type="button" class="array-pill array-pill-inventory" data-action="tab-direct" data-index="${index}" data-tab="inventory" title="View inventory lines">
                <i class="bi bi-box-seam"></i> ${invList.length} Item${invList.length > 1 ? "s" : ""}
              </button>
            `);
        }
        if (ledgerList.length > 0) {
            pillsHtml.push(`
              <button type="button" class="array-pill array-pill-ledgers" data-action="tab-direct" data-index="${index}" data-tab="ledgers" title="View ledger entries">
                <i class="bi bi-journal-text"></i> ${ledgerList.length} Ledger${ledgerList.length > 1 ? "s" : ""}
              </button>
            `);
        }
        if (pillsHtml.length === 0) {
            pillsHtml.push(`<span style="color:var(--text-muted); font-size:0.75rem;">-</span>`);
        }

        // Main table row
        let mainRow = `
          <tr class="row-expandable ${isExpanded ? "row-expanded" : ""}" data-action="toggle-drawer" data-index="${index}">
            <td style="color: var(--text-muted); font-family: var(--font-mono);">${index + 1}</td>
            <td class="cell-mono">${dateStr}</td>
            <td>
              <span class="chip chip-purple">${vNo}</span>
            </td>
            <td class="cell-title">${party}</td>
            <td>
              <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center;">
                ${pillsHtml.join("")}
              </div>
            </td>
            <td>
              <span class="chip chip-cyan">${vType}</span>
            </td>
            <td class="cell-mono" style="text-align: right; font-weight: 600; color: #fbbf24;">
              ₹ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td style="text-align: center; color: var(--text-muted);">
              <i class="bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}" style="cursor: pointer;"></i>
            </td>
          </tr>
        `;

        // Drawer row if expanded
        if (isExpanded) {
            let drawerContent = "";

            if (currentTab === "inventory") {
                if (invList.length === 0) {
                    drawerContent = `<div style="padding:1rem; color:var(--text-muted); font-size:0.85rem;"><i class="bi bi-info-circle me-1"></i>No inventory lines attached to this accounting voucher.</div>`;
                } else {
                    const invRows = invList.map((inv, iIdx) => {
                        const sName = inv.STOCKITEMNAME ?? inv.stockItemName ?? "-";
                        const qty = inv.BILLEDQTY ?? inv.billedQty ?? inv.ACTUALQTY ?? inv.actualQty ?? "-";
                        const rate = inv.RATE ?? inv.rate ?? "-";
                        const amt = inv.AMOUNT ?? inv.amount ?? "-";

                        // Batches inside inventory line
                        let batchChips = "";
                        const rawBatches = inv["BATCHALLOCATIONS.LIST"] || inv.batchAllocations;
                        if (rawBatches) {
                            const bList = Array.isArray(rawBatches) ? rawBatches : [rawBatches];
                            batchChips = bList.map((b) => {
                                const bName = b.BATCHNAME ?? b.batchName ?? "-";
                                const gName = b.GODOWNNAME ?? b.godownName ?? "";
                                return `<span class="array-pill array-pill-batches" style="margin-right:0.25rem;"><i class="bi bi-tag"></i> ${bName}${gName ? ` (${gName})` : ""}</span>`;
                            }).join("");
                        }

                        return `
                          <tr>
                            <td style="width:30px; color:var(--text-muted);">${iIdx + 1}</td>
                            <td style="font-weight:600; color:#fff;">${sName}</td>
                            <td class="cell-mono">${qty}</td>
                            <td class="cell-mono">${rate}</td>
                            <td class="cell-mono" style="color:#fbbf24; font-weight:600;">₹ ${typeof amt === "number" ? Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amt}</td>
                            <td>${batchChips || `<span style="color:var(--text-muted); font-size:0.75rem;">None</span>`}</td>
                          </tr>
                        `;
                    }).join("");

                    drawerContent = `
                      <table class="sub-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Stock Item Name</th>
                            <th>Billed Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Batches / Godown Allocations</th>
                          </tr>
                        </thead>
                        <tbody>${invRows}</tbody>
                      </table>
                    `;
                }
            } else if (currentTab === "ledgers") {
                if (ledgerList.length === 0) {
                    drawerContent = `<div style="padding:1rem; color:var(--text-muted); font-size:0.85rem;"><i class="bi bi-info-circle me-1"></i>No ledger allocations available.</div>`;
                } else {
                    const ledRows = ledgerList.map((led, lIdx) => {
                        const lName = led.LEDGERNAME ?? led.ledgerName ?? "-";
                        const isParty = led.ISPARTYLEDGER ?? led.isPartyLedger ?? "No";
                        const amt = led.AMOUNT ?? led.amount ?? 0;
                        const numAmt = parseFloat(amt);
                        const isDeemedPos = led.ISDEEMEDPOSITIVE ?? led.isDeemedPositive ?? "No";
                        const entryType = isDeemedPos === "Yes" ? "Debit (Dr)" : "Credit (Cr)";

                        return `
                          <tr>
                            <td style="width:30px; color:var(--text-muted);">${lIdx + 1}</td>
                            <td style="font-weight:600; color:#fff;">${lName}</td>
                            <td>
                              <span class="chip ${isDeemedPos === "Yes" ? "chip-purple" : "chip-cyan"}">${entryType}</span>
                            </td>
                            <td class="cell-mono" style="color:#fbbf24; font-weight:600;">₹ ${!isNaN(numAmt) ? Math.abs(numAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amt}</td>
                            <td>
                              ${isParty === "Yes" ? `<span class="chip chip-emerald"><i class="bi bi-person-check me-1"></i>Party Ledger</span>` : `<span style="color:var(--text-muted); font-size:0.75rem;">Account</span>`}
                            </td>
                          </tr>
                        `;
                    }).join("");

                    drawerContent = `
                      <table class="sub-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Ledger Name</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>${ledRows}</tbody>
                      </table>
                    `;
                }
            } else if (currentTab === "raw") {
                drawerContent = `<pre class="json-viewer-container" style="max-height:280px; margin:0;">${JSON.stringify(item, null, 2)}</pre>`;
            }

            mainRow += `
              <tr class="drawer-tr">
                <td colspan="8" style="padding: 0; background: transparent;">
                  <div class="voucher-details-drawer">
                    <div class="drawer-tabs">
                      <button type="button" class="drawer-tab-btn ${currentTab === "inventory" ? "active" : ""}" data-action="switch-tab" data-index="${index}" data-tab="inventory">
                        <i class="bi bi-box-seam"></i> Inventory Items (${invList.length})
                      </button>
                      <button type="button" class="drawer-tab-btn ${currentTab === "ledgers" ? "active" : ""}" data-action="switch-tab" data-index="${index}" data-tab="ledgers">
                        <i class="bi bi-journal-text"></i> Ledger Allocations (${ledgerList.length})
                      </button>
                      <button type="button" class="drawer-tab-btn ${currentTab === "raw" ? "active" : ""}" data-action="switch-tab" data-index="${index}" data-tab="raw">
                        <i class="bi bi-code-slash"></i> Voucher JSON
                      </button>
                    </div>
                    <div class="drawer-content">
                      ${drawerContent}
                    </div>
                  </div>
                </td>
              </tr>
            `;
        }

        return mainRow;
    }).join("");

    tbody.innerHTML = rowsHtml;
}

function applyFilters({ inRawItems, inSearchQuery }) {
    const localRawItems = inRawItems;
    const localSearchQuery = (inSearchQuery || "").toLowerCase().trim();

    if (!localSearchQuery) return localRawItems;

    return localRawItems.filter((item) => {
        const vNo = String(getVoucherNumber({ inItem: item })).toLowerCase();
        const party = String(getPartyName({ inItem: item })).toLowerCase();
        const dateStr = String(getVoucherDate({ inItem: item })).toLowerCase();

        if (vNo.includes(localSearchQuery) || party.includes(localSearchQuery) || dateStr.includes(localSearchQuery)) {
            return true;
        }

        // Deep search through inventory item names
        const invList = getInventoryEntries({ inItem: item });
        const hasInvMatch = invList.some((e) => {
            const name = String(e.STOCKITEMNAME ?? e.stockItemName ?? "").toLowerCase();
            return name.includes(localSearchQuery);
        });
        if (hasInvMatch) return true;

        // Deep search through ledger names
        const ledList = getLedgerEntries({ inItem: item });
        const hasLedgerMatch = ledList.some((e) => {
            const name = String(e.LEDGERNAME ?? e.ledgerName ?? "").toLowerCase();
            return name.includes(localSearchQuery);
        });
        return hasLedgerMatch;
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

async function fetchPurchases({ inCompany, inFromDate, inToDate }) {
    const localCompany = (inCompany || "").trim();
    const localFrom = String(inFromDate || "").replace(/-/g, "");
    const localTo = String(inToDate || "").replace(/-/g, "");

    const btnFetch = document.getElementById("btnFetch");
    const jsonViewer = document.getElementById("jsonViewerContent");

    if (btnFetch) {
        btnFetch.disabled = true;
        btnFetch.innerHTML = `<span class="spinner"></span> <span>Fetching...</span>`;
    }

    updateStatus({ inState: "loading", inMessage: `Fetching purchases (${localCompany}: ${localFrom} - ${localTo})...` });

    try {
        const url = `/v2/ws/vouchers.purchases.period?company=${encodeURIComponent(localCompany)}&from=${encodeURIComponent(localFrom)}&to=${encodeURIComponent(localTo)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const payload = await response.json();
        const items = Array.isArray(payload) ? payload : (payload.data || []);

        globalRawData = items;
        expandedIndices.clear();
        activeTabs = {};

        if (jsonViewer) {
            jsonViewer.textContent = JSON.stringify(payload, null, 2);
        }

        updateStatus({ inState: "ready", inMessage: `Loaded ${items.length} vouchers from "${localCompany}" (${new Date().toLocaleTimeString()})` });
        refreshView();
    } catch (err) {
        console.error("Fetch purchases failed:", err);
        updateStatus({ inState: "error", inMessage: `Fetch failed: ${err.message}` });

        const tbody = document.getElementById("tableBody");
        if (tbody) {
            tbody.innerHTML = `
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <i class="bi bi-exclamation-triangle" style="color: #ef4444;"></i>
                    <p style="color: #fca5a5; font-weight: 600;">Failed to fetch purchases</p>
                    <p style="font-size:0.85rem; max-width: 500px; margin: 0 auto 1rem;">
                      ${err.message}. If testing new voucher commands, ensure <code>tally-local-server</code> is running and connected to Tally.
                    </p>
                  </div>
                </td>
              </tr>
            `;
        }
    } finally {
        if (btnFetch) {
            btnFetch.disabled = false;
            btnFetch.innerHTML = `<i class="bi bi-arrow-repeat"></i> <span>Fetch Purchases</span>`;
        }
    }
}

function initEventListeners() {
    const btnFetch = document.getElementById("btnFetch");
    const companySelect = document.getElementById("companySelect");
    const fromInput = document.getElementById("fromDateInput");
    const toInput = document.getElementById("toDateInput");
    const searchInput = document.getElementById("searchInput");
    const tabTable = document.getElementById("tabTable");
    const tabJson = document.getElementById("tabJson");
    const tableView = document.getElementById("tableView");
    const jsonView = document.getElementById("jsonView");
    const btnCopyJson = document.getElementById("btnCopyJson");
    const tbody = document.getElementById("tableBody");

    const doFetch = () => {
        fetchPurchases({
            inCompany: companySelect?.value,
            inFromDate: fromInput?.value,
            inToDate: toInput?.value
        });
    };

    if (btnFetch) btnFetch.addEventListener("click", doFetch);
    if (fromInput) fromInput.addEventListener("change", doFetch);
    if (toInput) toInput.addEventListener("change", doFetch);

    if (searchInput) {
        searchInput.addEventListener("input", () => refreshView());
    }

    // Event Delegation on table body for toggling and tabs
    if (tbody) {
        tbody.addEventListener("click", (e) => {
            const target = e.target.closest("[data-action]");
            if (!target) return;

            const action = target.getAttribute("data-action");
            const index = parseInt(target.getAttribute("data-index"), 10);
            if (isNaN(index)) return;

            if (action === "toggle-drawer") {
                // Ignore if clicked directly on an array pill inside row
                if (e.target.closest("[data-action='tab-direct']")) return;

                if (expandedIndices.has(index)) {
                    expandedIndices.delete(index);
                } else {
                    expandedIndices.add(index);
                }
                renderTable({ inItems: globalFilteredData });
            } else if (action === "tab-direct") {
                e.stopPropagation();
                const tab = target.getAttribute("data-tab");
                activeTabs[index] = tab;
                expandedIndices.add(index);
                renderTable({ inItems: globalFilteredData });
            } else if (action === "switch-tab") {
                e.stopPropagation();
                const tab = target.getAttribute("data-tab");
                activeTabs[index] = tab;
                renderTable({ inItems: globalFilteredData });
            }
        });
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

// Initialize Dynamic Company Dropdown and auto-fetch
(async function init() {
    const fromInput = document.getElementById("fromDateInput");
    const toInput = document.getElementById("toDateInput");

    const selectedCompany = await initCompanyDropdown({
        inSelectElementId: "companySelect",
        inDefaultCompany: "mani9",
        inOnChange: ({ inCompany }) => {
            fetchPurchases({
                inCompany,
                inFromDate: fromInput?.value,
                inToDate: toInput?.value
            });
        }
    });

    if (selectedCompany) {
        fetchPurchases({
            inCompany: selectedCompany,
            inFromDate: fromInput?.value,
            inToDate: toInput?.value
        });
    }
})();
