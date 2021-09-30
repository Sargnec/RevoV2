/*
 * action types
 */
export const ADD_LIST = 'ADD_LIST'
export const ADD_RECORD = 'ADD_RECORD'
export const CHANGE_LIST_NAME = 'CHANGE_LIST_NAME'
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
export function changeListName(data) {
  return {
    type: CHANGE_LIST_NAME,
    data
  }
}
export function deleteList(index) {
  return {
    type: DELETE_LIST,
    index
  }
}
