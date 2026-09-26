/**
 * Purchase Vouchers by Period Frontend Controller
 * Follows strict parameter naming convention: { inParam } -> const localParam = inParam;
 */

let globalRawData = [];
let globalFilteredData = [];

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
            <td colspan="6">
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

        return `
          <tr>
            <td style="color: var(--text-muted); font-family: var(--font-mono);">${index + 1}</td>
            <td class="cell-mono">${dateStr}</td>
            <td>
              <span class="chip chip-purple">${vNo}</span>
            </td>
            <td class="cell-title">${party}</td>
            <td>
              <span class="chip chip-cyan">${vType}</span>
            </td>
            <td class="cell-mono" style="text-align: right; font-weight: 600; color: #fbbf24;">
              ₹ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        const vNo = getVoucherNumber({ inItem: item }).toLowerCase();
        const party = getPartyName({ inItem: item }).toLowerCase();
        const dateStr = getVoucherDate({ inItem: item }).toLowerCase();
        return vNo.includes(localSearchQuery) || party.includes(localSearchQuery) || dateStr.includes(localSearchQuery);
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

    updateStatus({ inState: "loading", inMessage: `Fetching purchases (${localFrom} - ${localTo})...` });

    try {
        const url = `/v2/ws/vouchers.purchases.period?company=${encodeURIComponent(localCompany)}&from=${encodeURIComponent(localFrom)}&to=${encodeURIComponent(localTo)}`;
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

        updateStatus({ inState: "ready", inMessage: `Loaded ${items.length} vouchers (${new Date().toLocaleTimeString()})` });
        refreshView();
    } catch (err) {
        console.error("Fetch purchases failed:", err);
        updateStatus({ inState: "error", inMessage: `Fetch failed: ${err.message}` });

        const tbody = document.getElementById("tableBody");
        if (tbody) {
            tbody.innerHTML = `
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <i class="bi bi-exclamation-triangle" style="color: #ef4444;"></i>
                    <p style="color: #fca5a5; font-weight: 600;">Failed to fetch purchases</p>
                    <p style="font-size:0.85rem; max-width: 500px; margin: 0 auto 1rem;">
                      ${err.message}. If testing new voucher commands, ensure <code>tally-local-server</code> is running the latest build.
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
    const companyInput = document.getElementById("companyInput");
    const fromInput = document.getElementById("fromDateInput");
    const toInput = document.getElementById("toDateInput");
    const searchInput = document.getElementById("searchInput");
    const tabTable = document.getElementById("tabTable");
    const tabJson = document.getElementById("tabJson");
    const tableView = document.getElementById("tableView");
    const jsonView = document.getElementById("jsonView");
    const btnCopyJson = document.getElementById("btnCopyJson");

    const doFetch = () => {
        fetchPurchases({
            inCompany: companyInput?.value,
            inFromDate: fromInput?.value,
            inToDate: toInput?.value
        });
    };

    if (btnFetch) btnFetch.addEventListener("click", doFetch);

    if (companyInput) {
        companyInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doFetch();
        });
    }

    if (fromInput) fromInput.addEventListener("change", doFetch);
    if (toInput) toInput.addEventListener("change", doFetch);

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
const initialFrom = document.getElementById("fromDateInput");
const initialTo = document.getElementById("toDateInput");
if (initialCompanyInput && initialCompanyInput.value) {
    fetchPurchases({
        inCompany: initialCompanyInput.value,
        inFromDate: initialFrom?.value,
        inToDate: initialTo?.value
    });
}
