/**
 * @author jdiaz5513
 */

import { MAX_DEPTH } from '../../constants.ts';
import { NOT_IMPLEMENTED } from '../../errors.ts';
import { format } from '../../util.ts';
import { Segment } from '../segment.ts';
import { Pointer } from './pointer.ts';

export class Interface extends Pointer {
    constructor(segment: Segment, byteOffset: number, depthLimit = MAX_DEPTH) {
        super(segment, byteOffset, depthLimit);

        throw new Error(format(NOT_IMPLEMENTED, 'new Interface'));
    }
}
