import { compareBuffers, runTestCheck } from '../util/mod.ts';
import { assertEquals, assertThrows, test } from '../test_deps.ts';
import { testcheck } from '../test_deps.ts';
const { gen, property } = testcheck;
import * as util from '../../src/capnp/util.ts';
import { hexToBigInt } from '../../src/capnpc/util.ts';

import * as C from '../../src/capnp/constants.ts';
import { RANGE_INVALID_UTF8 } from '../../src/capnp/errors.ts';

const BAD_UTF8 = [
    new Uint8Array([0xff, 0xff]),
    new Uint8Array([0xf4, 0xaf, 0x92, 0xa9]),
    new Uint8Array([0xc3]),
    new Uint8Array([0xe0]),
    new Uint8Array([0xe0, 0xbc]),
    new Uint8Array([0xf0]),
    new Uint8Array([0xf0, 0x9f]),
    new Uint8Array([0xf0, 0x9f, 0x92]),
];
const UTF8_BUFFERS = [
    { buf: new Uint8Array([0x21]), str: '!' },
    { buf: new Uint8Array([0xc3, 0xad]), str: 'í' },
    { buf: new Uint8Array([0xe0, 0xbc, 0x80]), str: 'ༀ' },
    { buf: new Uint8Array([0xf0, 0x9f, 0x92, 0xa9]), str: '💩' },
];

test('dec <-> hex', async (t) => {
    await t.step('should convert small hex', () => {
        assertEquals(hexToBigInt('FA'), 250n);
        assertEquals(hexToBigInt('0xFA'), 250n);
        assertEquals(hexToBigInt('0x0'), 0n);
    });

    await t.step('should convert 128-bit hex', () => {
        assertEquals(hexToBigInt('0x89B6E64A8EC5FFFF'), 9923372036854775807n);
    });
});

test('bufferToHex()', () => {
    assertEquals(util.bufferToHex(new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]).buffer), '[aa bb cc dd]');
});

test('checkInt32()', () => {
    assertThrows(() => util.checkInt32(0xffffffff));
    assertThrows(() => util.checkInt32(-0xffffffff));

    util.checkInt32(0x7fffffff);
    util.checkInt32(-0x7fffffff);
});

test('checkUint32()', () => {
    assertThrows(() => util.checkUint32(0xffffffff + 1));
    assertThrows(() => util.checkUint32(-1));

    util.checkUint32(0xffffffff);
    util.checkUint32(0);
});

test('decodeUtf8()', () => {
    UTF8_BUFFERS.forEach(({ buf, str }) => {
        assertEquals(util.decodeUtf8(buf), str);
    });

    BAD_UTF8.forEach((b) => {
        assertThrows(() => util.decodeUtf8(b), RangeError, RANGE_INVALID_UTF8);
    });
});

test('decodeUtf8(encodeUtf8())', async (t) => {
    await runTestCheck(
        t,
        property(gen.string, (s) => util.decodeUtf8(util.encodeUtf8(s)) === s),
        { numTests: 1000 },
    );
});

test('dumpBuffer()', (t) => {
    const buf1 = new Uint8Array(64);

    // Gratuitous? Yes. Awesome? Yes.

    for (let i = 0; i < 11; i++) buf1[i + 1] = 'Cap\'n Proto'.charCodeAt(i);
    for (let i = 0; i < 11; i++) buf1[i + 19] = 'Cap\'n Proto'.charCodeAt(i);
    buf1[0x10] = 0x11;
    buf1[0x11] = 0x05;

    assertEquals(
        util.dumpBuffer(buf1),
        `
=== buffer[64] ===
00000000: 00 43 61 70 27 6e 20 50  72 6f 74 6f 00 00 00 00    ·Cap'n Proto····
00000010: 11 05 00 43 61 70 27 6e  20 50 72 6f 74 6f 00 00    ···Cap'n Proto··
00000020: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00    ················
00000030: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00    ················
`,
    );

    const buf2Length = C.MAX_BUFFER_DUMP_BYTES + 16;
    const buf2 = new Uint8Array(buf2Length);
    let buf2Wanted = `\n=== buffer[${C.MAX_BUFFER_DUMP_BYTES}] ===`;

    for (let i = 0; i < C.MAX_BUFFER_DUMP_BYTES / 16; i++) {
        buf2Wanted += `\n${
            util.pad(
                (i * 16).toString(16),
                8,
            )
        }: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00    ················`;
    }

    buf2Wanted += '\n=== (truncated 16 bytes) ===\n';

    assertEquals(util.dumpBuffer(buf2), buf2Wanted);
    assertEquals(util.dumpBuffer(buf2.buffer), buf2Wanted);
});

test('encodeUtf8()', async (t) => {
    for (const { buf, str } of UTF8_BUFFERS) {
        // The output buffer might be longer than its contents so we need to slice it.

        const out = util.encodeUtf8(str);
        await compareBuffers(t, out.buffer.slice(0, out.byteLength), buf.buffer);
    }
});

test('format()', () => {
    assertEquals(util.format('%a', 0x0da0beef), '0x0da0beef');
    assertEquals(util.format('%b', 0b10101010), '10101010');
    assertEquals(util.format('%c', 33), '!');
    assertEquals(util.format('%c', '!'), '!');
    assertEquals(util.format('%d', 777), '777');
    assertEquals(util.format('%f', 777.777777), '777.777777');
    assertEquals(util.format('%.2f', 0.771), '.77');
    assertEquals(util.format('%0.3f', 0.7777), '0.778');
    assertEquals(util.format('%j', { a: 'b' }), '{"a":"b"}');
    assertEquals(util.format('%o', parseInt('777', 8)), '0777');
    assertEquals(util.format('%s', { toString: () => 'test' }), 'test');
    assertEquals(util.format('%x', 0x0badbeef), '0xbadbeef');
    assertEquals(util.format('%X', 0x0badbeef), '0xBADBEEF');
    assertEquals(util.format('%z', 'verbatim'), 'z');
    assertEquals(util.format('hi'), 'hi');
});

test('identity()', () => {
    assertEquals(util.identity('x'), 'x');
});

test('pad()', () => {
    assertEquals(util.pad('0', 8), '00000000');
    assertEquals(util.pad('0', 8, '='), '=======0');
    assertEquals(util.pad('000000000', 8), '000000000');
});

test('padToWord()', () => {
    assertEquals(util.padToWord(7), 8);
    assertEquals(util.padToWord(0), 0);
    assertEquals(util.padToWord(9), 16);
});

test('repeat()', () => {
    assertEquals(util.repeat(10, '0'), '0000000000');
    assertEquals(util.repeat(0, 'x'), '');
    assertEquals(util.repeat(-1, 'z'), '');
});
