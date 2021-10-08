/**
 * @format
 */

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { Provider as StoreProvider } from 'react-redux'
import App from './src/App';
import { name as appName } from './app.json';

import { composeWithDevTools } from 'redux-devtools-extension';
import { createStore, applyMiddleware } from 'redux'
import { PersistGate } from 'redux-persist/integration/react';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist' // imports from redux-persist
import AsyncStorage from '@react-native-community/async-storage';
import reducer from "./src/reducers/index"

const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  blacklist: ['styles']
};

const persistedReducer = persistReducer(persistConfig, reducer) // create a persisted reducer

/* const store = createStore(
  persistedReducer, // pass the persisted reducer instead of rootReducer to createStore
) */

const middleware = [thunk];
const composedEnhancer = composeWithDevTools(applyMiddleware(...middleware))
const store = createStore(persistedReducer, composedEnhancer );
const persistor = persistStore(store);

export default function Main() {
  return (
    <StoreProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <App />
      </PersistGate>
    </StoreProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);

