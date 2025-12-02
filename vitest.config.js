import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: './vitest.global-setup.js',
    reporters: ["default", "html", "junit"],

    outputFile: {
      html: "./report/HTML/index.html",
      junit:"./report/XML/junit.xml",
    },
  },
});
