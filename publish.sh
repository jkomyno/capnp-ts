#!/usr/bin/env bash

deno run -A _build.ts

(
  cd npm
  npm publish --tag alpha
)

rm -rf npm
