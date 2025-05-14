import ts from 'typescript';
import { SecurityValidators } from '../../../src/types/validation/security';

/**
 * TypeScriptカスタムコンパイラプラグイン
 */
export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
        const visitor = (node: ts.Node): ts.Node => {
            // セキュリティチェック: テンプレートリテラル内の危険な文字列を検出
            if (ts.isTemplateExpression(node)) {
                checkTemplateLiteral(node, program.getSourceFile(node.getSourceFile().fileName)!);
            }

            // 型安全性強化: any型の使用を警告
            if (ts.isTypeReferenceNode(node) && node.typeName.getText() === 'any') {
                warnAnyTypeUsage(node, program.getSourceFile(node.getSourceFile().fileName)!);
            }

            // パフォーマンス最適化: 大きなオブジェクトリテラルの検出
            if (ts.isObjectLiteralExpression(node) && node.properties.length > 10) {
                warnLargeObjectLiteral(node, program.getSourceFile(node.getSourceFile().fileName)!);
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return (sourceFile: ts.SourceFile) => ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
}

/**
 * プラグインファクトリ関数
 */
export function createTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
        const program = ts.createProgram([], {});
        return transformer(program)(context);
    };
}

/**
 * テンプレートリテラルのセキュリティチェック
 */
function checkTemplateLiteral(node: ts.TemplateExpression, sourceFile: ts.SourceFile) {
    const text = node.getText(sourceFile);
    try {
        SecurityValidators.preventXSS(text);
        SecurityValidators.preventSQLInjection(text);
    } catch (error) {
        const message = (error as Error).message;
        const pos = node.getStart(sourceFile);
        const lineAndChar = sourceFile.getLineAndCharacterOfPosition(pos);

        console.warn(
            `[TS Security Plugin] ${message}\n` +
            `  at ${sourceFile.fileName}:${lineAndChar.line + 1}:${lineAndChar.character + 1}`
        );
    }
}

/**
 * any型使用の警告
 */
function warnAnyTypeUsage(node: ts.TypeReferenceNode, sourceFile: ts.SourceFile) {
    const pos = node.getStart(sourceFile);
    const lineAndChar = sourceFile.getLineAndCharacterOfPosition(pos);

    console.warn(
        `[TS Type Safety] any型の使用は推奨されません\n` +
        `  at ${sourceFile.fileName}:${lineAndChar.line + 1}:${lineAndChar.character + 1}`
    );
}

/**
 * 大きなオブジェクトリテラルの警告
 */
function warnLargeObjectLiteral(node: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile) {
    const pos = node.getStart(sourceFile);
    const lineAndChar = sourceFile.getLineAndCharacterOfPosition(pos);

    console.warn(
        `[TS Performance] 大きなオブジェクトリテラル(${node.properties.length}プロパティ)はパフォーマンスに影響する可能性があります\n` +
        `  at ${sourceFile.fileName}:${lineAndChar.line + 1}:${lineAndChar.character + 1}`
    );
}