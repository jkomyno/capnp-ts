```
      ██████╗ █████╗ ██████╗ ██╗███╗   ██╗
     ██╔════╝██╔══██╗██╔══██╗██║████╗  ██║
     ██║     ███████║██████╔╝╚═╝██╔██╗ ██║
     ██║     ██╔══██║██╔═══╝    ██║╚██╗██║
     ╚██████╗██║  ██║██║        ██║ ╚████║
      ╚═════╝╚═╝  ╚═╝╚═╝        ╚═╝  ╚═══╝
 ██████╗ ██████╗  ██████╗ ████████╗ ██████╗
 ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗
 ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║
 ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║
 ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝

                         infinitely
                           faster!

-- TypeScript + ESM Edition

```

This is a TypeScript + ESM implementation of the [Cap'n Proto](https://capnproto.org) serialization protocol. It provides a TypeScript library and a plugin for the official compiler, `capnpc`. Start with the [Cap'n Proto Introduction](https://capnproto.org/index.html) for more detailed information on what this is about.

This is a partial rewrite of https://github.com/jdiaz5513/capnp-ts.
Why a rewrite? Because:
- I wanted to use it in a Deno project, but the original version wasn't compatible with Deno (as it was using CommonJS rather than ESM)
- `tap`, the test framework used by the original version, doesn't work well with ESM (despite trying to use `ts-node/register` and `"esm": true`)
- The latest compiler plugin available, `capnpc-ts@0.7.0`, is broken (https://github.com/jdiaz5513/capnp-ts/issues/174)
- The original version wasn't compatible with TypeScript 4.8+ (https://github.com/jdiaz5513/capnp-ts/issues/177)
- I plan on sensibly diverging from the original project in a Wasm-oriented direction

## Installation

Grab the latest library version from deno:

```shell
import {...} from "https://deno.land/x/capnp/mod.ts"
```

You will need the TypeScript schema compiler as well, globally:

```shell
deno install --allow-env --allow-read --allow-write -n capnpc-ts "https://deno.land/x/capnpc/mod.ts"
```

The schema compiler is a [Cap'n Proto plugin](https://capnproto.org/otherlang.html#how-to-write-compiler-plugins) and requires the `capnpc` binary in order to do anything useful; follow the [Cap'n Proto installation instructions](https://capnproto.org/install.html) to install it on your system.

## Implementation Notes

> These notes are provided for people who are familiar with the C++ implementation, or implementations for other languages. Those who are new to Cap'n Proto may skip this section.

This implementation differs in a big way from the C++ reference implementation: there are no separate Builder or Reader classes. All pointers are essentially treated as Builders.

This has some major benefits for simplicity's sake, but there is a bigger reason for this decision (which was not made lightly). Everything is backed by `ArrayBuffer`s and there is no practical way to prevent mutating the data, even in a dedicated Reader class. The result of such mutations could be disastrous, and more importantly there is no way to reap much performance from making things read-only.

## Usage

### Compiling Schema Files

Run the following to compile a schema file into TypeScript source code:

```shell
capnpc -o ts path/to/myschema.capnp
```

Running that command will create a file named `path/to/myschema.capnp.ts`.

To write the compiled source to a different directory:

```shell
capnpc -o ts:/tmp/some-dir/ path/to/myschema.capnp
```

That will generate a file at `/tmp/some-dir/path/to/myschema.capnp.ts`.

### Reading Messages

To read a message, do something like the following:

```typescript
import * as capnp from "https://deno.land/x/capnp/mod.ts";

import { MyStruct } from "./myschema.capnp.ts";

export function loadMessage(buffer: ArrayBuffer): MyStruct {
  const message = new capnp.Message(buffer);

  return message.getRoot(MyStruct);
}
```

## Building

TODO

## Debugging

Some debug trace functionality is provided by the [debug](https://www.npmjs.com/package/debug) library.

To see trace messages in nodejs, export the following environment variable:

```bash
export DEBUG='capnp*'
```

When running in a web browser, use `localStorage` to enable debug output:

```javascript
localStorage.debug = "capnp*";
```

Trace messages can get rather noisy, so tweak the `DEBUG` variable as you see fit.

All messages also have a handy `.dump()` method that returns a hex dump of the first 8 KiB for each segment in the message:

```
> console.log(message.dump());

================
Segment #0
================

=== buffer[64] ===
00000000: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
00000010: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
00000020: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
00000030: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
```

## License

[MIT](/LICENSE.md)
