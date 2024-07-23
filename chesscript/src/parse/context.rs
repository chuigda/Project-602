use crate::ast::{Token, TokenKind};

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum LexerVariation { Dialogue, Metadata }

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
      if self.idx >= self.chars.len() {
         return (Token::new(TokenKind::EndOfInput, self.line, self.col), self);
      }

      match self.variation {
         LexerVariation::Dialogue => self.next_dialogue_token(),
         LexerVariation::Metadata => self.next_metadata_token()
      }
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

   fn next_string(mut self) -> (Token, Self) {
      let starting_char = self.chars[self.idx];
      let end_char = match starting_char {
         '"' => '"',
         '\'' => '\'',
         '“' => '”',
         '”' => '“',
         _ => unreachable!()
      };

      let mut value = String::new();
      self.idx += 1;

      while self.idx < self.chars.len() && self.chars[self.idx] != end_char {
         if self.chars[self.idx] == '\\' {
            self.idx += 1;
            self.col += 1;
            match self.chars[self.idx] {
               'n' => value.push('\n'),
               't' => value.push('\t'),
               '\\' => value.push('\\'),
               _ => value.push(self.chars[self.idx])
            }
         } else {
            value.push(self.chars[self.idx]);
         }
         self.idx += 1;
         self.col += 1;
      }

      self.idx += 1;
      self.col += 1;

      (Token::with_value(TokenKind::String, &value, self.line, self.col), self)
   }
}

impl<'a> ParseContext<'a> {
   fn next_dialogue_token(mut self) -> (Token, Self) {
      self.skip_dialogue_whitespace();
      match self.chars[self.idx] {
         '\n' => (Token::new(TokenKind::NewLine, self.line, self.col), ParseContext {
            idx: self.idx + 1,
            line: self.line + 1,
            col: 1,
            ..self
         }),
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
         '[' | '［' => (Token::with_value(TokenKind::Symbol, "[", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         ']' | '］' => (Token::with_value(TokenKind::Symbol, "]", self.line, self.col), ParseContext {
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
         ':' | '：' => (Token::with_value(TokenKind::Symbol, ":", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         _ => self.next_dialogue_text_token()
      }
   }

   fn next_dialogue_text_token(mut self) -> (Token, Self) {
      let mut value = String::new();

      while self.idx < self.chars.len() {
         let c = self.chars[self.idx];
         if c == '\n' || c == '{' || c == '｛' || c == '}' || c == '｝' || c == '[' || c == '［' || c == ']' || c == '］' || c == '(' || c == '（' || c == ')' || c == '）' || c == ':' || c == '：' {
            break;
         }
         self.idx += 1;
         self.col += 1;
         value.push(c);
      }

      (Token::with_value(TokenKind::DialogueText, value, self.line, self.col), self)
   }

   pub fn next_dialogue_text_token_unbreakable(mut self) -> (Token, Self) {
      if self.idx >= self.chars.len() {
         return (Token::new(TokenKind::EndOfInput, self.line, self.col), self);
      }

      if self.chars[self.idx] == '\n' {
         return (Token::new(TokenKind::NewLine, self.line, self.col), ParseContext {
            idx: self.idx + 1,
            line: self.line + 1,
            col: 1,
            ..self
         });
      }

      let mut value = String::new();

      while self.idx < self.chars.len() {
         let c = self.chars[self.idx];
         if c == '\n' {
            break;
         }
         self.idx += 1;
         self.col += 1;
         value.push(c);
      }

      (Token::with_value(TokenKind::DialogueText, value, self.line, self.col), self)
   }

   fn skip_dialogue_whitespace(&mut self) {
      while self.idx < self.chars.len() && self.is_dialogue_whitespace(self.chars[self.idx]) {
         self.idx += 1;
         self.col += 1;
      }
   }

   fn is_dialogue_whitespace(&self, c: char) -> bool {
      c == ' ' || c == '\t' || c == '　' || c == '\r'
   }
}

include!("./context_dialogue.rs");
include!("./context_metadata.rs");
