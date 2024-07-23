impl ParseContext<'_> {
   fn next_metadata_token(mut self) -> (Token, Self) {
      self.skip_whitespace();
      match self.chars[self.idx] {
         ']' | '】' => (Token::with_value(TokenKind::Symbol, "]", self.line, self.col), ParseContext {
            idx: self.idx + 1,
            col: self.col + 1,
            ..self
         }),
         '"' | '\'' | '“' | '”' => self.next_string(),
         _ => self.next_metadata_ident_token()
      }
   }

   fn next_metadata_ident_token(mut self) -> (Token, Self) {
      let mut value = String::new();

      while self.idx < self.chars.len() {
         let c = self.chars[self.idx];
         if c.is_whitespace() || c == ']' || c == '】' || c == '"' || c == '\'' || c == '“' || c == '”' {
            break;
         }
         self.idx += 1;
         self.col += 1;
         value.push(c);
      }

      (Token::with_value(TokenKind::Ident, &value, self.line, self.col), self)
   }
}
