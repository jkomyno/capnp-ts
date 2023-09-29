import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { Buffer } from 'node:buffer';

import initTrace from 'npm:debug';
import ts from 'npm:typescript@5.1.6';

export { fs, initTrace, path, process, ts };
export { Buffer };
