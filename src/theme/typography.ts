/**
 * Typography and Dimension Standards for Kirana Ledger
 * Complies with minimum body size (>=16sp), money size (>=20sp), and tap targets (>=48dp).
 */

export const typography = {
  sizes: {
    micro: 11,
    xs: 12,
    sm: 14,
    body: 16,
    md: 18,
    money: 20,
    title: 22,
    xl: 26,
    display: 32,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "900" as const,
  },
  lineHeights: {
    body: 24,
    heading: 30,
    display: 38,
  },
};

export const layout = {
  minTapTarget: 48,
  cardRadius: 14,
  buttonRadius: 12,
  inputRadius: 12,
  pillRadius: 999,
};
