// Collect the inputs in the row containing the Save button.
export function saveClick(event) {
    const button = event.currentTarget;
    const tr = button.closest("tr");
    if (!tr) return {};

    const inputs = [...tr.querySelectorAll("input")];
    const values = Object.fromEntries(inputs.map((input, index) => {
        const key = input.name || input.id || headerForCell(input.closest("td"), index) || `field${index + 1}`;
        return [key, input.value];
    }));

    console.log("saveClick values:", values);
    return values;
}

function headerForCell(cell, index) {
    if (!cell) return "";
    const table = cell.closest("table");
    const headers = table ? [...table.querySelectorAll("thead th")] : [];
    return headers[cell.cellIndex]?.textContent.trim() || "";
}
