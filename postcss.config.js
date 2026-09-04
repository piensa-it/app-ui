export default {
  plugins: {
    // Tailwind 4 se conecta a PostCSS por su propio paquete, y trae el
    // prefijado de proveedor incorporado: `autoprefixer` sobra.
    "@tailwindcss/postcss": {},
  },
};
