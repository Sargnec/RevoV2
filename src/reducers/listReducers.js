import { ADD_LIST,ADD_RECORD, UPDATE_LIST, DELETE_LIST } from "../redux/listActions.js"

const initialState = []

const listRedux = (state = initialState, action) => {
    switch (action.type) {
        case ADD_LIST:
            return { ...state, groupLists: action.data };
        case ADD_RECORD:
            return { ...state, groupLists: action.data };
        case UPDATE_LIST:
            return { ...state, groupLists: action.data };
        case DELETE_LIST:
            let arrayC = [...state.groupLists]
            let newDataC = arrayC.filter((list, lIndex) => lIndex !== action.index)
            return { ...state, groupLists: newDataC };
        default:
            return state
    }
}

export default listRedux