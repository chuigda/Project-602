#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(tag = "$kind")]
pub enum TokenKind {
    Keyword,
    Ident,
    Number,
    String,
    Symbol,
    DialogueText,
    NewLine,
    CodeBlock,
    EndOfInput,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Token {
    pub kind: TokenKind,
    pub line: i32,
    pub col: i32,
    pub value: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SyntaxTrivia {
    pub line: i32,
    pub col: i32,
    pub len: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SyntaxError {
    pub line: i32,
    pub col: i32,
    pub message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ScriptFile {
    pub file_name: String,
    pub blocks: Vec<ScriptBlock>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum ScriptBlock {
    DialogueBlock(DialogueBlock),
    ExecutableBlock(ExecutableBlock),
    MetadataItem(MetadataItem),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DialogueBlock {
    pub dialogue: Vec<Dialogue>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExecutableBlock {
    pub token: Token,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MetadataItem {
    pub key: Token,
    pub value: Token,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Dialogue {
    pub speaker: Token,
    pub emotion: Option<Token>,
    pub text: Vec<Token>,
}
