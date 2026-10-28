import { relative, sep, isAbsolute, join } from 'node:path';
import ts from 'typescript';

export function importsOfSource(source: string): string[] {
  const result: string[] = [];
  const ast = ts.createSourceFile('lesson.ts', source, ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node): void {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      result.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(ast) === 'require') && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      result.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return result;
}

export function lessonDeclarations(source: string): Record<string, string | number>[] {
  const ast = ts.createSourceFile('lesson.ts', source, ts.ScriptTarget.Latest, true);
  const found: Record<string, string | number>[] = [];
  function visit(node: ts.Node): void {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'lesson' && node.initializer) {
      let expression = node.initializer;
      if (ts.isSatisfiesExpression(expression)) expression = expression.expression;
      if (ts.isObjectLiteralExpression(expression)) {
        const fields: Record<string, string | number> = {};
        for (const property of expression.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          if (ts.isStringLiteral(property.initializer)) fields[property.name.getText(ast)] = property.initializer.text;
          if (ts.isNumericLiteral(property.initializer)) fields[property.name.getText(ast)] = Number(property.initializer.text);
        }
        found.push(fields);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return found;
}

export function primitivePrefixErrors(source: string, prefix: string): string[] {
  const errors: string[] = [];
  const ast = ts.createSourceFile('lesson.ts', source, ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const kind = node.expression.getText(ast);
      if (['Agent', 'MCPServer', 'createTool', 'createWorkflow', 'createScorer'].includes(kind)) {
        const config = node.arguments?.[0];
        if (config && ts.isObjectLiteralExpression(config)) {
          for (const property of config.properties) {
            if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.initializer)) continue;
            const key = property.name.getText(ast);
            const value = property.initializer.text;
            if (key === 'id' && !value.startsWith(prefix)) errors.push(`${kind} id "${value}" must start with ${prefix}`);
            if (key === 'name' && !value.startsWith(`L${prefix.slice(1, 3)} · `)) errors.push(`${kind} name "${value}" must carry its lesson label`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return errors;
}

export function isAllowedLessonImport(lessonDir: string, sharedDir: string, lessonsDir: string, target: string): boolean {
  const inside = (parent: string) => {
    const rel = relative(parent, target);
    return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
  };
  return inside(lessonDir) || inside(sharedDir) || ['registry', 'registry.ts', 'registry.js'].some((file) => target === join(lessonsDir, file));
}
