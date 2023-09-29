import { assert, assertEquals, assertThrows, test } from '../../../test_deps.ts';
import { Message, ObjectSize, Orphan, Struct } from '../../../../src/capnp/mod.ts';
import { Int32List } from '../../../../src/capnp/serialization/mod.ts';

/** Just a silly struct that holds a single pointer to... itself? */

class TestStruct extends Struct {
    static readonly _capnp = {
        displayName: 'TestStruct',
        id: 'f38ff832f33d57da',
        size: new ObjectSize(8, 2),
    };

    adoptTest(value: Orphan<TestStruct>): void {
        Struct.adopt(value, Struct.getPointer(0, this));
    }

    disownTest(): Orphan<TestStruct> {
        return Struct.disown(this.getTest());
    }

    getTest(): TestStruct {
        return Struct.getPointerAs(0, TestStruct, this);
    }

    hasTest(): boolean {
        return !Struct.isNull(Struct.getPointer(0, this));
    }

    initTest(): TestStruct {
        return Struct.initStructAt(0, TestStruct, this);
    }

    setTest(value: TestStruct): void {
        Struct.copyFrom(value, Struct.getPointer(0, this));
    }

    getFoo(): number {
        return Struct.getUint32(0, this);
    }

    setFoo(value: number): void {
        Struct.setUint32(0, value, this);
    }

    disownList(): Orphan<Int32List> {
        return Struct.disown(this.getList());
    }

    getList(): Int32List {
        return Struct.getPointerAs(1, Int32List, this);
    }

    initList(length: number): Int32List {
        return Struct.initList(1, Int32List, length, this);
    }
}

test('new Orphan()', (t) => {
    const message = new Message();
    const root = message.initRoot(TestStruct);

    const structOrphan = new Orphan(root);

    if (structOrphan._capnp === undefined) {
        throw new Error('orphan already adopted?');
    }

    assertEquals(
        structOrphan._capnp.size.dataByteLength,
        TestStruct._capnp.size.dataByteLength,
        'should copy the data byte length',
    );
    assertEquals(
        structOrphan._capnp.size.pointerLength,
        TestStruct._capnp.size.pointerLength,
        'should copy the pointer count',
    );

    assert(Struct.isNull(root), 'should zero out the struct pointer');

    const list = new Message().initRoot(TestStruct).initList(2);

    const listOrphan = new Orphan(list);

    if (listOrphan._capnp === undefined) {
        throw new Error('orphan already adopted?');
    }

    assertEquals(listOrphan._capnp.length, 2, 'should copy the list length');
    assertEquals(listOrphan._capnp.elementSize, Int32List._capnp.size, 'should copy the list element size');

    assert(Struct.isNull(list), 'should zero out the list pointer');
});

test('Orphan._moveTo()', async (t) => {
    const root = new Message().initRoot(TestStruct);
    const oldChild = root.initTest();
    const oldList = root.initList(2);
    oldChild.setFoo(100);
    oldList.set(1, 300);

    const structOrphan = root.disownTest();
    const listOrphan = root.disownList();

    const newChild = root.initTest();
    const newList = root.initList(5);

    assertEquals(newChild.getFoo(), 0, 'should not contain disowned struct data in new struct');
    assertEquals(newList.get(1), 0, 'should not contain disowned list data in new list');

    newChild.setFoo(200);
    newList.set(1, 400);

    structOrphan._moveTo(newChild);
    listOrphan._moveTo(newList);

    assertEquals(newChild.getFoo(), 100, 'should overwrite target struct pointer and keep old data');
    assertEquals(newList.get(1), 300, 'should overwrite target list pointer and keep old data');
    assertEquals(newList.getLength(), 2, 'should set the correct list length');

    await t.step('should not allow re-adoption', () => {
        assertThrows(
            () => {
                structOrphan._moveTo(root.initTest());
            },
        );
    });

    await t.step('should not allow moving to a different message', () => {
        assertThrows(
            () => {
                const o = root.disownTest();
                o._moveTo(new Message().initRoot(TestStruct));
            },
        );
    });
});

test('Orphan.dispose()', () => {
    const root = new Message().initRoot(TestStruct);
    root.initTest().setFoo(100);
    root.initList(1).set(1, 200);

    const structOrphan = root.disownTest();
    const listOrphan = root.disownList();

    assertEquals(root.segment.getUint32(32), 100);
    assertEquals(root.segment.getInt32(60), 200);

    structOrphan.dispose();

    assertEquals(root.segment.getUint32(32), 0);

    listOrphan.dispose();

    assertEquals(root.segment.getInt32(60), 0);
});
