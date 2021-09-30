import { createStore, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist' // imports from redux-persist
import AsyncStorage from '@react-native-community/async-storage';
import { createLogger } from 'redux-logger';
import reducer from "../src/reducers/index"

const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  blacklist: ['styles']
};

const persistedReducer = persistReducer(persistConfig, reducer) // create a persisted reducer

const store = createStore(
  persistedReducer, // pass the persisted reducer instead of rootReducer to createStore
)

const persistor = persistStore(store); // used to create the persisted store, persistor will be used in the next step

export { store, persistor }