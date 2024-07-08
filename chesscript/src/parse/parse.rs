use xjbutil::either::Either;

use crate::ast::{
   Dialogue,
   DialogueBlock,
   ExecutableBlock,
   MetadataItem,
   ScriptBlock,
   ScriptFile,
   SyntaxError,
   Token,
   TokenKind
};
use crate::parse::ParseContext;

use super::LexerVariation;

pub struct Parser;

impl Parser {
   pub fn parse(
      file_name: impl ToString,
      context: ParseContext
   ) -> (ScriptFile, Option<SyntaxError>) {
      let mut ret = ScriptFile {
         file_name: file_name.to_string(),
         metadata: Vec::new(),
         blocks: Vec::new()
      };

      let mut context = context;
      let mut dialogue_block: DialogueBlock = DialogueBlock { dialogue: Vec::new() };
      loop {
         context = Parser::skip_empty_lines(context);

         let (token, context1) = context.next_token();
         if token.kind == TokenKind::EndOfInput {
            break;
         }

         if token.kind == TokenKind::DialogueText {
            match Parser::parse_dialogue(context1, token) {
               Either::Left((dialogue, context2)) => {
                  dialogue_block.dialogue.push(dialogue);
                  context = context2;
               },
               Either::Right(err) => {
                  return (ret, Some(err));
               }
            }
         }
         else if token.kind == TokenKind::Symbol {
            match token.value.as_deref() {
               Some("[") => {
                  match Parser::parse_metadata(context1) {
                     Either::Left((metadata, context2)) => {
                        ret.metadata.push(metadata);
                        context = context2;
                     },
                     Either::Right(err) => {
                        return (ret, Some(err));
                     }
                  }
               },
               Some("{") => {
                  ret.blocks.push(ScriptBlock::DialogueBlock(dialogue_block));
                  dialogue_block = DialogueBlock { dialogue: Vec::new() };

                  match Parser::parse_executable(context1) {
                     Either::Left((executable_block, ctx2)) => {
                        ret.blocks.push(ScriptBlock::ExecutableBlock(executable_block));
                        context = ctx2;
                     },
                     Either::Right(err) => {
                        return (ret, Some(err));
                     }
                  }
               },
               _ => {
                  return (ret, Some(SyntaxError {
                     line: token.line,
                     col: token.col,
                     message: format!("Unexpected token: {:?}", token)
                  }));
               }
            }
         }
      }

      if !dialogue_block.dialogue.is_empty() {
         ret.blocks.push(ScriptBlock::DialogueBlock(dialogue_block));
      }

      (ret, None)
   }

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

      let (value, context2) = context1.next_token();
      if value.kind != TokenKind::String && value.kind != TokenKind::Ident {
         return Either::Right(SyntaxError {
            line: value.line,
            col: value.col,
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
      Either::Left((MetadataItem { key, value }, context3))
   }

   fn parse_executable(_context: ParseContext) -> Either<(ExecutableBlock, ParseContext), SyntaxError> {
      todo!()
   }

   fn skip_empty_lines(context: ParseContext) -> ParseContext {
      let mut context = context;
      loop {
         let (token, ctx1) = context.next_token();
         if token.kind != TokenKind::NewLine {
            return context;
         }
         context = ctx1;
      }
   }
}
