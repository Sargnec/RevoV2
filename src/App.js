import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer, DarkTheme as NavDark, DefaultTheme as NavDefault } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme as PaperDefault, DarkTheme as PaperDark, Colors } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RecordingScreen from './screens/RecordingScreen';
import AudioPlayingScreen from './screens/AudioPlayingScreen';
import GroupListsScreen from './screens/GroupListsScreen';
import Settings from './screens/Settings';
import ListScreen from './screens/ListScreen';
import { LogBox } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import I18n from './lang/_i18n';
/* // Ignore log notification by message:
LogBox.ignoreLogs(['Warning: ...']);

// Ignore all log notifications:
LogBox.ignoreAllLogs(); */

const GroupListStack = createStackNavigator();

function GroupListStackScreen() {
  return (
    <GroupListStack.Navigator headerMode={false}>
      <GroupListStack.Screen name="Lists" component={GroupListsScreen} />
      <GroupListStack.Screen name="ListScreen" component={ListScreen} />
    </GroupListStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {

  const CustomDefault = {
    ...NavDefault,
    ...PaperDefault,
    myOwnProperty: true,
    colors: {
      ...NavDefault.colors,
      ...PaperDefault.colors,
      text:"#000",
      primary: "#8c9eff",
      primaryDark: "#5870cb",
      primaryLight: "#c0cfff",
      textOnPrimary:"#000000",
      background: Colors.grey200,
      secondary: "#494a4b",
      textOnSecondary:"#fff",
      secondaryVariant: "#b3b4b6",
      third: Colors.green600,
      alert: Colors.red700,
      info: Colors.blueGrey700,
      sheetBG: Colors.grey300
    }
  }

  const CustomDark = {
    ...NavDark,
    ...PaperDark,
    myOwnProperty: true,
    colors: {
      ...NavDark.colors,
      ...PaperDark.colors,
      background:"#1B1E30",
      text:"#fff",
      primary: "#8c9eff",
      primaryDark: "#5870cb",
      primaryLight: "#c0cfff",
      textOnPrimary:"#000",
      secondary: "#494a4b",
      textOnSecondary:"#fff",
      secondaryVariant: "#b3b4b6",
      third: Colors.green200,
      alert: Colors.red700,
      info: Colors.blueGrey700,
      sheetBG: Colors.grey800
    }
  }
  const isDarkModeOn = useSelector(state => state.settingsReducer.isDarkModeOn)
  const theme = isDarkModeOn ? CustomDark : CustomDefault;
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <Tab.Navigator lazy={false}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "record") {
                iconName = focused
                  ? "microphone"
                  : 'microphone-outline';
              } else if (route.name === "records") {
                iconName = focused ? 'record' : "album";
              } else if (route.name === "lists") {
                iconName = focused ? 'playlist-music' : "playlist-music-outline";
              } else if (route.name === "settings") {
                iconName = 'cogs'
              }

              // You can return any component that you like here!
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            style: { backgroundColor: theme.colors.background },
            showIcon: true,
            activeTintColor: theme.colors.primary,
            inactiveTintColor: theme.colors.secondaryVariant,
            showLabel: false
          }}>
          <Tab.Screen name="record" component={RecordingScreen} />
          <Tab.Screen name="records" component={AudioPlayingScreen} />
          <Tab.Screen name="lists" component={GroupListStackScreen} />
          <Tab.Screen name="settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
