import { dbgError } from "../components/debugconsole"

const SAVES_NAME = 'project-602'

export type SaveData<T> = {
    timestamp: number
    name: string
    data: T
}

export type LocalStorageSaveData<T> = {
    lastUpdated: number
    saves: SaveData<T>[]
}

function getLocalStorageSaveData<T>(localStorageName: string = ''): LocalStorageSaveData<T> | null {
    const savedData = localStorage.getItem(assembleLocalStorageName(localStorageName))
    if (savedData) {
        return JSON.parse(savedData)
    }
    return null
}

function saveFullToLocalStorage<T>(saves: SaveData<T>[], localStorageName: string = '') {
    while (true) {
        try {
            localStorage.setItem(assembleLocalStorageName(localStorageName), JSON.stringify({
                lastUpdated: Date.now(),
                saves
            }))
            break
        } catch (e) {
            dbgError(`Error saving to local storage: ${e}`)
            if (saves.length > 0) {
                saves.shift();
            } else {
                break
            }
        }
    }
}

function saveNewToLocalStorage<T>(name: string, data: T, localStorageName: string = '') {
    let saves = getLocalStorageSaveData<T>(localStorageName)?.saves
    if (saves) {
        saves.push({
            timestamp: Date.now(),
            name,
            data,
        })
    } else {
        saves = [{
            timestamp: Date.now(),
            name,
            data,
        }]
    }

    saveFullToLocalStorage(saves, localStorageName)
}

export function assembleLocalStorageName(localStorageName: string = ''): string {
    if (localStorageName) {
        return `${SAVES_NAME}_${localStorageName}`
    }
    return SAVES_NAME
}

export function saveNewGameData<T>(name: string, data: T, localStorageName: string = '') {
    saveNewToLocalStorage(name, data, localStorageName)
}

export function saveFullGameData<T>(saves: SaveData<T>[], localStorageName: string = '') {
    saveFullToLocalStorage(saves, localStorageName)
}

export function hasSaveData(localStorageName: string = ''): boolean {
    return loadAllGameSaveData(localStorageName).length > 0
}

export function loadAllGameSaveData<T>(localStorageName: string = ''): SaveData<T>[] {
    const save = getLocalStorageSaveData<T>(localStorageName)
    return save?.saves ?? []
}
