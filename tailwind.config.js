/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#111827',
        'gray-800': '#1f2937',
        'gray-700': '#374151',
        'gray-600': '#4b5563',
        'gray-500': '#6b7280',
        'gray-400': '#9ca3af',
        'gray-300': '#d1d5db',
        'blue-500': '#3b82f6',
        'blue-600': '#2563eb',
        'green-400': '#4ade80',
        'yellow-400': '#facc15',
        'purple-400': '#c084fc',
        'red-400': '#f87171',
        'orange-400': '#fb923c'
      }
    }
  },
  plugins: []
}
