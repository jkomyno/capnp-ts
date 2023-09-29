/**
 * @author jdiaz5513
 */

import { initTrace } from '../../../deps.ts';

import { ListElementSize } from '../list-element-size.ts';
import { _ListCtor, List } from './list.ts';
import { Text } from './text.ts';
import { getContent } from './pointer.ts';

const trace = initTrace('capnp:list:composite');
trace('load');

export class TextList extends List<string> {
    static readonly _capnp: _ListCtor = {
        displayName: 'List<Text>' as string,
        size: ListElementSize.POINTER,
    };

    get(index: number): string {
        const c = getContent(this);

        c.byteOffset += index * 8;

        return Text.fromPointer(c).get(0);
    }

    set(index: number, value: string): void {
        const c = getContent(this);

        c.byteOffset += index * 8;

        Text.fromPointer(c).set(0, value);
    }

    toString(): string {
        return `Text_${super.toString()}`;
    }
}
