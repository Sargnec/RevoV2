import { SEND_VOICE, DELETE_VOICE, CHANGE_NAME, RECORD_COUNT } from "../redux/sendVoice"

const initialState = []

const voiceSenderReducer = (state = initialState, action) => {
    let array = state.voiceFiles === undefined ? [] : state.voiceFiles;
    switch (action.type) {
        case SEND_VOICE:
            return { ...state, voiceFiles: [...array, action.track] };
        case RECORD_COUNT:
            return { ...state, recordCount: state.voiceFiles.length ? state.voiceFiles.length : 0 };
        case DELETE_VOICE:
            let newArray = [...state.voiceFiles]
            let newData = newArray.filter((voice, vIndex) => vIndex !== action.index)
            return { ...state, voiceFiles: newData };
        case CHANGE_NAME:
            return { ...state, voiceFiles: action.data };
        default:
            return state
    }
}

export default voiceSenderReducer