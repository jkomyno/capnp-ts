import { fs, initTrace, path, ts } from '../deps.ts';

import * as s from '../capnp/std/schema.capnp.ts';
import { CodeGeneratorContext } from './code-generator-context.ts';
import { CodeGeneratorFileContext } from './code-generator-file-context.ts';
import { SOURCE_COMMENT } from './constants.ts';
import { loadRequestedFile, lookupNode } from './file.ts';
import {
    generateCapnpImport,
    generateConcreteListInitializer,
    generateFileId,
    generateNestedImports,
    generateNode,
} from './generators.ts';

const trace = initTrace('capnpc:compile');
trace('load');

export function compile(ctx: CodeGeneratorFileContext): string {
    generateCapnpImport(ctx);

    generateNestedImports(ctx);

    generateFileId(ctx);

    lookupNode(ctx, ctx.file)
        .getNestedNodes()
        .map((n) => lookupNode(ctx, n))
        .forEach((n) => generateNode(ctx, n));

    ctx.concreteLists.forEach(([fullClassName, field]) => generateConcreteListInitializer(ctx, fullClassName, field));

    const sourceFile = ts.createSourceFile(ctx.tsPath, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const printer = ts.createPrinter();
    const source = ctx.statements.map((s) => printer.printNode(ts.EmitHint.Unspecified, s, sourceFile)).join('\n') +
        '\n';

    return SOURCE_COMMENT + source;
}

export function loadRequest(req: s.CodeGeneratorRequest): CodeGeneratorContext {
    trace('loadRequest(%s)', req);

    const ctx = new CodeGeneratorContext();

    ctx.files = req.getRequestedFiles().map((file) => loadRequestedFile(req, file));

    return ctx;
}

export function printSourceFiles(ctx: CodeGeneratorContext): string[] {
    trace('printSourceFiles()');

    return ctx.files.map(compile);
}

export function writeTsFiles(ctx: CodeGeneratorContext): void {
    trace('writeTsFiles()');

    ctx.files.forEach((f) => {
        trace('writing %s', f.tsPath);

        fs.mkdirSync(path.dirname(f.tsPath), { recursive: true });
        fs.writeFileSync(f.tsPath, compile(f), { encoding: 'utf-8' });
    });
}
