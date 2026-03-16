/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  safelist: [
    // Water color classes are constructed dynamically as `bg-${color}` at
    // runtime, so Tailwind can't detect them statically — safelist them all.
    {
      pattern:
        /^bg-(orange|blue|yellow|red|green|purple|gray|indigo|pink|teal|lime|amber|violet|fuchsia|rose|sky|emerald|cyan)-(200|300|400|500|600|700|800)$/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
