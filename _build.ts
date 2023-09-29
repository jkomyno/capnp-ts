import {
  build,
  emptyDir,
} from "https://deno.land/x/dnt@0.38.0/mod.ts";
import packageJson from "./package.json" assert { type: "json" };

const outDir = "./npm";
await emptyDir(outDir);

packageJson.version = Deno.args[0] ?? packageJson.version;

await build({
  entryPoints: ["./src/capnp/mod.ts"],
  outDir,
  declaration: true,
  test: false,
  scriptModule: false,
  packageManager: "npm",
  compilerOptions: {
    skipLibCheck: false,
    target: "ES2021",
    sourceMap: true,
    inlineSources: false,
  },
  package: packageJson,
  shims: {
    deno: true,
  },
});

Deno.copyFileSync("LICENSE", `${outDir}/LICENSE`);
Deno.copyFileSync("README.md", `${outDir}/README.md`);
