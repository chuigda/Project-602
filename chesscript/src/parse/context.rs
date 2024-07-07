use crate::ast::{Token, TokenKind};

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum LexerVariation {
   Dialogue,
   ExecutableBlock,
   Metadata
}

#[derive(Debug, Clone, Copy)]
pub struct ParseContext<'a> {
   pub chars: &'a [char],
   pub line: u32,
   pub col: u32,
   pub idx: usize,
   pub variation: LexerVariation
}

impl<'a> ParseContext<'a> {
   pub fn new(chars: &'a [char]) -> Self {
      Self {
         chars,
         line: 1,
         col: 1,
         idx: 0,
         variation: LexerVariation::Dialogue
      }
   }

   pub fn next_token(self) -> (Token, Self) {
      match self.variation {
         LexerVariation::Dialogue => self.next_dialogue_token(),
         LexerVariation::ExecutableBlock => self.next_executable_block_token(),
         LexerVariation::Metadata => self.next_metadata_token()
      }
   }
}

include!("./context_dialogue.rs");

impl<'a> ParseContext<'a> {
   fn next_executable_block_token(mut self) -> (Token, Self) {
      self.skip_whitespace();
      match self.chars[self.idx] {
         '{' | '｛' => (Token::with_value(TokenKind::Symbol, "{", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         '}' | '｝' => (Token::with_value(TokenKind::Symbol, "}", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         '(' | '（' => (Token::with_value(TokenKind::Symbol, "(", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         ')' | '）' => (Token::with_value(TokenKind::Symbol, ")", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         ',' | '，' => (Token::with_value(TokenKind::Symbol, ",", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         '=' => {
            if self.chars.get(self.idx + 1) == Some(&'=') {
               (Token::with_value(TokenKind::Symbol, "==", self.line, self.col), ParseContext {
                  idx: self.idx + 2,
                  col: self.col + 2,
                  ..self
               })
            } else {
               (Token::with_value(TokenKind::Symbol, "=", self.line, self.col), ParseContext {
                  idx: self.idx + 1,
                  col: self.col + 1,
                  ..self
               })
            }
         },
         '!' => {
            if self.chars.get(self.idx + 1) == Some(&'=') {
               (Token::with_value(TokenKind::Symbol, "!=", self.line, self.col), ParseContext {
                  idx: self.idx + 2,
                  col: self.col + 2,
                  ..self
               })
            } else {
               (Token::with_value(TokenKind::Symbol, "!", self.line, self.col), ParseContext {
                  idx: self.idx + 1,
                  col: self.col + 1,
                  ..self
               })
            }
         },
         '<' => {
            if self.chars.get(self.idx + 1) == Some(&'=') {
               (Token::with_value(TokenKind::Symbol, "<=", self.line, self.col), ParseContext {
                  idx: self.idx + 2,
                  col: self.col + 2,
                  ..self
               })
            } else {
               (Token::with_value(TokenKind::Symbol, "<", self.line, self.col), ParseContext {
                  idx: self.idx + 1,
                  col: self.col + 1,
                  ..self
               })
            }
         },
         '>' => {
            if self.chars.get(self.idx + 1) == Some(&'=') {
               (Token::with_value(TokenKind::Symbol, ">=", self.line, self.col), ParseContext {
                  idx: self.idx + 2,
                  col: self.col + 2,
                  ..self
               })
            } else {
               (Token::with_value(TokenKind::Symbol, ">", self.line, self.col), ParseContext {
                  idx: self.idx + 1,
                  col: self.col + 1,
                  ..self
               })
            }
         },
         '+' | '-' | '*' | '/' | '%' | '^' | '&' | '|' => (Token::with_value(TokenKind::Symbol, self.chars[self.idx], self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         _ => self.next_ident_or_keyword()
      }
   }

   fn next_ident_or_keyword(mut self) -> (Token, Self) {
   }

   fn skip_whitespace(&mut self) {
      while self.idx < self.chars.len() && self.chars[self.idx].is_whitespace() {
         if self.chars[self.idx] == '\n' {
            self.line += 1;
            self.col = 1;
         } else {
            self.col += 1;
         }
         self.idx += 1;
      }
   }
}