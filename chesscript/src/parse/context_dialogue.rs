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
         '{' | '｛' => self.next_code_block(),
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

   fn next_code_block(mut self) -> (Token, Self) {
      let mut value = String::new();
      let mut depth = 1;

      self.idx += 1;
      self.col += 1;

      while self.idx < self.chars.len() {
         let c = self.chars[self.idx];
         if c == '}' || c == '｝' {
            depth -= 1;
            if depth == 0 {
               break;
            }
         } else if c == '{' || c == '｛' {
            depth += 1;
         }
         self.idx += 1;
         self.col += 1;
         value.push(c);
      }

      (Token::with_value(TokenKind::CodeBlock, value, self.line, self.col), ParseContext {
         idx: self.idx + 1,
         col: self.col + 1,
         ..self
      })
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
      else if self.chars[self.idx] == '[' || self.chars[self.idx] == '【' {
         return (Token::with_value(TokenKind::Symbol, "[", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         });
      }
      else if self.chars[self.idx] == '{' || self.chars[self.idx] == '｛' {
         return self.next_code_block();
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