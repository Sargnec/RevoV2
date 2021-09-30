import { CHANGE_THEME ,CHANGE_LANG} from "../redux/settingsActions"

const initialState = []

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_THEME:
            return { ...state, isDarkModeOn: action.data };
        case CHANGE_LANG:
            return { ...state, lang: action.data };
        default:
            return state
    }
}

export default settingsReducer