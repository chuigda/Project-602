impl Parser {
   fn parse_metadata(mut context: ParseContext) -> Either<(MetadataItem, ParseContext), SyntaxError> {
      context.variation = LexerVariation::Metadata;
      let (key, context1) = context.next_token();

      if key.kind != TokenKind::Ident {
         return Either::Right(SyntaxError {
            line: key.line,
            col: key.col,
            message: "Expected identifier".to_string()
         });
      }

      let (maybe_value, mut context2) = context1.next_token();
      if maybe_value.kind == TokenKind::Symbol && maybe_value.value.as_deref() == Some("]") {
         context2.variation = LexerVariation::Dialogue;
         return Either::Left((MetadataItem { key, value: None }, context2));
      }
      else if maybe_value.kind != TokenKind::String && maybe_value.kind != TokenKind::Ident {
         return Either::Right(SyntaxError {
            line: maybe_value.line,
            col: maybe_value.col,
            message: "Expected identifier or string".to_string()
         });
      }

      let (token, mut context3) = context2.next_token();
      if token.kind != TokenKind::Symbol || token.value.as_deref() != Some("]") {
         return Either::Right(SyntaxError {
            line: token.line,
            col: token.col,
            message: "Expected ']'".to_string()
         });
      }

      context3.variation = LexerVariation::Dialogue;
      Either::Left((MetadataItem { key, value: Some(maybe_value) }, context3))
   }
}