import { getJson } from "../shared/api.js";

const company = "mani9";
const statusElement = document.getElementById("batchesStatus");
const searchInput = document.getElementById("batchSearch");
const tableBody = document.getElementById("stockItemsTableBody");
const noMatchesMessage = document.getElementById("noMatchesMessage");
const batchRows = document.getElementById("batchRows");
const batchModal = new bootstrap.Modal(document.getElementById("batchModal"));

let allStockItems = [];
let visibleStockItems = [];

function firstValue(record, keys, fallback = "") {
    for (const key of keys) {
        if (record?.[key] !== undefined && record[key] !== null) return record[key];
    }

    return fallback;
}

function normalizeBatches(stockItem) {
    const rawBatches = firstValue(stockItem, ["Batches", "batches"], []);
    const records = Array.isArray(rawBatches) ? rawBatches : [rawBatches];

    return records
        .filter(batch => batch && typeof batch === "object")
        .map(batch => ({
            godownName: firstValue(batch, ["godownName", "GodownName", "GODOWNNAME"]),
            batchName: firstValue(batch, ["batchName", "BatchName", "BATCHNAME"]),
            openingBalance: firstValue(batch, ["openingBalance", "OpeningBalance", "OPENINGBALANCE"]),
            openingRate: firstValue(batch, ["openingRate", "OpeningRate", "OPENINGRATE"]),
            openingValue: firstValue(batch, ["openingValue", "OpeningValue", "OPENINGVALUE"])
        }));
}

function normalizeStockItem(rawItem) {
    return {
        name: String(firstValue(rawItem, ["Name", "itemName", "name"], "Unnamed item")),
        unit: String(firstValue(rawItem, ["Units", "baseUnit", "BASEUNITS"], "-")),
        batches: normalizeBatches(rawItem)
    };
}

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value == null ? "" : String(value);
    row.append(cell);
}

function matchesSearch(stockItem, query) {
    if (!query) return true;

    const searchText = [
        stockItem.name,
        stockItem.unit,
        ...stockItem.batches.flatMap(batch => [
            batch.godownName,
            batch.batchName,
            batch.openingBalance,
            batch.openingRate,
            batch.openingValue
        ])
    ].join(" ").toLocaleLowerCase();

    return searchText.includes(query);
}

function renderStockItems(stockItems) {
    const rows = document.createDocumentFragment();

    stockItems.forEach((stockItem, index) => {
        const row = document.createElement("tr");
        appendCell(row, stockItem.name);

        const batchesCell = document.createElement("td");
        if (stockItem.batches.length === 0) {
            batchesCell.textContent = "0";
        } else {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-outline-primary btn-sm";
            button.textContent = String(stockItem.batches.length);
            button.dataset.itemIndex = String(index);
            button.setAttribute("aria-label", `Show ${stockItem.batches.length} batches for ${stockItem.name}`);
            batchesCell.append(button);
        }

        row.append(batchesCell);
        rows.append(row);
    });

    tableBody.replaceChildren(rows);
    noMatchesMessage.hidden = stockItems.length !== 0;
}

function updateVisibleItems() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    visibleStockItems = allStockItems.filter(stockItem => matchesSearch(stockItem, query));
    renderStockItems(visibleStockItems);

    statusElement.textContent = query
        ? `Showing ${visibleStockItems.length} of ${allStockItems.length} stock items`
        : `${allStockItems.length} stock items`;
}

function showBatchDetails(stockItem) {
    const rows = document.createDocumentFragment();

    for (const batch of stockItem.batches) {
        const row = document.createElement("tr");
        appendCell(row, batch.godownName);
        appendCell(row, batch.batchName);
        appendCell(row, batch.openingBalance);
        appendCell(row, batch.openingRate);
        appendCell(row, batch.openingValue);
        rows.append(row);
    }

    document.getElementById("batchModalTitle").textContent = `${stockItem.name} — Batches (${stockItem.unit})`;
    batchRows.replaceChildren(rows);
    batchModal.show();
}

async function loadStockItems() {
    statusElement.textContent = "Loading stock items…";

    try {
        const url = `/v2/ws/masters.stockItems.withBatches?company=${encodeURIComponent(company)}`;
        const payload = await getJson(url);
        const rawStockItems = payload?.data?.StockItems;

        if (!Array.isArray(rawStockItems)) {
            throw new Error("The server response did not contain a StockItems list.");
        }

        allStockItems = rawStockItems.map(normalizeStockItem);
        updateVisibleItems();
    } catch (error) {
        console.error("Failed to load stock items:", error);
        statusElement.textContent = "Could not load stock items. Check the server connection and try refreshing.";
    }
}

searchInput.addEventListener("input", updateVisibleItems);

tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-item-index]");
    if (!button || !tableBody.contains(button)) return;

    const selectedItem = visibleStockItems[Number(button.dataset.itemIndex)];
    if (selectedItem) showBatchDetails(selectedItem);
});

loadStockItems();
