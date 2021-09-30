/*
 * action types
 */
export const CHANGE_THEME = 'CHANGE_THEME'
export const CHANGE_LANG = 'CHANGE_LANG'

/*
 * action creators
 */
export function changeTheme(data) {
  return {
    type: CHANGE_THEME,
    data
  }
}
export function changeLang(data) {
  return {
    type: CHANGE_LANG,
    data
  }
}
