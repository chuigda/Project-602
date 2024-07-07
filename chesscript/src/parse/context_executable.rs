use phf::{Map as PhfMap, phf_map};

static KEYWORDS: PhfMap<&'static str, &'static str> = phf_map! {
   "if" => "if",
   "如果" => "if",
   "else" => "else",
   "否则" => "else",
   "while" => "while",
   "当" => "while"
};

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
         '1'..='9' => self.next_number(),
         '"' | '\'' | '“' | '”' => self.next_string(),
         _ => self.next_ident_or_keyword()
      }
   }

   fn next_number(mut self) -> (Token, Self) {
      let start = self.idx;
      while self.idx < self.chars.len() && self.chars[self.idx].is_ascii_digit() {
         self.idx += 1;
         self.col += 1;
      }
      let value = self.chars[start..self.idx].iter().collect::<String>();
      (Token::with_value(TokenKind::Number, &value, self.line, self.col), self)
   }

   fn next_ident_or_keyword(mut self) -> (Token, Self) {
      let start = self.idx;
      while self.idx < self.chars.len() && !Self::is_nonident_char(self.chars[self.idx]) {
         self.idx += 1;
         self.col += 1;
      }
      let value = self.chars[start..self.idx].iter().collect::<String>();

      if let Some(keyword) = KEYWORDS.get(&value[..]) {
         (Token::with_value(TokenKind::Keyword, keyword, self.line, self.col), self)
      } else {
         (Token::with_value(TokenKind::Ident, value, self.line, self.col), self)
      }
   }

   fn is_nonident_char(c: char) -> bool {
      match c {
         '{' | '｛' | '}' | '｝' | '(' | '（' | ')' | '）' | ',' | '，' | '=' | '!' | '<' | '>' | '+' | '-' | '*' | '/' | '%' | '^' | '&' | '|'
         | '"' | '\'' | '“' | '”' => true,
         _ => c.is_whitespace()
      }
   }
}
