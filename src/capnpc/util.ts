import { initTrace } from '../deps.ts';

const trace = initTrace('capnpc:util');
trace('load');

export function c2s(s: string): string {
    return splitCamel(s)
        .map((x) => x.toUpperCase())
        .join('_');
}

export function c2t(s: string): string {
    return s.substring(0, 1).toUpperCase() + s.substring(1);
}

export function splitCamel(s: string): string[] {
    let wasLo = false;

    return s.split('').reduce((a: string[], c: string) => {
        const lo = c.toUpperCase() !== c;
        const up = c.toLowerCase() !== c;

        if (a.length === 0 || (wasLo && up)) {
            a.push(c);
        } else {
            const i = a.length - 1;
            a[i] = a[i] + c;
        }

        wasLo = lo;

        return a;
    }, []);
}

export function hexToBigInt(h: string): bigint {
    const prefix = '0x';

    if (h.substring(0, prefix.length) === prefix) {
        return BigInt(h);
    }

    return BigInt(`${prefix}${h}`);
}
