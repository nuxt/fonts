/** @type {import('tailwindcss').Config} */
export default {
  // Preserve simple HTML styles
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        custom: ['Anton'],
      },
    },
  },
}
