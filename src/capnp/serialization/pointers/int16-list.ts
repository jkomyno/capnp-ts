/**
 * @author jdiaz5513
 */

import { initTrace } from '../../../deps.ts';

import { ListElementSize } from '../list-element-size.ts';
import { _ListCtor, List } from './list.ts';
import { getContent } from './pointer.ts';

const trace = initTrace('capnp:list:composite');
trace('load');

export class Int16List extends List<number> {
    static readonly _capnp: _ListCtor = {
        displayName: 'List<Int16>' as string,
        size: ListElementSize.BYTE_2,
    };

    get(index: number): number {
        const c = getContent(this);

        return c.segment.getInt16(c.byteOffset + index * 2);
    }

    set(index: number, value: number): void {
        const c = getContent(this);

        c.segment.setInt16(c.byteOffset + index * 2, value);
    }

    toString(): string {
        return `Int16_${super.toString()}`;
    }
}
