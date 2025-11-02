import next from "eslint-config-next";

// Use Next.js flat config directly to avoid legacy compat and circular plugin refs
export default [
  ...next,
  {
    rules: {
      // Relax a few React/Next rules for smoother DX
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "no-use-before-define": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "import/no-anonymous-default-export": "off",
    },
  },
];
