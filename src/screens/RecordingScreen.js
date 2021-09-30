import React from 'react'
import { View, Text, StyleSheet, PermissionsAndroid, Animated } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Button, Colors, Title } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux'
import { sendVoice } from "../redux/sendVoice";
import { useTheme } from '@react-navigation/native';
import I18n from '../lang/_i18n';
import { InterstitialAd, AdEventType, TestIds } from '@react-native-firebase/admob';
import ADMOB_ID from '../../admobId';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : ADMOB_ID;
const audioRecorderPlayer = new AudioRecorderPlayer();

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['fashion', 'clothing'],
});

const RecordingScreen = () => {
    const { colors } = useTheme();
    const [recordingState, setRecordingState] = React.useState("notRecording");
    const [recordSec, setRecordSec] = React.useState(0);
    const [recordTime, setRecordTime] = React.useState("00:00:00");
    const dispatch = useDispatch();
    const voiceDispatcher = result => dispatch(sendVoice(result));
    const language = useSelector(state => state.settingsReducer.lang);
    const recordCount = useSelector(state => state.voiceSenderReducer.recordCount);
    const stateOpacity = React.useRef(new Animated.Value(1)).current;
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        const eventListener = interstitial.onAdEvent(type => {
            if (type === AdEventType.LOADED) {
                setLoaded(true);
            }
        });

        // Start loading the interstitial straight away
        interstitial.load();

        // Unsubscribe from events on unmount
        return () => {
            eventListener();
        };
    }, []);

    React.useEffect(() => {
        if (recordingState == "recording" || recordingState == "paused") {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(stateOpacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true
                    }),
                    Animated.timing(stateOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true
                    })
                ])
            ).start()
        }
    }, [recordingState])
    const onStartRecord = async () => {
        var d = new Date();
        let date = d.getFullYear().toString().slice(-2) + d.getMonth().toString() + d.getDate().toString() + d.getHours().toString() + d.getMinutes().toString() + d.getSeconds().toString() + d.getMilliseconds().toString();
        const result = await audioRecorderPlayer.startRecorder(`sdcard/${date}.mp4`);
        audioRecorderPlayer.addRecordBackListener((e) => {
            setRecordSec(e.currentPosition)
            setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)))
            return;
        });
        setRecordingState("recording")
    }

    const onStopRecord = async () => {
        if (recordingState == "recording") {
            var d = new Date();
            let date = d.getFullYear().toString().slice(-2) + d.getMonth().toString() + d.getDate().toString() + d.getHours().toString() + d.getMinutes().toString() + d.getSeconds().toString() + d.getMilliseconds().toString();
            try {
                const result = await audioRecorderPlayer.stopRecorder();
                let track = { url: result, name: date, id: date, duration: recordSec, artist: "User" }
                setRecordingState("notRecording")
                voiceDispatcher(track);
                //Show interstitial ad every 3 recording
                if ((recordCount % 3) == 0) {
                    interstitial.show();
                }
                audioRecorderPlayer.removeRecordBackListener();
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    const checkPermission = () => {
        check(PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
            .then((result) => {
                switch (result) {
                    case RESULTS.DENIED:
                        requestPermissions()
                        break;
                    case RESULTS.GRANTED:
                        onStartRecord()
                        break;
                    case RESULTS.BLOCKED:
                        Alert.alert(
                            "Error",
                            "Permissions blocked",
                            [
                                {
                                    text: 'The permission is denied and not requestable anymore',
                                    onPress: () => console.log("Cancel Pressed"),
                                    style: "cancel"
                                }
                            ],
                            { cancelable: false }
                        );
                        break;
                }
            })
            .catch((error) => {
                console.log({ error });
            });
    }
    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);

                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.RECORD_AUDIO'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Permissions granted');
                } else {
                    console.log('All required permissions not granted');
                    return;
                }
            } catch (err) {
                console.warn(err);
                return;
            }
        }
    }

    const onPauseRecord = async () => {
        try {
            setRecordingState("paused")
            await audioRecorderPlayer.pauseRecorder();
        } catch (err) {
            console.log('pauseRecord', err);
        }
    };

    const onResumeRecord = async () => {
        setRecordingState("recording")
        await audioRecorderPlayer.resumeRecorder();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.main}>
                <Text style={[styles.recordTime, { color: colors.text }]}>{recordTime}</Text>
                <Animated.Text style={{ fontSize: 24, color: colors.text, opacity: stateOpacity }}>{
                    recordingState == "recording" ?
                        "Recording"
                        :
                        recordingState == "paused" ?
                            "Paused"
                            :
                            ""
                }</Animated.Text>
            </View>
            <View style={styles.row}>
                {
                    recordingState == "notRecording" ?
                        <Button icon="record" mode="contained" la style={[styles.button, { backgroundColor: colors.primary }]} labelStyle={{ color: colors.textOnPrimary }} onPress={() => checkPermission()}>
                            {I18n.t('record', { locale: language })}
                        </Button>
                        :
                        <Button icon="stop" mode="contained" la style={[styles.button, { backgroundColor: colors.secondary }]} labelStyle={{ color: colors.textOnSecondary }} onPress={() => onStopRecord()}>
                            {I18n.t('stop', { locale: language })}
                        </Button>
                }
                {
                    recordingState == "paused" ?
                        <Button icon="play-pause" mode="contained" la style={[styles.button, { backgroundColor: colors.primaryLight }]} labelStyle={{ color: colors.textOnPrimary }} onPress={() => onResumeRecord()}>
                            {I18n.t('resume', { locale: language })}
                        </Button>
                        :
                        <Button icon="play-pause" mode="contained" disabled={recordingState == "notRecording" ? true : false} la style={[styles.button, { backgroundColor: colors.secondary }]} labelStyle={{ color: colors.textOnSecondary }} onPress={() => onPauseRecord()}>
                            {I18n.t('pause', { locale: language })}
                        </Button>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    main: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    recordTime: {
        fontSize: 80,
    },
    row: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    button: {
        flex: 1,
        marginHorizontal: 20
    },
})
export default RecordingScreen
