/**
 * @author jdiaz5513
 */

import { initTrace } from '../../../deps.ts';
import { assertNever } from '../../errors.ts';
import { Segment } from '../segment.ts';
import { AnyArena } from './any-arena.ts';
import { ArenaAllocationResult } from './arena-allocation-result.ts';
import { ArenaKind } from './arena-kind.ts';
import { MultiSegmentArena } from './multi-segment-arena.ts';
import { SingleSegmentArena } from './single-segment-arena.ts';

const trace = initTrace('capnp:arena');
trace('load');

export abstract class Arena {
    static readonly allocate = allocate;
    static readonly getBuffer = getBuffer;
    static readonly getNumSegments = getNumSegments;
}

export function allocate(minSize: number, segments: Segment[], a: AnyArena): ArenaAllocationResult {
    switch (a.kind) {
        case ArenaKind.MULTI_SEGMENT:
            return MultiSegmentArena.allocate(minSize, a);

        case ArenaKind.SINGLE_SEGMENT:
            return SingleSegmentArena.allocate(minSize, segments, a);

        default:
            return assertNever(a);
    }
}

export function getBuffer(id: number, a: AnyArena): ArrayBuffer {
    switch (a.kind) {
        case ArenaKind.MULTI_SEGMENT:
            return MultiSegmentArena.getBuffer(id, a);

        case ArenaKind.SINGLE_SEGMENT:
            return SingleSegmentArena.getBuffer(id, a);

        default:
            return assertNever(a);
    }
}

export function getNumSegments(a: AnyArena): number {
    switch (a.kind) {
        case ArenaKind.MULTI_SEGMENT:
            return MultiSegmentArena.getNumSegments(a);

        case ArenaKind.SINGLE_SEGMENT:
            return SingleSegmentArena.getNumSegments();

        default:
            return assertNever(a);
    }
}
