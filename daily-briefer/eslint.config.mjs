import next from "eslint-config-next";

/* eslint-config-next 16 bundles typescript-eslint 8, which targets ESLint 9 —
   hence the eslint@^9 pin in package.json. Revisit once it ships ESLint 10
   support. */
const config = [
  ...next,
  { ignores: [".next/**", "node_modules/**", "public/sw.js", "scripts/**"] },
];

export default config;
