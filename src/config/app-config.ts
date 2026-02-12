import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, Admin.`,
  meta: {
    title: "Admin",
    description: "Admin",
  },
};
