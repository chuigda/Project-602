use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CommandResult<T> {
    success: bool,
    result: Option<T>
}

impl <T> CommandResult<T> {
    pub fn success(result: T) -> CommandResult<T> {
        CommandResult {
            success: true,
            result: Some(result)
        }
    }

    pub fn failure() -> CommandResult<T> {
        CommandResult {
            success: false,
            result: None
        }
    }
}

include!("protocol_inc.rs");
