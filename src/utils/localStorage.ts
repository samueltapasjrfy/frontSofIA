export enum LocalStorageKeys {
  USER = 'user',
  VERSION = 'version',
}

export const setLocalStorage = (key: LocalStorageKeys, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getLocalStorage = <T = any>(key: LocalStorageKeys): T => {
  return JSON.parse(localStorage.getItem(key) || '{}')
}