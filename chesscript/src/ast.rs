use serde::{Serialize, Deserialize};

include!("ast_inc.rs");

impl Token {
   pub fn new(kind: TokenKind, line: u32, col: u32) -> Self {
      Self {
         kind,
         value: None,
         line: line as i32,
         col: col as i32
      }
   }

   pub fn with_value(kind: TokenKind, value: impl ToString, line: u32, col: u32) -> Self {
      Self {
         kind,
         value: Some(value.to_string()),
         line: line as i32,
         col: col as i32
      }
   }
}
