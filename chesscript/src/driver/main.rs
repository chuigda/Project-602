use std::{fs::read_to_string, path::Path};

use chesscript::parse::{ParseContext, Parser};

fn main() {
   let args = std::env::args().collect::<Vec<_>>();
   if args.len() != 2 {
      eprintln!("Usage: {} <input file>", Path::new(&args[0]).file_name().unwrap().to_string_lossy());
      std::process::exit(1);
   }

   let file_name = &args[1];
   let Ok(content) = read_to_string(file_name) else {
      eprintln!("Error reading file: {}", file_name);
      std::process::exit(1);
   };

   let chars = content.chars().collect::<Vec<_>>();
   let context = ParseContext::new(&chars);
   let (script, err) = Parser::parse(file_name, context);

   if let Some(err) = err {
      eprintln!("Syntax error: {}:{}:{}: {}", file_name, err.line, err.col, err.message);
      std::process::exit(1);
   }

   println!("{}", serde_json::to_string_pretty(&script).unwrap());
}
