/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "base-color": "#28282B",
        "main-ac-color": "#254248",
        "sub-ac-color": "#42bc21",
        "footer-color": "#505050",
        // "base-color": "#e5e5e5",
        // "main-ac-color": "#1a7e3d", // 緑（飽きるかも）
        // "sub-ac-color": "#4c4248",
        "slate": {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
        },
        "grey": {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
        }
      },
    },
  },
  plugins: [],
};
