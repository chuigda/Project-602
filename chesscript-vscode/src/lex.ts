import { Ref, ref } from './ref'
import { SyntaxError, Token } from './ast'

export const KeywordSet: Set<string> = new Set(['if', 'else', 'while', 'true', 'false', 'null'])

export const SymbolStartingCharSet: Set<string> = new Set([
   '{', '｛', '}', '｝', '(', '（', ')', '）', ':', '：',
   '<', '>', '=', '!', '+', '-', '*', '/', '%', '&', '|',
   '"', "'", "“", '”',
   '\n'
])

export function lex(input: string): [Token[], SyntaxError | undefined] {
   const tokens: Token[] = []
   const syntaxError: Ref<SyntaxError | undefined> = ref(undefined)

   let braceCount = 0
   let currentIdx = 0
   let line = 1
   let col = 1
   while (currentIdx < input.length) {
      if (input[currentIdx] === '{' || input[currentIdx] === '｛') {
         tokens.push({ kind: 'symbol', value: '{', line, col })
         braceCount++
         currentIdx++
         col++
      }
      else if (input[currentIdx] === '}' || input[currentIdx] === '｝') {
         if (braceCount == 0) {
            syntaxError.value = { message: 'Unexpected "}"', line, col }
            return [tokens, syntaxError.value]
         }

         tokens.push({ kind: 'symbol', value: '}', line, col })
         braceCount--
         currentIdx++
         col++
      }
      else if (input[currentIdx] === '\n') {
         if (braceCount == 0) {
            tokens.push({ kind: 'symbol', value: '\n', line, col })
         }

         line++
         col = 1
         currentIdx++
      }
      else if (isSpace(input[currentIdx])) {
         currentIdx++
         col++
      }
      else {
         [currentIdx, line, col] = nextToken(input, currentIdx, line, col, tokens, syntaxError, braceCount != 0)
         if (syntaxError.value) {
            return [tokens, syntaxError.value]
         }
      }
   }

   if (braceCount > 0) {
      syntaxError.value = { message: 'Unclosed "}"', line, col }
   }

   return [tokens, syntaxError.value]
}

function nextToken(
   input: string,
   currentIdx: number,
   line: number,
   col: number,
   tokens: Token[],
   syntaxError: Ref<SyntaxError | undefined>,
   inCodeBlock?: boolean
): [number, number, number] {
   if (!inCodeBlock) {
      return nextDialogueToken(input, currentIdx, line, col, tokens, syntaxError)
   }

   let startIdx = currentIdx
   let currentChar = input[currentIdx]

   const startCol = col
   if (currentChar === '"' || currentChar === "'" || currentChar === '“' || currentChar === '‘') {
      let closingQuote
      switch (currentChar) {
         case '"': case "'":
            closingQuote = currentChar
            break
         case '“':
            closingQuote = '”'
            break
         case '‘':
            closingQuote = '’'
            break
      }

      currentIdx++
      col++
      while (currentIdx < input.length && input[currentIdx] !== closingQuote) {
         if (input[currentIdx] === '\n') {
            syntaxError.value = { message: 'Unterminated string', line, col }
            return [currentIdx, line, col]
         }
         currentIdx++
         col++
      }

      tokens.push({
         kind: 'string',
         value: input.substring(startIdx + 1, currentIdx),
         line,
         col: startCol
      })

      currentIdx++
      col++
   }
   else if (isDigit(currentChar)) {
      while (currentIdx < input.length && isDigit(input[currentIdx])) {
         currentIdx++
         col++
      }

      tokens.push({
         kind: 'number',
         value: input.substring(startIdx, currentIdx),
         line,
         col: startCol
      })
   }
   else if (isIdentStart(currentChar)) {
      while (currentIdx < input.length && isIdentChar(input[currentIdx])) {
         currentIdx++
         col++
      }
      const ident = input.substring(startIdx, currentIdx)
      tokens.push({
         kind: isKeyword(ident) ? 'keyword' : 'ident',
         value: ident,
         line,
         col: startCol
      })
   }
   else if (currentChar === '-') {
      if (currentIdx + 1 < input.length) {
         if (input[currentIdx + 1] === '-') {
            currentIdx += 2
            col += 2
            while (currentIdx < input.length && input[currentIdx] !== '\n') {
               currentIdx++
               col++
            }

            tokens.push({ kind: 'comment', value: input.substring(startIdx + 2, currentIdx), line, col: startCol })
         }
         else if (isDigit(input[currentIdx + 1])) {
            currentIdx++
            col++
            while (currentIdx < input.length && isDigit(input[currentIdx])) {
               currentIdx++
               col++
            }

            tokens.push({
               kind: 'number',
               value: input.substring(startIdx, currentIdx),
               line,
               col: startCol
            })
         }
         else {
            tokens.push({ kind: 'symbol', value: '-', line, col })
            currentIdx++
            col++
         }
      }
      else {
         tokens.push({ kind: 'symbol', value: '-', line, col })
         currentIdx++
         col++
      }
   }
   else if (currentChar === '>') {
      if (currentIdx + 1 < input.length && input[currentIdx + 1] === '=') {
         tokens.push({ kind: 'symbol', value: '>=', line, col })
         currentIdx += 2
         col += 2
      }
      else {
         tokens.push({ kind: 'symbol', value: '>', line, col })
         currentIdx++
         col++
      }
   }
   else if (currentChar === '<') {
      if (currentIdx + 1 < input.length && input[currentIdx + 1] === '=') {
         tokens.push({ kind: 'symbol', value: '<=', line, col })
         currentIdx += 2
         col += 2
      }
      else {
         tokens.push({ kind: 'symbol', value: '<', line, col })
         currentIdx++
         col++
      }
   }
   else {
      tokens.push({ kind: 'symbol', value: currentChar, line, col })
      currentIdx++
      col++
   }

   return [currentIdx, line, col]
}

function nextDialogueToken(
   input: string,
   currentIdx: number,
   line: number,
   col: number,
   tokens: Token[],
   syntaxError: Ref<SyntaxError | undefined>
): [number, number, number] {
   let startIdx = currentIdx
   let currentChar = input[currentIdx]
   if (currentChar === '-' && currentIdx + 1 < input.length && input[currentIdx + 1] === '-') {
      currentIdx += 2
      col += 2
      while (currentIdx < input.length && input[currentIdx] !== '\n') {
         currentIdx++
         col++
      }

      tokens.push({ kind: 'comment', value: input.substring(startIdx + 2, currentIdx), line, col: col - (currentIdx - startIdx) })
   }
   else if (currentChar === '(' || currentChar === '（') {
      tokens.push({ kind: 'symbol', value: '(', line, col })
      currentIdx++
      col++
   }
   else if (currentChar === ')' || currentChar === '）') {
      tokens.push({ kind: 'symbol', value: ')', line, col })
      currentIdx++
      col++
   }
   else if (currentChar === '[' || currentChar === '【') {
      tokens.push({ kind: 'symbol', value: '[', line, col })
      currentIdx++
      col++
   }
   else if (currentChar === ']' || currentChar === '】') {
      tokens.push({ kind: 'symbol', value: ']', line, col })
      currentIdx++
      col++
   }
   else if (currentChar === ':' || currentChar === '：') {
      tokens.push({ kind: 'symbol', value: ':', line, col })
      currentIdx++
      col++
   }
   else if (currentChar === '\n') {
      tokens.push({ kind: 'symbol', value: '\n', line, col })
      currentIdx++
      line++
      col = 1
   }
   else {
      while (currentIdx < input.length
             && input[currentIdx] !== '(' && input[currentIdx] !== '（'
             && input[currentIdx] !== ')' && input[currentIdx] !== '）'
             && input[currentIdx] !== '[' && input[currentIdx] !== '【'
             && input[currentIdx] !== ']' && input[currentIdx] !== '】'
             && input[currentIdx] !== ':'
             && input[currentIdx] !== '：'
             && input[currentIdx] !== '\n'
             && !(input[currentIdx] === '-' && currentIdx + 1 < input.length && input[currentIdx + 1] === '-'))
      {
         currentIdx++
         col++
      }

      tokens.push({
         kind: 'dialogue',
         value: input.substring(startIdx, currentIdx),
         line,
         col: col - (currentIdx - startIdx)
      })
   }

   return [currentIdx, line, col]
}

function isSpace(c: string): boolean {
   return c === ' ' || c === '\t' || c === '\f' || c === '\r' || c === '\v'
}

function isDigit(c: string): boolean {
   return c >= '0' && c <= '9'
}

function isIdentStart(c: string): boolean {
   return !isSpace(c) && !isDigit(c) && !SymbolStartingCharSet.has(c)
}

function isIdentChar(c: string): boolean {
   return !isSpace(c) && !SymbolStartingCharSet.has(c)
}

function isKeyword(ident: string): boolean {
   return KeywordSet.has(ident)
}
