import * as React from 'react';
import { StatusBar } from 'react-native'
import { Appbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation, useTheme } from '@react-navigation/native';

const RevoHeader = (props) => {
    const navigation = useNavigation();
    const theme = useTheme();
    const isDarkModeOn = useSelector(state => state.settingsReducer.isDarkModeOn)

    return (
        <Appbar.Header style={{ backgroundColor: isDarkModeOn ? theme.colors.background : theme.colors.primary }}>
            <StatusBar
                animated={true}
                backgroundColor={isDarkModeOn ? theme.colors.background : theme.colors.primaryDark} />
            {props.listScreen && <Appbar.BackAction onPress={() => navigation.goBack()} />}
            <Appbar.Content title={props.title} />
            {!props.settingsScreen &&
                <Appbar.Action icon="magnify" onPress={() => props.searchBarToggler()} />
            }
        </Appbar.Header>
    );
};

export default RevoHeader;