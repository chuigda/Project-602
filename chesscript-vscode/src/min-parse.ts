import { DialogueItem, MetadataItem, Token } from './ast'
import { Ref, ref } from './ref'
import { SyntaxError } from './ast'

export function minParse(
   tokens: Token[]
): [(DialogueItem | MetadataItem)[], SyntaxError | undefined] {
   const ret: (DialogueItem | MetadataItem)[] = []
   const syntaxError: Ref<SyntaxError | undefined> = ref(undefined)

   let idx = 0
   while (idx < tokens.length) {
      idx = skipLineEnd(tokens, idx)
      idx = parseItem(ret, syntaxError, tokens, idx)

      if (syntaxError.value) {
         return [ret, syntaxError.value]
      }
   }

   return [ret, syntaxError.value]
}

function skipLineEnd(tokens: Token[], idx: number): number {
   while (idx < tokens.length && tokens[idx].value === '\n') {
      idx++
   }
   return idx
}

function parseItem(
   output: (DialogueItem | MetadataItem)[],
   syntaxError: Ref<SyntaxError | undefined>,
   tokens: Token[],
   idx: number
): number {
   if (idx >= tokens.length) {
      return idx
   }

   const token = tokens[idx]
   if (token.kind === 'symbol' && token.value === '{') {
      return skipCodeBlock(tokens, idx)
   }
   else if (token.kind === 'symbol' && token.value === '[') {
      return parseMetadata(output, syntaxError, tokens, idx)
   }
   else if (token.kind === 'dialogue') {
      return parseDialogue(output, syntaxError, tokens, idx)
   } else {
      syntaxError.value = { line: token.line, col: token.col, message: `Unexpected token "${token.value}"` }
      return idx + 1
   }
}

function skipCodeBlock(tokens: Token[], idx: number): number {
   let braceCount = 1
   idx++
   while (idx < tokens.length) {
      const token = tokens[idx]
      if (token.kind === 'symbol' && token.value === '{') {
         braceCount++
      }
      else if (token.kind === 'symbol' && token.value === '}') {
         braceCount--
         if (braceCount === 0) {
            return idx + 1
         }
      }
      idx++
   }

   return idx
}

function parseMetadata(
   output: (DialogueItem | MetadataItem)[],
   syntaxError: Ref<SyntaxError | undefined>,
   tokens: Token[],
   idx: number
): number {
   if (idx + 4 >= tokens.length) {
      syntaxError.value = { line: tokens[idx].line, col: tokens[idx].col, message: 'Incomplete metadata item' }
      return idx + 1
   }
   else if (tokens[idx + 1].kind !== 'dialogue'
            || (tokens[idx + 2].kind !== 'symbol' || tokens[idx + 2].value !== ':')
            || (tokens[idx + 3].kind !== 'dialogue' && tokens[idx + 3].value !== 'string')
            || tokens[idx + 4].kind !== 'symbol' || tokens[idx + 4].value !== ']') {
      syntaxError.value = { line: tokens[idx].line, col: tokens[idx].col, message: 'Bad metadata syntax' }
      return idx + 1
   }
   else {
      output.push({
         kind: 'metadata',
         key: tokens[idx + 1],
         value: tokens[idx + 3]
      })
      return idx + 5
   }
}

function parseDialogue(
   output: (DialogueItem | MetadataItem)[],
   syntaxError: Ref<SyntaxError | undefined>,
   tokens: Token[],
   idx: number
): number {
   const speaker = tokens[idx]
   if (idx + 1 >= tokens.length) {
      syntaxError.value = { line: speaker.line, col: speaker.col, message: 'Incomplete dialogue item' }
      return idx + 1
   }

   idx += 1;
   if (idx >= tokens.length) {
      syntaxError.value = { line: speaker.line, col: speaker.col, message: 'Incomplete dialogue item' }
      return idx
   }

   let emotion: Token | undefined = undefined
   if (tokens[idx].kind === 'symbol' && tokens[idx].value === '(') {
      if (idx + 2 >= tokens.length
          || tokens[idx + 1].kind !== 'dialogue'
          || tokens[idx + 2].kind !== 'symbol'
          || tokens[idx + 2].value !== ')')
      {
         syntaxError.value = { line: tokens[idx].line, col: tokens[idx].col, message: 'Bad emotion syntax' }
         return idx + 1
      }
      emotion = tokens[idx + 1]
      idx += 3
   }

   if (idx >= tokens.length) {
      syntaxError.value = { line: speaker.line, col: speaker.col, message: 'Incomplete dialogue item' }
      return idx
   }

   if (tokens[idx].kind !== 'symbol' || tokens[idx].value !== ':') {
      syntaxError.value = { line: tokens[idx].line, col: tokens[idx].col, message: 'Bad dialogue syntax' }
      return idx + 1
   }

   idx += 1
   const content: Token[] = []
   while (idx < tokens.length) {
      if (tokens[idx].kind === 'dialogue') {
         content.push(tokens[idx])
      }
      else if (tokens[idx].kind === 'symbol' && tokens[idx].value === '\n') {
         if (idx + 1 < tokens.length && tokens[idx + 1].kind === 'symbol' && tokens[idx + 1].value === '\n') {
            break
         }
      }

      idx += 1
   }

   output.push({
      kind: 'dialogue',
      speaker,
      emotion,
      content
   })
   return idx
}
