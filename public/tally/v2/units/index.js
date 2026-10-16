const company = "mani9";
const statusElement = document.getElementById("unitsStatus");
const tableBody = document.getElementById("unitsTableBody");

function renderUnits(units) {
    const rows = document.createDocumentFragment();

    for (const unit of units) {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.textContent = unit?.Name ?? unit?.name ?? "";
        row.append(nameCell);
        rows.append(row);
    }

    tableBody.replaceChildren(rows);
}

async function loadUnits() {
    statusElement.textContent = "Loading units…";

    try {
        const url = `/v2/ws/masters.units.all?company=${encodeURIComponent(company)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }

        const payload = await response.json();
        const units = payload?.data?.Units;

        if (!Array.isArray(units)) {
            throw new Error("The server response did not contain a Units list.");
        }

        renderUnits(units);
        statusElement.textContent = units.length === 0 ? "No units found." : `${units.length} units`;
    } catch (error) {
        console.error("Failed to load units:", error);
        statusElement.textContent = "Could not load units. Check the server connection and try refreshing.";
    }
}

loadUnits();
