import { combineReducers } from 'redux'
import listRedux from "./listReducers";
import voiceSenderReducer from "./sendvoice";
import settingsReducer from "./settings";

export default combineReducers({
    listRedux,
    voiceSenderReducer,
    settingsReducer
})