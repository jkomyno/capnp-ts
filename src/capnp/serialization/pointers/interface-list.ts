/**
 * @author jdiaz5513
 */

import { Interface } from './interface.ts';
import { ListCtor } from './list.ts';
import { PointerList } from './pointer-list.ts';

export const InterfaceList: ListCtor<Interface> = PointerList(Interface);
