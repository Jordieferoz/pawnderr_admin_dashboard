import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Pawnderr",
  version: packageJson.version,
  copyright: `© ${currentYear}, Pawnderr.`,
  meta: {
    title: "Pawnderr",
    description: "Admin",
  },
};
