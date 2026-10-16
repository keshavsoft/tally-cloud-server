// Preserve the original Show-button behavior: render the selected row's batches in a modal.
export function cellButtonClick(event, { data, modalTitle, modalBody, batchModal }) {
    const button = event.currentTarget;
    const tr = button.closest("tr");
    if (!tr) return;

    // sectionRowIndex is zero-based within tbody; skip header/footer rows.
    const rowIndex = tr.sectionRowIndex;
    const selectedItem = data[rowIndex];
    if (!selectedItem) return;

    modalTitle.textContent = `${selectedItem.itemName} — Batches (${selectedItem.baseUnit})`;
    modalBody.replaceChildren();

    if (!selectedItem.batches || selectedItem.batches.length === 0) {
        modalBody.innerHTML = `<div class="alert alert-secondary py-3 mb-0 text-center"><span class="text-muted">No batch records found for <strong></strong></span></div>`;
        modalBody.querySelector("strong").textContent = selectedItem.itemName;
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
            data: selectedItem.batches,
            options: { showSerial: true }
        });
        modalBody.appendChild(window.ks.jsonToTag.buildSpecElement(batchSpec));
    }

    batchModal.show();
}
