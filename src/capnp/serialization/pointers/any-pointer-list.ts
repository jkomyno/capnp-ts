/**
 * @author jdiaz5513
 */

import { ListCtor } from './list.ts';
import { Pointer } from './pointer.ts';
import { PointerList } from './pointer-list.ts';

export const AnyPointerList: ListCtor<Pointer> = PointerList(Pointer);
