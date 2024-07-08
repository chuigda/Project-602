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
    pub stmts: Vec<Stmt>,
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

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum Stmt {
    ExprStmt(ExprStmt),
    IfStmt(IfStmt),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExprStmt {
    pub expr: Expr,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct IfStmt {
    pub location: Token,
    pub cond: Expr,
    pub them_stmt: Vec<Stmt>,
    pub else_clause: Option<ElseClause>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ElseClause {
    pub location: Token,
    pub stmts: Vec<Stmt>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum Expr {
    ExprCall(ExprCall),
    ExprLiteral(ExprLiteral),
    ExprVar(ExprVar),
    ExprAssign(ExprAssign),
    ExprBinary(ExprBinary),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExprCall {
    pub func: Token,
    pub args: Vec<Expr>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExprLiteral {
    pub value: Token,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExprVar {
    pub name: Token,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExprAssign {
    pub name: Token,
    pub value: Box<Expr>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExprBinary {
    pub left: Box<Expr>,
    pub op: Token,
    pub right: Box<Expr>,
}
