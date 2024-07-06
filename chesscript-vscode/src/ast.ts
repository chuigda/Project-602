export interface Token {
   kind: 'keyword' | 'ident' | 'string' | 'number' | 'symbol' | 'comment' | 'dialogue',
   value: string,
   line: number,
   col: number,
}

export interface SyntaxError {
   line: number,
   col: number,
   message: string,
}

export interface DialogueItem {
   kind: 'dialogue',
   speaker: Token,
   emotion?: Token,
   content: Token[]
}

export interface MetadataItem {
   kind: 'metadata',
   key: Token,
   value: Token
}
