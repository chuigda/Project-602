export interface Token {
    kind: 'keyword' | 'ident' | 'string' | 'number' | 'symbol' | 'comment',
    value: string,
    line: number,
    col: number,
}

export interface SyntaxError {
    line: number,
    col: number,
    message: string,
}

export interface ScriptFile {
    fileName: string,
    sceneMetadata: Metadata,
    blocks: ScriptBlock[],
}

export interface Metadata {
    sceneName: string,
    startFen: string,
    rest: MetadataItem[],
}

export interface MetadataItem {
    key: string,
    value: string,
}

export type ScriptBlock = 
    | DialogueBlock
    | ExecutableBlock

export interface ScriptBlockBase<K extends string> {
    $k: K;
}

export interface DialogueBlock extends ScriptBlockBase<"DialogueBlock"> {
    dialogue: Dialogue[],
}

export interface ExecutableBlock extends ScriptBlockBase<"ExecutableBlock"> {
    stmts: Stmt[],
}

export interface Dialogue {
    speaker: string,
    text: string,
    emotion?: string,
}

export type Stmt = 
    | ExprStmt
    | IfStmt
    | WhileStmt

export interface StmtBase<K extends string> {
    $k: K;
}

export interface ExprStmt extends StmtBase<"ExprStmt"> {
    expr: Expr,
}

export interface IfStmt extends StmtBase<"IfStmt"> {
    cond: Expr,
    thenStmt: Stmt[],
    elseStmt?: Stmt[],
}

export interface WhileStmt extends StmtBase<"WhileStmt"> {
    cond: Expr,
    stmts: Stmt[],
}

export type Expr = 
    | ExprCall
    | ExprLiteral
    | ExprVar
    | ExprAssign
    | ExprBinary

export interface ExprBase<K extends string> {
    $k: K;
}

export interface ExprCall extends ExprBase<"ExprCall"> {
    fn: Token,
    args: Expr[],
}

export interface ExprLiteral extends ExprBase<"ExprLiteral"> {
    value: Token,
}

export interface ExprVar extends ExprBase<"ExprVar"> {
    name: Token,
}

export interface ExprAssign extends ExprBase<"ExprAssign"> {
    name: Token,
    value: Expr,
}

export interface ExprBinary extends ExprBase<"ExprBinary"> {
    left: Expr,
    op: Token,
    right: Expr,
}
