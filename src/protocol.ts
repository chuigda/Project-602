export interface EvaluateRequest {
    positions: string[],
    without_king: boolean,
}

export interface EvaluateResponse {
    score: number,
}
