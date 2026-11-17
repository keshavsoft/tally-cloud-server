// Preserve the original Show-button behavior: render the selected row's batches in a modal.
export function cellButtonClick(event, { data, modalTitle, modalBody, batchModal }) {
    const button = event.currentTarget;
    const tr = button.closest("tr");
    if (!tr) return;

    // sectionRowIndex is zero-based within tbody; skip header/footer rows.
    const rowIndex = tr.sectionRowIndex;
    const selectedItem = data[rowIndex];
    if (!selectedItem) return;

    const itemName = selectedItem.itemName ?? selectedItem.Name ?? selectedItem.name ?? "Unnamed item";
    const baseUnit = selectedItem.baseUnit ?? selectedItem.Units ?? selectedItem.BASEUNITS ?? "-";
    const rawBatches = selectedItem.batches ?? selectedItem.Batches ?? [];
    const batches = (Array.isArray(rawBatches) ? rawBatches : [rawBatches])
        .filter(batch => batch && typeof batch === "object")
        .map(batch => ({
            godownName: batch.godownName ?? batch.GodownName ?? batch.GODOWNNAME ?? "-",
            batchName: batch.batchName ?? batch.BatchName ?? batch.BATCHNAME ?? "-",
            openingBalance: batch.openingBalance ?? batch.OpeningBalance ?? batch.OPENINGBALANCE ?? "-",
            openingRate: batch.openingRate ?? batch.OpeningRate ?? batch.OPENINGRATE ?? "-",
            openingValue: batch.openingValue ?? batch.OpeningValue ?? batch.OPENINGVALUE ?? "-"
        }));

    modalTitle.textContent = `${itemName} — Batches (${baseUnit})`;
    modalBody.replaceChildren();

    if (batches.length === 0) {
        modalBody.innerHTML = `<div class="alert alert-secondary py-3 mb-0 text-center"><span class="text-muted">No batch records found for <strong></strong></span></div>`;
        modalBody.querySelector("strong").textContent = itemName;
    } else {
        const batchSpec = window.ks.jsonRenderersBuild.render({
            type: "table",
            columns: [
                { columnName: "godownName" },
                { columnName: "batchName" },
                { columnName: "openingBalance" },
                { columnName: "openingRate" },
                { columnName: "openingValue" }
            ],
            data: batches,
            options: { showSerial: true }
        });
        modalBody.appendChild(window.ks.jsonToTag.buildSpecElement(batchSpec));
    }

    batchModal.show();
}
