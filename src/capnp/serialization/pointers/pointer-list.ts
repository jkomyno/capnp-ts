/**
 * @author jdiaz5513
 */

import { initTrace } from '../../../deps.ts';

import { ListElementSize } from '../list-element-size.ts';
import { _ListCtor, List, ListCtor } from './list.ts';
import { copyFrom, getContent, Pointer, PointerCtor } from './pointer.ts';

const trace = initTrace('capnp:list:composite');
trace('load');

export function PointerList<T extends Pointer>(PointerClass: PointerCtor<T>): ListCtor<T> {
    return class extends List<T> {
        static readonly _capnp: _ListCtor = {
            displayName: `List<${PointerClass._capnp.displayName}>`,
            size: ListElementSize.POINTER,
        };

        get(index: number): T {
            const c = getContent(this);
            return new PointerClass(c.segment, c.byteOffset + index * 8, this._capnp.depthLimit - 1);
        }

        set(index: number, value: T): void {
            copyFrom(value, this.get(index));
        }

        toString(): string {
            return `Pointer_${super.toString()},cls:${PointerClass.toString()}`;
        }
    };
}
