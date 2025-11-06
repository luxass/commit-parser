import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  dts: true,
  treeshake: true,
  outDir: "./dist",
  format: "esm",
  clean: true,
  exports: true,
  publint: true,
});
