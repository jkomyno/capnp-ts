/**
 * @author jdiaz5513
 */

import { assertEquals, assertThrows, test } from '../../test_deps.ts';

import {
    getHammingWeight,
    getTagByte,
    getUnpackedByteLength,
    getZeroByteCount,
    pack,
    unpack,
} from '../../../src/capnp/serialization/packing.ts';
import { compareBuffers, readFileBuffer } from '../../util/mod.ts';

type Word = [number, number, number, number, number, number, number, number];
type TagData = { tag: number; weight: number; word: Word }[];

const TAG_DATA: TagData = [
    {
        tag: 0b00000000,
        weight: 0,
        word: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    },
    {
        tag: 0b00110001,
        weight: 3,
        word: [0x09, 0x00, 0x00, 0x00, 0x04, 0x01, 0x00, 0x00],
    },
    {
        tag: 0b00000001,
        weight: 1,
        word: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    },
    {
        tag: 0b11111111,
        weight: 8,
        word: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    },
    {
        tag: 0b10000000,
        weight: 1,
        word: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff],
    },
    {
        tag: 0b11111111,
        weight: 8,
        word: [0x0a, 0x15, 0x01, 0xac, 0x6d, 0x9f, 0x03, 0xf2],
    },
    {
        tag: 0b00111111,
        weight: 6,
        word: [0x41, 0x53, 0x53, 0x48, 0x41, 0x54, 0x00, 0x00],
    },
];

// NOTE: for these tests to work `PACK_SPAN_THRESHOLD` must be set to `2`.

const PACKING_DATA = [
    {
        name: 'flat',
        packed: readFileBuffer(new URL('../../data/flat-packed.bin', import.meta.url)),
        unpacked: readFileBuffer(new URL('../../data/flat.bin', import.meta.url)),
    },
    {
        name: 'span',
        packed: readFileBuffer(new URL('../../data/span-packed.bin', import.meta.url)),
        unpacked: readFileBuffer(new URL('../../data/span.bin', import.meta.url)),
    },
    {
        name: 'test',
        packed: readFileBuffer(new URL('../../data/test-packed.bin', import.meta.url)),
        unpacked: readFileBuffer(new URL('../../data/test.bin', import.meta.url)),
    },
    {
        name: 'zero',
        packed: readFileBuffer(new URL('../../data/zero-packed.bin', import.meta.url)),
        unpacked: readFileBuffer(new URL('../../data/zero.bin', import.meta.url)),
    },
];

test('getHammingWeight()', (t) => {
    TAG_DATA.forEach((d) => assertEquals(getHammingWeight(d.tag), d.weight));
});

test('getTagByte()', (t) => {
    TAG_DATA.forEach((d) => assertEquals(getTagByte(...d.word), d.tag));
});

test('getUnpackedByteLength()', (t) => {
    PACKING_DATA.forEach(({ name, packed, unpacked }) => {
        assertEquals(getUnpackedByteLength(packed), unpacked.byteLength, name);
    });
});

test('getZeroByteCount()', (t) => {
    TAG_DATA.forEach((d) => assertEquals(getZeroByteCount(...d.word), 8 - d.weight));
});

test('pack()', async (t) => {
    for (const { name, packed, unpacked } of PACKING_DATA) {
        await compareBuffers(t, pack(unpacked), packed, name);
    }

    assertThrows(() => pack(new ArrayBuffer(7)));
});

test('unpack()', async (t) => {
    for (const { name, packed, unpacked } of PACKING_DATA) {
        await compareBuffers(t, unpack(packed), unpacked, name);
    }
});
