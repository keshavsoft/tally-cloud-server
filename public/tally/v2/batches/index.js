const company = "mani9";
const statusElement = document.getElementById("batchesStatus");
const tableBody = document.getElementById("stockItemsTableBody");
const batchRows = document.getElementById("batchRows");
const emptyBatchesMessage = document.getElementById("emptyBatchesMessage");
const batchModal = new bootstrap.Modal(document.getElementById("batchModal"));

function getBatchRecords(stockItem) {
    const rawBatches = stockItem?.Batches ?? stockItem?.batches ?? [];
    const records = Array.isArray(rawBatches) ? rawBatches : [rawBatches];

    return records
        .filter(batch => batch && typeof batch === "object")
        .map(batch => ({
            godownName: batch.godownName ?? batch.GodownName ?? batch.GODOWNNAME ?? "",
            batchName: batch.batchName ?? batch.BatchName ?? batch.BATCHNAME ?? "",
            openingBalance: batch.openingBalance ?? batch.OpeningBalance ?? batch.OPENINGBALANCE ?? "",
            openingRate: batch.openingRate ?? batch.OpeningRate ?? batch.OPENINGRATE ?? "",
            openingValue: batch.openingValue ?? batch.OpeningValue ?? batch.OPENINGVALUE ?? ""
        }));
}

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value == null ? "" : String(value);
    row.append(cell);
}

function openBatchModal(stockItem, batches) {
    const name = stockItem?.Name ?? stockItem?.itemName ?? stockItem?.name ?? "Unnamed item";
    const unit = stockItem?.Units ?? stockItem?.baseUnit ?? stockItem?.BASEUNITS ?? "-";
    const rows = document.createDocumentFragment();

    for (const batch of batches) {
        const row = document.createElement("tr");
        appendCell(row, batch.godownName);
        appendCell(row, batch.batchName);
        appendCell(row, batch.openingBalance);
        appendCell(row, batch.openingRate);
        appendCell(row, batch.openingValue);
        rows.append(row);
    }

    document.getElementById("batchModalTitle").textContent = `${name} — Batches (${unit})`;
    batchRows.replaceChildren(rows);
    batchRows.closest("table").hidden = batches.length === 0;
    emptyBatchesMessage.hidden = batches.length !== 0;
    batchModal.show();
}

function renderStockItems(stockItems) {
    const rows = document.createDocumentFragment();

    for (const stockItem of stockItems) {
        const row = document.createElement("tr");
        appendCell(row, stockItem?.Name ?? stockItem?.itemName ?? stockItem?.name ?? "");

        const countCell = document.createElement("td");
        const batches = getBatchRecords(stockItem);

        if (batches.length === 0) {
            countCell.textContent = "0";
        } else {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-outline-primary btn-sm";
            button.textContent = String(batches.length);
            button.setAttribute("aria-label", `Show ${batches.length} batches`);
            button.addEventListener("click", () => openBatchModal(stockItem, batches));
            countCell.append(button);
        }

        row.append(countCell);
        rows.append(row);
    }

    tableBody.replaceChildren(rows);
}

async function loadStockItems() {
    statusElement.textContent = "Loading stock items…";

    try {
        const url = `/v2/ws/masters.stockItems.withBatches?company=${encodeURIComponent(company)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }

        const payload = await response.json();
        const stockItems = payload?.data?.StockItems;

        if (!Array.isArray(stockItems)) {
            throw new Error("The server response did not contain a StockItems list.");
        }

        renderStockItems(stockItems);
        statusElement.textContent = stockItems.length === 0 ? "No stock items found." : `${stockItems.length} stock items`;
    } catch (error) {
        console.error("Failed to load stock items:", error);
        statusElement.textContent = "Could not load stock items. Check the server connection and try refreshing.";
    }
}

loadStockItems();
