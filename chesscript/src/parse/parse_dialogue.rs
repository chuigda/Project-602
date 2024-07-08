impl Parser {
   fn parse_dialogue(
      context: ParseContext,
      init_token: Token
   ) -> Either<(Dialogue, ParseContext), SyntaxError> {
      let speaker = init_token;

      let (mut token1, mut context1) = context.next_token();
      let emotion = if token1.kind == TokenKind::Symbol && token1.value.as_deref() == Some("(") {
         let (emotion, context2) = context1.next_token();
         if emotion.kind != TokenKind::DialogueText {
            return Either::Right(SyntaxError {
               line: emotion.line,
               col: emotion.col,
               message: "Expected emotion".to_string()
            });
         }

         let (token2, context3) = context2.next_token();
         if token2.kind != TokenKind::Symbol || token2.value.as_deref() != Some(")") {
            return Either::Right(SyntaxError {
               line: token2.line,
               col: token2.col,
               message: "Expected ')'".to_string()
            });
         }

         (token1, context1) = context3.next_token();
         Some(emotion)
      } else {
         None
      };

      if token1.kind != TokenKind::Symbol || token1.value.as_deref() != Some(":") {
         return Either::Right(SyntaxError {
            line: token1.line,
            col: token1.col,
            message: "Expected ':'".to_string()
         });
      }

      let mut text = Vec::new();
      loop {
         let (token2, context2) = context1.next_dialogue_text_token_unbreakable();
         if token2.kind == TokenKind::EndOfInput {
            return Either::Left((Dialogue { speaker, emotion, text }, context2));
         }
         else if token2.kind == TokenKind::NewLine {
            let (token3, context3) = context2.next_token();
            if token3.kind == TokenKind::NewLine {
               return Either::Left((Dialogue { speaker, emotion, text }, context3));
            }
            else {
               context1 = context2;
            }
         }
         else {
            text.push(token2);
            context1 = context2;
         }
      }
   }
}