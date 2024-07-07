import * as vscode from 'vscode';
import { lex } from './lex';
import { minParse } from './min-parse';

let DiagCollection: vscode.DiagnosticCollection

export const TokenTypes = [
   'keyword',
   'identifier',
   'variable',
   'string',
   'number',
   'operator',
   'comment',
   'regexp',
   'property',
   'type',
   'function',
]

export const TokenModifiers = []

export const TokenTypesMap: Record<string, number> = (() => {
   const map: Record<string, number> = {}
   TokenTypes.forEach((type, idx) => map[type] = idx)
   return map
})()

export class TokenProvider implements vscode.DocumentSemanticTokensProvider {
   provideDocumentSemanticTokens(
      document: vscode.TextDocument,
      token: vscode.CancellationToken
   ): vscode.ProviderResult<vscode.SemanticTokens> {
      const [tokens, syntaxError] = lex(document.getText())
      DiagCollection.clear()

      if (syntaxError) {
         const range = new vscode.Range(
            syntaxError.line - 1, syntaxError.col - 1,
            syntaxError.line - 1, syntaxError.col
         )
         const diag = new vscode.Diagnostic(range, syntaxError.message, vscode.DiagnosticSeverity.Error)
         DiagCollection.set(document.uri, [diag])
      }

      const builder = new vscode.SemanticTokensBuilder()
      for (let i = 0; i < tokens.length; i++) {
         const token = tokens[i]
         if (token.kind === 'dialogue') {
            continue;
         }

         let tokenTypeId
         switch (token.kind) {
            case 'ident':
               tokenTypeId = TokenTypesMap.variable
               break
            case 'symbol':
               tokenTypeId = TokenTypesMap.operator
               break
            default:
               tokenTypeId = TokenTypesMap[token.kind]
         }
         const tokenLength = token.kind === 'string' || token.kind === 'comment' ? token.value.length + 2 : token.value.length
         builder.push(token.line - 1, token.col - 1, tokenLength, tokenTypeId, 0)
      }

      if (syntaxError) {
         return builder.build()
      }

      console.info('start minimally parsing items')
      const [items, syntaxError2] = minParse(tokens.filter(token => token.kind !== 'comment'))
      if (syntaxError2) {
         const range = new vscode.Range(
            syntaxError2.line - 1, syntaxError2.col - 1,
            syntaxError2.line - 1, syntaxError2.col
         )
         const diag = new vscode.Diagnostic(range, syntaxError2.message, vscode.DiagnosticSeverity.Error)
         DiagCollection.set(document.uri, [diag])
      }

      for (const item of items) {
         if (item.kind == 'metadata') {
            builder.push(item.key.line - 1, item.key.col - 1, item.key.value.length, TokenTypesMap.variable, 0)
            builder.push(item.value.line - 1, item.value.col - 1, item.value.value.length, TokenTypesMap.string, 0)
         } else {
            builder.push(item.speaker.line - 1, item.speaker.col - 1, item.speaker.value.length, TokenTypesMap.function, 0)
            if (item.emotion) {
               builder.push(item.emotion.line - 1, item.emotion.col - 1, item.emotion.value.length, TokenTypesMap.property, 0)
            }
            for (const token of item.content) {
               builder.push(token.line - 1, token.col - 1, token.value.length, TokenTypesMap.string, 0)
            }
         }
      }

      return builder.build()
   }
}

export function activate(context: vscode.ExtensionContext) {
   DiagCollection = vscode.languages.createDiagnosticCollection('chesscript')
   context.subscriptions.push(DiagCollection)
   context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(
      { language: 'chesscript' },
      new TokenProvider(),
      new vscode.SemanticTokensLegend(TokenTypes, TokenModifiers)
   ))

   console.info('Chesscript extension activated')
}

export function deactivate() {
}