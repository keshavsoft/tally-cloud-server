// Collect the cell values from the row containing the Options button.
export function rowOptionsClick(event) {
    const button = event.currentTarget;
    const tr = button.closest("tr");
    if (!tr) return {};

    const table = tr.closest("table");
    const headers = table ? [...table.querySelectorAll("thead th")].map(th => th.textContent.trim()) : [];
    const cells = [...tr.querySelectorAll("td")];
    const values = Object.fromEntries(cells.map((td, index) => {
        const key = headers[td.cellIndex] || `column${index + 1}`;
        return [key, td.innerText.trim()];
    }));

    console.log("rowOptionsClick values:", values);
    return values;
}
