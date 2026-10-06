# sidebar-selectCol

Dynamic, JSON-driven sidebar navigation with Bootstrap and company dropdown.

## How It Builds
- **Build System**: **Zero-build** (No bundler required; runs via native ES Modules and json-to-spec CDN).
- **Runtime**: Served statically by Express on port `9011`.

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```

## How to Check
1. **Open URL**:
   `http://localhost:9011/sidebar/selectCol/index.html`
2. **Verify Dynamic Sidebar**:
   - Menu links (`Orders`, `Customers`, `Keshavsoft`) render from `spec.json`.
3. **Verify Active Selection**:
   - Click any link; confirm `.active` class switches to the clicked item.
4. **Verify Company Dropdown**:
   - Header dropdown populates with company options via `companyDropdown.js`.
5. **Check Browser Console & Network**:
   - Press `F12` to ensure `spec.json` loads (HTTP 200) with zero console errors.

## Core Files
- `index.html` — Layout container and SVG icons.
- `json/spec.json` — Sidebar DOM and menu structure template.
- `js/index.js` — Fetches spec, compiles DOM, and handles link selection.
- `js/companyDropdown.js` — Populates company selection dropdown.
- `style.css` — Custom sidebar styling.
