/**
 * @format
 */

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { Provider as StoreProvider } from 'react-redux'
import App from './src/App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';

//redux-persist
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';



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

TrackPlayer.registerPlaybackService(() => require('./service'));
