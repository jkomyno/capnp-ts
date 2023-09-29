export { assert, assertEquals, assertThrows, fail } from 'https://deno.land/std@0.193.0/testing/asserts.ts';

export const { test } = Deno;
export type Test = Deno.TestContext;

export * as testcheck from 'npm:testcheck';
