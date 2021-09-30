/*
 * action types
 */
export const SEND_VOICE = 'SEND_VOICE'
export const DELETE_VOICE = 'DELETE_VOICE'
export const CHANGE_NAME = 'CHANGE_NAME'

/*
 * action creators
 */
export function sendVoice(track) {
  return {
    type: SEND_VOICE,
    track
  }
}
export function deleteVoice(index) {
  return {
    type: DELETE_VOICE,
    index
  }
}
export function changeName(data) {
  return {
    type: CHANGE_NAME,
    data
  }
}
