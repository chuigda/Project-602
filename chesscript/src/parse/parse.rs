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
                  ret.blocks.push(ScriptBlock::DialogueBlock(dialogue_block));
                  dialogue_block = DialogueBlock { dialogue: Vec::new() };

                  match Parser::parse_metadata(context1) {
                     Either::Left((metadata, context2)) => {
                        ret.blocks.push(ScriptBlock::MetadataItem(metadata));
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

include!("parse_dialogue.rs");
include!("parse_metadata.rs");
include!("parse_executable.rs");

impl Parser {
   fn parse_executable(mut context: ParseContext) -> Either<(ExecutableBlock, ParseContext), SyntaxError> {
      context.variation = LexerVariation::ExecutableBlock;

      loop {
         let (token, mut context1) = context.next_token();

         if token.kind == TokenKind::Symbol {
            if token.value.as_deref() == Some("}") {
               context1.variation = LexerVariation::Dialogue;
               return Either::Left((ExecutableBlock { stmts: Vec::new() }, context1));
            }
            else if token.value.as_deref() == Some("{") {
               match Parser::parse_stmt_block(context1) {
                  Either::Left((stmt_block, context2)) => {
                     context1 = context2;
                  },
                  Either::Right(err) => {
                     return Either::Right(err);
                  }
               }
            }
         }
         else if token.kind == TokenKind::Keyword {
            match token.value.as_deref() {
               Some("if") => {
                  match Parser::parse_if(context1) {
                     Either::Left((stmt, context2)) => {
                        context = context2;
                     },
                     Either::Right(err) => {
                        return Either::Right(err);
                     }
                  }
               },
               _ => {
                  return Either::Right(SyntaxError {
                     line: token.line,
                     col: token.col,
                     message: format!("Unexpected keyword: {:?}", token)
                  });
               }
            }
         }
         else if token.kind == TokenKind::Ident {
            match Parser::parse_expr_stmt(context1, token) {
               Either::Left((stmt, context2)) => {
                  context = context2;
               },
               Either::Right(err) => {
                  return Either::Right(err);
               }
            }
         }
         else {
            return Either::Right(SyntaxError {
               line: token.line,
               col: token.col,
               message: format!("Unexpected token: {:?}", token)
            });
         }
      }
   }
}
