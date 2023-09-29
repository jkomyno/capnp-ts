import { assert, assertEquals, assertThrows, test } from '../../../test_deps.ts';
import { Message, Pointer } from '../../../../src/capnp/mod.ts';
import * as C from '../../../../src/capnp/constants.ts';

test('new Pointer()', async (t) => {
    const m = new Message();
    const s = m.getSegment(0);

    const initialTraversalLimit = m._capnp.traversalLimit;

    await t.step('should throw when exceeding the depth limit', () => {
        assertThrows(
            () => {
                new Pointer(s, 0, 0);
            },
        );
    });

    const p = new Pointer(s, 4);

    assertEquals(m._capnp.traversalLimit, initialTraversalLimit - 8, 'should track pointer allocation in the message');

    await t.step('should throw with a negative offset', () => {
        assertThrows(
            () => {
                new Pointer(s, -1);
            },
        );
    });

    await t.step('should throw when exceeding segment bounds', () => {
        assertThrows(
            () => {
                new Pointer(s, 100);
            },
        );
    });

    assertEquals(s.byteLength, 8);
    assert(new Pointer(s, 8), 'should allow creating pointers at the end of the segment');

    assertEquals(p.segment, s);
    assertEquals(p.byteOffset, 4);
    assertEquals(p._capnp.depthLimit, C.MAX_DEPTH);
});

test('Pointer.adopt(), Pointer.disown()', (t) => {
    const m = new Message();
    const s = m.getSegment(0);
    const p = new Pointer(s, 0);

    // Empty bit list.
    s.setUint32(0, 0x00000001);
    s.setUint32(4, 0x00000001);

    const o = Pointer.disown(p);

    assertEquals(s.getUint32(0), 0x00000000);
    assertEquals(s.getUint32(4), 0x00000000);

    Pointer.adopt(o, p);

    assertEquals(s.getUint32(0), 0x00000001);
    assertEquals(s.getUint32(4), 0x00000001);
});

test('Pointer.dump()', () => {
    const m = new Message();
    const s = m.getSegment(0);
    const p = new Pointer(s, 0);

    s.setUint32(0, 0x00000001);
    s.setUint32(4, 0x00000002);

    assertEquals(Pointer.dump(p), '[01 00 00 00 02 00 00 00]');
});

test('Pointer.toString()', () => {
    const m = new Message();
    const s = m.getSegment(0);
    const p = new Pointer(s, 0);

    s.setUint32(0, 0x00000001);
    s.setUint32(4, 0x00000002);

    assertEquals(p.toString(), '->0@0x00000000[01 00 00 00 02 00 00 00]');
});
