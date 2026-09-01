const fs = require('fs');
const ts = require('typescript');
const program = ts.createProgram(['src/App.tsx'], {});
const diagnostics = ts.getPreEmitDiagnostics(program);
diagnostics.forEach(diag => {
    if (diag.file) {
        const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
        const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        console.log(+  (,): );
    } else {
        console.log(ts.flattenDiagnosticMessageText(diag.messageText, '\n'));
    }
});
