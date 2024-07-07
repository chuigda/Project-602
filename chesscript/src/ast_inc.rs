#[derive(Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum TokenKind {
    Keyword,
    Ident,
    Number,
    String,
    Symbol,
}

#[derive(Deserialize, Serialize)]
pub struct Token {
    pub kind: TokenKind,
    pub value: String,
    pub line: i32,
    pub col: i32,
}

#[derive(Deserialize, Serialize)]
pub struct SyntaxError {
    pub line: i32,
    pub col: i32,
    pub message: String,
}

#[derive(Deserialize, Serialize)]
pub struct ScriptFile {
    pub file_name: String,
    pub metadata: Vec<MetadataItem>,
    pub blocks: Vec<ScriptBlock>,
}

#[derive(Deserialize, Serialize)]
pub struct MetadataItem {
    pub key: String,
    pub value: String,
}

#[derive(Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum ScriptBlock {
    DialogueBlock(DialogueBlock),
    ExecutableBlock(ExecutableBlock),
}

#[derive(Deserialize, Serialize)]
pub struct DialogueBlock {
    pub dialogue: Vec<Dialogue>,
}

#[derive(Deserialize, Serialize)]
pub struct ExecutableBlock {
    pub stmts: Vec<Stmt>,
}

#[derive(Deserialize, Serialize)]
pub struct Dialogue {
    pub speaker: String,
    pub text: String,
    pub emotion: Option<String>,
}

#[derive(Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum Stmt {
    ExprStmt(ExprStmt),
    IfStmt(IfStmt),
    WhileStmt(WhileStmt),
}

#[derive(Deserialize, Serialize)]
pub struct ExprStmt {
    pub expr: Expr,
}

#[derive(Deserialize, Serialize)]
pub struct IfStmt {
    pub cond: Expr,
    pub them_stmt: Vec<Stmt>,
    pub else_stmt: Option<Vec<Stmt>>,
}

#[derive(Deserialize, Serialize)]
pub struct WhileStmt {
    pub cond: Expr,
    pub stmts: Vec<Stmt>,
}

#[derive(Deserialize, Serialize)]
#[serde(tag = "$kind")]
pub enum Expr {
    ExprCall(ExprCall),
    ExprLiteral(ExprLiteral),
    ExprVar(ExprVar),
    ExprAssign(ExprAssign),
    ExprBinary(ExprBinary),
}

#[derive(Deserialize, Serialize)]
pub struct ExprCall {
    pub func: Token,
    pub args: Vec<Expr>,
}

#[derive(Deserialize, Serialize)]
pub struct ExprLiteral {
    pub value: Token,
}

#[derive(Deserialize, Serialize)]
pub struct ExprVar {
    pub name: Token,
}

#[derive(Deserialize, Serialize)]
pub struct ExprAssign {
    pub name: Token,
    pub value: Box<Expr>,
}

#[derive(Deserialize, Serialize)]
pub struct ExprBinary {
    pub left: Box<Expr>,
    pub op: Token,
    pub right: Box<Expr>,
}
