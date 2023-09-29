/**
 * @author jdiaz5513
 */

import { initTrace } from '../../../deps.ts';

import { ListElementSize } from '../list-element-size.ts';
import { _ListCtor, List } from './list.ts';
import { getContent } from './pointer.ts';

const trace = initTrace('capnp:list:composite');
trace('load');

export class Uint32List extends List<number> {
    static readonly _capnp: _ListCtor = {
        displayName: 'List<Uint32>' as string,
        size: ListElementSize.BYTE_4,
    };

    get(index: number): number {
        const c = getContent(this);
        return c.segment.getUint32(c.byteOffset + index * 4);
    }

    set(index: number, value: number): void {
        const c = getContent(this);
        c.segment.setUint32(c.byteOffset + index * 4, value);
    }

    toString(): string {
        return `Uint32_${super.toString()}`;
    }
}
