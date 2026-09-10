const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/app/page.js', 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

const decls = [];

ast.program.body.forEach(node => {
    let name = null;
    let type = node.type;
    
    if (node.type === 'VariableDeclaration') {
        name = node.declarations[0].id.name;
    } else if (node.type === 'FunctionDeclaration') {
        name = node.id ? node.id.name : 'default';
    } else if (node.type === 'ExportDefaultDeclaration') {
        name = node.declaration.id ? node.declaration.id.name : 'default';
    }
    
    if (name) {
        decls.push({
            name,
            start: node.loc.start.line,
            end: node.loc.end.line,
            type
        });
    }
});

fs.writeFileSync('ast_decls.json', JSON.stringify(decls, null, 2));
console.log('Written ast_decls.json');
