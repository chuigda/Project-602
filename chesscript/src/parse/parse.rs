use xjbutil::either::Either;

use crate::ast::{
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
      loop {
         context = Parser::skip_empty_lines(context);

         let (token, ctx1) = context.next_token();
         if token.kind == TokenKind::EndOfInput {
            break;
         }

         if token.kind == TokenKind::DialogueText {
            match Parser::parse_dialogue(ctx1, token) {
               Either::Left((dialogue_block, ctx2)) => {
                  ret.blocks.push(ScriptBlock::DialogueBlock(dialogue_block));
                  context = ctx2;
               },
               Either::Right(err) => {
                  return (ret, Some(err));
               }
            }
         }
         else if token.kind == TokenKind::Symbol {
            match token.value.as_ref().map(String::as_str) {
               Some("[") => {
                  match Parser::parse_metadata(ctx1) {
                     Either::Left((metadata, ctx2)) => {
                        ret.metadata.push(metadata);
                        context = ctx2;
                     },
                     Either::Right(err) => {
                        return (ret, Some(err));
                     }
                  }
               },
               Some("{") => {
                  match Parser::parse_executable(ctx1) {
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

      (ret, None)
   }

   fn parse_dialogue(context: ParseContext, init_token: Token) -> Either<(DialogueBlock, ParseContext), SyntaxError> {
      todo!()
   }

   fn parse_metadata(context: ParseContext) -> Either<(MetadataItem, ParseContext), SyntaxError> {
      todo!()
   }

   fn parse_executable(context: ParseContext) -> Either<(ExecutableBlock, ParseContext), SyntaxError> {
      todo!()
   }

   fn skip_empty_lines(context: ParseContext) -> ParseContext {
      let mut context = context;
      loop {
         let (token, ctx1) = context.next_token();
         if token.kind != TokenKind::NewLine {
            return ctx1;
         }
         context = ctx1;
      }
   }
}
