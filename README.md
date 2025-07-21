# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Here's your **ready-to-paste `README.md` section** for your LMS project, with a full **UI Style Guide** designed for consistency using Tailwind CSS and React:

---

````markdown
## 🎨 UI Style Guide for LMS

This guide defines the design system for the LMS frontend to ensure consistency, readability, and accessibility across components.

---

### 🎨 Color System (60-30-10 Rule)

| Use              | Color Name   | Hex       | Tailwind Class   |
| ---------------- | ------------ | --------- | ---------------- |
| Background (60%) | Cream        | `#fefae0` | `bg-cream`       |
| Main UI (30%)    | Red Accent   | `#d62828` | `bg-redAccent`   |
| Highlights (10%) | Green Accent | `#b7e4c7` | `bg-greenAccent` |
| Text             | Dark Gray    | `#212529` | `text-textMain`  |

```js
// tailwind.config.js
extend: {
  colors: {
    cream: '#fefae0',
    redAccent: '#d62828',
    greenAccent: '#b7e4c7',
    textMain: '#212529',
  }
}
```
````

---

### ✍️ Typography

- **Font Family**: `"Segoe UI", Arial, sans-serif`
- **Text Sizes**:

  - `text-2xl font-bold` → Main headings
  - `text-xl font-semibold` → Subheadings
  - `text-base` → Body
  - `text-sm text-gray-500` → Captions

---

### 📐 Spacing (8pt Rule)

| Utility | Pixels | Usage          |
| ------- | ------ | -------------- |
| `p-2`   | 8px    | Button padding |
| `p-4`   | 16px   | Card padding   |
| `gap-6` | 24px   | Grid spacing   |

---

### 🟫 Shadows & Rounded Corners

Use soft elevation for visual separation:

```html
<div className="bg-white p-6 rounded-xl shadow-md">...</div>
```

- `shadow`, `shadow-md`
- `rounded-lg`, `rounded-2xl`

---

### ✅ Buttons

```html
<button
  className="bg-greenAccent text-textMain font-medium py-2 px-4 rounded hover:bg-green-300 transition"
>
  Save Changes
</button>
```

- Use `redAccent` for delete/destructive
- Use `greenAccent` for primary/submit
- Always include `hover:` and `transition`

---

### 📦 Cards

```html
<div className="bg-redAccent text-white p-6 rounded-lg shadow">
  <h2 className="text-xl font-bold">Assessment Overview</h2>
</div>
```

---

### 📊 Tables & Forms

- Use `text-sm`, `p-2`, `border border-gray-200`
- Highlight rows: `bg-cream` or `bg-greenAccent/20`

---

### 🧾 Copywriting Guidelines

- **Tone**: Clear, action-oriented, concise
- **Buttons**: Use verbs (`Submit Grade`, `Add Class`)
- **Headings**: Use Title Case
- **Body text**: Use Sentence case

---

### 🔄 Feedback & UI States

| State   | Classes                                        |
| ------- | ---------------------------------------------- |
| Loading | `animate-pulse bg-gray-200`                    |
| Success | `bg-green-100 text-green-700 border-green-400` |
| Error   | `bg-red-100 text-red-700 border-red-400`       |
| Info    | `bg-yellow-100 text-yellow-700`                |

---

### 📐 Responsive Layout

```html
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="col-span-2 p-6 bg-white shadow rounded-lg">Main</div>
  <div className="p-6 bg-cream rounded-lg">Sidebar</div>
</div>
```

- Use `container mx-auto max-w-7xl` for page width
