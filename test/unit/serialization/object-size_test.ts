import { assertEquals, test } from '../../test_deps.ts';

import { ObjectSize } from '../../../src/capnp/mod.ts';

test('ObjectSize.toString()', () => {
    assertEquals(new ObjectSize(8, 1).toString(), 'ObjectSize_dw:1,pc:1');
});
