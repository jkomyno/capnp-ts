/**
 * Why would anyone **SANE** ever use this!?
 *
 * @author jdiaz5513
 */

import { ListCtor } from './list.ts';
import { PointerList } from './pointer-list.ts';
import { Void } from './void.ts';

export const VoidList: ListCtor<Void> = PointerList(Void);
