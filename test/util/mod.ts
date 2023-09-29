import { initTrace } from '../../src/deps.ts';
import { assertEquals, fail, testcheck } from '../test_deps.ts';
import { type Test } from '../test_deps.ts';

const { check } = testcheck;

import { readFileSync } from 'node:fs';
import * as path from 'node:path';

import { dumpBuffer, format, pad } from '../../src/capnp/util.ts';

const trace = initTrace('capnp-ts-test:util');

function diffHex(found: ArrayBuffer, wanted: ArrayBuffer): string {
    const a = new Uint8Array(found);
    const b = new Uint8Array(wanted);

    for (let i = 0; i < a.byteLength && i < b.byteLength; i++) {
        if (a[i] !== b[i]) {
            trace(dumpBuffer(found));
            trace(dumpBuffer(wanted));
            return format('addr:%a,found:%s,wanted:%s', i, pad(a[i].toString(16), 2), pad(b[i].toString(16), 2));
        }
    }

    if (a.byteLength > b.byteLength) {
        return format('addr:%a,found:%s,wanted:EOF', b.byteLength, pad(a[b.byteLength].toString(16), 2));
    } else if (b.byteLength > a.byteLength) {
        return format('addr:%a,found:EOF,wanted:%s', a.byteLength, pad(b[a.byteLength].toString(16), 2));
    }

    return 'equal';
}

export async function compareBuffers(
    parentTest: Test,
    found: ArrayBuffer,
    wanted: ArrayBuffer,
    name = 'should have the same buffer contents',
): Promise<void> {
    await parentTest.step(name, () => {
        assertEquals(
            found.byteLength,
            wanted.byteLength,
            `should have the same byte length (diff=${diffHex(found, wanted)}).`,
        );

        // End the comparison prematurely if the buffer lengths differ.

        if (found.byteLength !== wanted.byteLength) {
            return;
        }

        const a = new Uint8Array(found);
        const b = new Uint8Array(wanted);

        for (let i = 0; i < a.byteLength; i++) {
            if (a[i] !== b[i]) {
                fail(`bytes are not equal (${diffHex(found, wanted)})`);

                // Don't check any of the other bytes or else we might flood with failures.
                return;
            }
        }
    });
}

export function readFileBuffer(url: URL): ArrayBuffer {
    const b = readFileSync(url);

    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

export async function runTestCheck<TArgs>(
    parentTest: Test,
    property: testcheck.Property<TArgs>,
    options?: testcheck.CheckOptions,
    name = 'should satisfy property check',
): Promise<void> {
    await parentTest.step(name, () => {
        const out = check(property, options);

        assertEquals(out.result, true, `property check failed ${JSON.stringify(out)}`);
    });
}
