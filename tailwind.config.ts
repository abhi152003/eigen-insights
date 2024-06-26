import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "2.5xl": "2100px",
        "1.5xl": "1350px",
        "1.7xl": "1450px",
        "1.5lg": "1200px",
      },
      transitionDuration: {
        '1500': '1500ms',
        '2000': '2000ms',
        '3000': '3000ms',
       },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "blue-shade-100": "#004DFF",
        "blue-shade-200": "#0500FF",
        "blue-shade-300": "#0238B3",
        "blue-shade-400": "#F1F6FF",
        "blue-shade-500": "#C6D7FF",
        "blue-shade-600": "#DDE7FF",
        "blue-shade-700": "#F5F5FF",
        "black-shade-100": "#7C7C7C",
        "black-shade-200": "#DEDEDE",
        "black-shade-300": "#F6F6F6",
        "black-shade-400": "#CCCCCC",
        "black-shade-500": "#4F4F4F",
        "black-shade-600": "#F5F5F5",
        "black-shade-700": "#D9D9D9",
        "black-shade-800": "#EDEDED",
        "black-shade-900": "#B9B9B9",
        "green-shade-100": "#00CE78",
        "green-shade-200": "#25d366",
        "dark-blue": "#00172B",
        "light-blue": "#5E9CBF",
        "deep-blue": "#214965",
        "medium-blue": "#427FA3",
        "navy-blue": "#05223B",
        "light-cyan": "#A7DBF2",
        "slate-blue": "#376380",
        "midnight-blue": "#11334D",
        "sky-blue": "#8AB3C9",
        "grayish-blue": "#718391",
      },
      fontFamily: {
        quanty: ["var(--font-quanty)"],
        poppins: ["var(--font-poppins)"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
