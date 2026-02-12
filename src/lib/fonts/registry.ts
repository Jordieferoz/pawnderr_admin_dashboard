import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const fontRegistry = {
  fredoka: {
    label: "Fredoka",
    font: fredoka,
  },
} as const;

export type FontKey = keyof typeof fontRegistry;

export const fontVars = (
  Object.values(fontRegistry) as Array<(typeof fontRegistry)[FontKey]>
)
  .map((f) => f.font.variable)
  .join(" ");

export const fontOptions = (
  Object.entries(fontRegistry) as Array<
    [FontKey, (typeof fontRegistry)[FontKey]]
  >
).map(([key, f]) => ({
  key,
  label: f.label,
  variable: f.font.variable,
}));
