use crate::ast::{DialogueBlock, MetadataItem, ScriptBlock, ScriptFile};

pub fn codegen(script: &ScriptFile) -> String {
   let mut ret = String::new();
   let mut in_script_block = false;

   for block in &script.blocks {
      match block {
         ScriptBlock::DialogueBlock(dialogue_block) => gen_dialogue_block(&dialogue_block, &mut ret),
         ScriptBlock::ExecutableBlock(executable_block) => {
            ret.push_str("   // CODE_BLOCK\n   ");
            ret.push_str(&executable_block.token.value.as_deref().unwrap().trim());
            ret.push_str("\n   // END_CODE_BLOCK\n");
         },
         ScriptBlock::MetadataItem(metadata_item) => gen_metadata_item(&metadata_item, &mut ret, &mut in_script_block),
      }
   }

   if in_script_block {
      ret.push_str("}\n");
   }

   ret
}

fn gen_dialogue_block(dialogue_block: &DialogueBlock, ret: &mut String) {
   if dialogue_block.dialogue.is_empty() {
      return;
   }

   for dialogue in &dialogue_block.dialogue {
      let mut speak_text = String::from("`");
      for (idx, text) in dialogue.text.iter().enumerate() {
         speak_text.push_str(text.value.as_ref().unwrap().trim());
         if idx != dialogue.text.len() - 1 {
            speak_text.push('\n');
         }
      }
      speak_text.push_str("`");

      let speaker = dialogue.speaker.value.as_deref().unwrap().trim();

      if speaker == "系统" {
         ret.push_str(&format!("   await cx.showPrompt('system', {})\n", speak_text));
      }
      else if speaker == "提示" {
         ret.push_str(&format!("   await cx.showPrompt('prompt', {})\n", speak_text));
      }
      else if let Some(emotion) = &dialogue.emotion {
         ret.push_str(&format!(
            "   await cx.speak('{}', {}, '{}')\n",
            dialogue.speaker.value.as_deref().unwrap().trim(),
            speak_text,
            emotion.value.as_deref().unwrap().trim()
         ));
      }
      else {
         ret.push_str(&format!(
            "   await cx.speak('{}', {})\n",
            dialogue.speaker.value.as_deref().unwrap().trim(),
            speak_text
         ));
      }
   }
}

fn gen_metadata_item(metadata_item: &MetadataItem, ret: &mut String, in_script_block: &mut bool) {
   match metadata_item.key.value.as_ref().unwrap().trim() {
      "scene" | "event" => {
         if *in_script_block {
            ret.push_str("}\n");
         }

         let scene_id = metadata_item.value
            .as_ref()
            .expect("metadata `scene` or `event` requires an argument")
            .value
            .as_ref()
            .unwrap()
            .trim()
            .split(':')
            .next()
            .unwrap();

         ret.push_str(&format!("export const Event_{} = async cx => {{\n", scene_id));
         *in_script_block = true;
      },
      "fen" => {
         let fen = metadata_item.value
            .as_ref()
            .expect("metadata `fen` requires an argument")
            .value
            .as_ref()
            .unwrap()
            .trim();
         ret.push_str(&format!("   cx.setFen('{}')\n", fen));
      },
      "variant" => {
         let variant = metadata_item.value
            .as_ref()
            .expect("metadata `variant` requires an argument")
            .value
            .as_ref()
            .unwrap()
            .trim();
         ret.push_str(&format!("   cx.setVariant('{}')\n", variant));
      },
      "charuse" => {
         let characters = metadata_item.value
            .as_ref()
            .expect("metadata `charuse` requires an argument")
            .value
            .as_ref()
            .unwrap()
            .trim()
            .split(',')
            .map(str::trim)
            .map(|c| format!("'{}'", c))
            .collect::<Vec<_>>();

         ret.push_str(&format!(
            "export const CharacterUse = [{}]",
            characters.join(", ")
         ));
      },
      "startevent" | "startscene" => {
         let scene_id = metadata_item.value
            .as_ref()
            .expect("metadata `startevent` or `startscene` requires an argument")
            .value
            .as_ref()
            .unwrap()
            .trim()
            .split(':')
            .next()
            .unwrap();

         ret.push_str(&format!("export const StartingEvent = Event_{}\n", scene_id));
      },
      "dialogue" => {
         ret.push_str(&format!("   await cx.showDialogue()\n"));
      },
      "/dialogue" => {
         ret.push_str(&format!("   await cx.hideDialogue()\n"));
      }
      _ => panic!("unknown metadata key: {}", metadata_item.key.value.as_deref().unwrap().trim()),
   }
}
