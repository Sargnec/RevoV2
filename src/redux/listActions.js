/*
 * action types
 */
export const ADD_LIST = 'ADD_LIST'
export const ADD_RECORD = 'ADD_RECORD'
export const UPDATE_LIST = 'UPDATE_LIST'
export const DELETE_LIST = 'DELETE_LIST'

/*
 * action creators
 */
export function addList(data) {
  return {
    type: ADD_LIST,
    data
  }
}
export function addRecord(data) {
  return {
    type: ADD_RECORD,
    data
  }
}
export function updateList(data) {
  return {
    type: UPDATE_LIST,
    data
  }
}
export function deleteList(index) {
  return {
    type: DELETE_LIST,
    index
  }
}
