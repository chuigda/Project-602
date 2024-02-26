#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct EvaluateRequest {
    pub positions: Vec<String>,
    pub without_king: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct EvaluateResponse {
    pub scores: Vec<i64>,
}
