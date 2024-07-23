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
         else if token.kind == TokenKind::CodeBlock {
            ret.blocks.push(ScriptBlock::DialogueBlock(dialogue_block));
            dialogue_block = DialogueBlock { dialogue: Vec::new() };

            ret.blocks.push(ScriptBlock::ExecutableBlock(ExecutableBlock { token }));
            context = context1;
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
