/**
 * @author jdiaz5513
 */

import { Data } from './data.ts';
import { ListCtor } from './list.ts';
import { PointerList } from './pointer-list.ts';

export const DataList: ListCtor<Data> = PointerList(Data);
