import { assertEquals, assertThrows, Buffer, test } from '../../test_deps.ts';

import * as C from '../../../src/capnp/constants.ts';
import { Message } from '../../../src/capnp/serialization/mod.ts';
import { MultiSegmentArena } from '../../../src/capnp/serialization/arena/mod.ts';
import { getFramedSegments, preallocateSegments } from '../../../src/capnp/serialization/message.ts';
// import { Person } from "../../integration/serialization-demo";
import { compareBuffers, readFileBuffer } from '../../util/mod.ts';

const SEGMENTED_PACKED = readFileBuffer(new URL('../../data/segmented-packed.bin', import.meta.url));
const SEGMENTED_UNPACKED = readFileBuffer(new URL('../../data/segmented.bin', import.meta.url));

test('new Message(ArrayBuffer, false)', async (t) => {
    const message = new Message(SEGMENTED_UNPACKED, false);

    await compareBuffers(t, message.toArrayBuffer(), SEGMENTED_UNPACKED, 'should read segmented messages');
});

// test("new Message(Buffer, false)", async (t) => {
//   const message = new Message(new Buffer(SEGMENTED_UNPACKED), false);
//
//   await compareBuffers(t, message.toArrayBuffer(), SEGMENTED_UNPACKED, "should read messages from a Buffer");
// });

test('new Message(ArrayBuffer)', async (t) => {
    const message = new Message(SEGMENTED_PACKED);

    await compareBuffers(t, message.toArrayBuffer(), SEGMENTED_UNPACKED, 'should read packed messages');
});

// test("new Message(Buffer)", async (t) => {
//   const message = new Message(new Buffer(SEGMENTED_PACKED));
//
//   await compareBuffers(t, message.toArrayBuffer(), SEGMENTED_UNPACKED, "should read packed messages from a Buffer");
// });

test('getFramedSegments()', async (t) => {
    await t.step('should throw when segment counts are missing', () => {
        assertThrows(
            () =>
                getFramedSegments(
                    new Uint8Array([
                        0x00,
                        0x00,
                        0x00,
                        0x00, // need at least 4 more bytes for an empty message
                    ]).buffer,
                ),
        );
    });

    await t.step('should throw when there are not enough segment counts', () => {
        assertThrows(
            () =>
                getFramedSegments(
                    new Uint8Array([
                        0x00,
                        0x00,
                        0x00,
                        0x01,
                        0x00,
                        0x00,
                        0x00,
                        0x00, // need at least 4 more bytes for the second segment length
                    ]).buffer,
                ),
        );
    });

    await t.step('should throw when message is truncated', () => {
        assertThrows(
            () =>
                getFramedSegments(
                    new Uint8Array([
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x10,
                        0x00,
                        0x00,
                        0x00, // should have 16 words in a single segment
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x00, // but only get 2
                    ]).buffer,
                ),
        );
    });
});

test('Message.allocateSegment()', (t) => {
    const length = C.DEFAULT_BUFFER_SIZE;

    const m1 = new Message();

    m1.allocateSegment(length);
    m1.allocateSegment(length);

    assertThrows(() => m1.getSegment(1));

    // Single segment arenas always grow by slightly more than what was allocated.

    assertEquals(
        m1.getSegment(0).buffer.byteLength,
        length * 2 + C.MIN_SINGLE_SEGMENT_GROWTH,
        'should replace existing segments',
    );

    const m2 = new Message(new MultiSegmentArena());

    m2.allocateSegment(length);
    m2.allocateSegment(length);

    assertEquals(m2.getSegment(1).buffer.byteLength, length, 'should allocate new segments');
});

test('Message.dump()', (t) => {
    const m1 = new Message(new MultiSegmentArena());

    assertEquals(
        m1.dump(),
        `================
No Segments
================
`,
        'should print an empty message',
    );

    const m2 = new Message();

    m2.allocateSegment(16).allocate(16);

    assertEquals(
        m2.dump(),
        `================
Segment #0
================

=== buffer[16] ===
00000000: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00    ················
`,
        'should print messages',
    );
});

test('Message.getSegment()', async (t) => {
    const s = new Message(new MultiSegmentArena()).getSegment(0);

    assertEquals(s.byteLength, 8, 'should preallocate segment 0');

    await t.step('should throw when getting out of range segments', () => {
        assertThrows(() => new Message().getSegment(1));
    });

    // this is too small to hold the root pointer
    const m = new Message(new MultiSegmentArena([new ArrayBuffer(2)]));

    await t.step('should throw when segment 0 is too small', () => {
        assertThrows(() => m.getSegment(0));
    });
});

// TODO:
// test("Message.onCreatePointer()", (t) => {
//   // This is why you should cache the result of `getList()` calls and use `List.toArray()` liberally...
//
//   const m = new Message();
//   const p = m.initRoot(Person);
//
//   assertThrows(
//     () => {
//       for (let i = 0; i < C.DEFAULT_TRAVERSE_LIMIT + 1; i++) p.getPhones();
//     },
//     undefined,
//     "should throw when exceeding the pointer traversal limit"
//   );
// });

test('Message.toArrayBuffer()', (t) => {
    assertEquals(new Message().toArrayBuffer().byteLength, 16, 'should allocate segment 0 before converting');
});

test('Message.toPackedArrayBuffer()', async (t) => {
    const message = new Message(SEGMENTED_UNPACKED, false);

    await compareBuffers(t, message.toPackedArrayBuffer(), SEGMENTED_PACKED, 'should pack messages properly');
});

test('preallocateSegments()', (t) => {
    assertThrows(
        () => {
            const message = new Message(new MultiSegmentArena());

            preallocateSegments(message);
        },
        'should throw when preallocating an empty arena',
    );
});
