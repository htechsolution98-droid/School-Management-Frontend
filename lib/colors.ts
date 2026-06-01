// Color Palette Configuration
export const COLORS = {
  // Primary Colors
  lightBlue: "#429CE4",
  logoBlue: "#285E89",

  // Green Colors
  darkGreen: "#6A7626",
  lightGreen: "#E4FF4C",

  // Orange Colors
  lightOrange: "#FFA600",
  logoOrange: "#FFA600",
  darkOrange: "#ED6708",
} as const;

// CSS Variables format for use in stylesheets
export const colorsCSSVariables = `
  :root {
    --color-light-blue: ${COLORS.lightBlue};
    --color-logo-blue: ${COLORS.logoBlue};
    --color-dark-green: ${COLORS.darkGreen};
    --color-light-green: ${COLORS.lightGreen};
    --color-light-orange: ${COLORS.lightOrange};
    --color-logo-orange: ${COLORS.logoOrange};
    --color-dark-orange: ${COLORS.darkOrange};
  }
`;

// Tailwind-compatible color configuration
export const tailwindColorConfig = {
  colors: {
    "brand-light-blue": COLORS.lightBlue,
    "brand-logo-blue": COLORS.logoBlue,
    "brand-dark-green": COLORS.darkGreen,
    "brand-light-green": COLORS.lightGreen,
    "brand-light-orange": COLORS.lightOrange,
    "brand-logo-orange": COLORS.logoOrange,
    "brand-dark-orange": COLORS.darkOrange,
  },
};
