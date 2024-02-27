use std::{error::Error, panic::catch_unwind};

use uciengine::uciengine::{GoJob, UciEngine};
use crate::protocol::EvaluateRequest;

pub async fn evaluate_position(req: EvaluateRequest) -> Result<Vec<i64>, Box<dyn Error>> {
    let engine = catch_unwind(|| UciEngine::new_with_args("stockfish/fairy-stockfish.exe", &[
        "load",
        "stockfish/variants.ini"
    ])).map_err(|_| "Cannot intialise UCI engine")?;

    let mut scores = Vec::new();
    for position in req.positions {
        let mut job = GoJob::new()
            .pos_fen(position)
            .go_opt("depth", 10);
        if req.without_king {
            job = job.uci_opt("UCI_Variant", "captureall");
        }

        let go_result = engine.go(job).await?;
        let score = match go_result.ai.score {
            uciengine::analysis::Score::Cp(centipawn) => centipawn,
            uciengine::analysis::Score::Mate(_) => 999999
        } as i64;

        scores.push(score);
    }

    Ok(scores)
}
