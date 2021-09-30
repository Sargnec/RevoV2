import React from 'react'
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { changeTheme, changeLang } from "../redux/settingsActions";
import { Switch, RadioButton, Portal, Dialog } from "react-native-paper"
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import I18n from '../lang/_i18n'
import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';
import ADMOB_ID from '../../admobId';
import RevoHeader from '../components/header';

const adUnitId = __DEV__ ? TestIds.BANNER : ADMOB_ID;
const Settings = () => {
    const theme = useTheme();
    const isDarkModeOn = useSelector(state => state.settingsReducer.isDarkModeOn)
    const language = useSelector(state => state.settingsReducer.lang)
    const dispatch = useDispatch()
    const themeChanger = result => dispatch(changeTheme(result))
    const langChanger = result => dispatch(changeLang(result))
    const [value, setValue] = React.useState(language);
    const [visible, setVisible] = React.useState(false);

    const changeLanguage = (value) => {
        setValue(value);
        langChanger(value)
    }
    const privacyPolicy = async () => {
        const url = "https://revo-record-and-gr.flycricket.io/privacy.html";
        // Checking if the link is supported for links with custom URL scheme.
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            // Opening the link with some app, if the URL scheme is "http" the web link should be opened
            // by some browser in the mobile
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    };
    //https://revo-record-and-gr.flycricket.io/privacy.html
    return (
        <View style={styles.container}>
            <RevoHeader title={I18n.t('settings', { locale: language })} settingsScreen={true} />
            <View style={styles.mainContent}>

                <View style={[styles.settingsButton, { borderColor: theme.colors.primary }]}>
                    <Text style={[styles.settingsText,{color: theme.colors.text}]}>{I18n.t('darkMode', { locale: language })}</Text>
                    <Switch color={theme.colors.primary} value={theme.dark} onValueChange={() => themeChanger(isDarkModeOn ? false : true)} />
                </View>
                <Pressable onPress={() => setVisible(true)} style={[styles.settingsButton, { borderColor: theme.colors.primary }]}>
                    <Text style={[styles.settingsText,{color: theme.colors.text}]}>{I18n.t('changeLanguage', { locale: language })}</Text>
                </Pressable>
                <Pressable onPress={privacyPolicy} style={[styles.settingsButton, { borderColor: theme.colors.primary }]}>
                    <Text style={[styles.settingsText,{color: theme.colors.text}]}>{I18n.t('privacyPolicy', { locale: language })}</Text>
                </Pressable>
                <Portal>
                    <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                        <RadioButton.Group onValueChange={value => changeLanguage(value)} value={value}>
                            <RadioButton.Item color={theme.colors.primary} label={I18n.t('english', { locale: language })} value="en" />
                            <RadioButton.Item color={theme.colors.primary} label={I18n.t('turkish', { locale: language })} value="tr" />
                            <RadioButton.Item color={theme.colors.primary} label={I18n.t('spanish', { locale: language })} value="es" />
                        </RadioButton.Group>
                    </Dialog>
                </Portal>

            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
                <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                />
                <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        paddingTop: 50,
        justifyContent: "flex-start"
    },
    settingsButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 10,
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
    },
    settingsText: {
        fontSize: 20
    }
})
export default Settings;
