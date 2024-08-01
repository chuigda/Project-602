import * as Blockly from 'blockly/core'

const storageKey = 'mainWorkspace'

export function save(workspace) {
   const data = Blockly.serialization.workspaces.save(workspace)
   window.localStorage?.setItem(storageKey, JSON.stringify(data))
}

export function load(workspace) {
   const data = window.localStorage?.getItem(storageKey)
   if (!data) return

   Blockly.Events.disable()
   Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false)
   Blockly.Events.enable()
}
