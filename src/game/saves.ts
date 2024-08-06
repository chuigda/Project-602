const SAVES_NAME = 'project-602'

export function getSaveName(name: string = ''): string {
    if (name) {
        return `${SAVES_NAME}_${name}`
    }
    return SAVES_NAME
}

export function saveGameData(data: string, name: string = '') {
    localStorage.setItem(getSaveName(name), data)
}

export function hasSaveData(name: string = ''): boolean {
    return localStorage.getItem(getSaveName(name)) !== null
}

export function loadGameSaveData(name: string = ''): string | null {
    return localStorage.getItem(getSaveName(name))
}
