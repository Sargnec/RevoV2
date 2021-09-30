import React from 'react'
import { View, Text, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordPlayer = ({ item, setStarted, started, setCurrentIndex, currentIndex, }) => {
    const { colors } = useTheme();
    const [sliderValue, setSliderValue] = React.useState(0);
    const [isSeeking, setIsSeeking] = React.useState(false);
    const [currentPositionSec, setCurrentPositionSec] = React.useState(0);
    const [currentDurationSec, setCurrentDurationSec] = React.useState(0);
    const [playtime, setPlaytime] = React.useState('00:00:00');
    const [duration, setDuration] = React.useState('00:00:00');
    const transition = React.useRef(new Animated.Value(0)).current;
    const trackHeight = useWindowDimensions().height > 700 ?
        useWindowDimensions().height * 0.15 :
        useWindowDimensions().height * 0.2;

    React.useEffect(() => {
        if (!isSeeking && currentPositionSec && currentDurationSec) {
            setSliderValue(currentPositionSec / currentDurationSec);
        }
    }, [currentPositionSec, currentDurationSec]);

    React.useEffect(() => {
        if (started) {
            onStartPlay(item, currentIndex, "playingScreen");
            Animated.timing(transition, {
                duration: 300,
                useNativeDriver: true,
                toValue: 1
            }).start()
        } else {
            Animated.timing(transition, {
                duration: 300,
                useNativeDriver: true,
                toValue: 0
            }).start()
        }
    }, [started, currentIndex]);

    //this function is called when the user stops sliding the seekbar
    const slidingCompleted = async (value) => {
        setSliderValue(value);
        setIsSeeking(false);
        await audioRecorderPlayer.startPlayer(item.url)
        await audioRecorderPlayer.seekToPlayer(value * currentDurationSec)
    };

    const onStartPlay = async (item, index, fromWhere) => {
        //Removing listener if there is one already
        audioRecorderPlayer.removePlayBackListener();
        if (fromWhere == "recordPlayer") {
            setStarted(true)
            setCurrentIndex(index)
        }
        const msg = await audioRecorderPlayer.startPlayer(item.url);
        audioRecorderPlayer.addPlayBackListener((e) => {
            setCurrentPositionSec(e.currentPosition);
            setCurrentDurationSec(e.duration);
            setPlaytime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
            setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
            return;
        });
    };

    const onPausePlay = async (item) => {
        await audioRecorderPlayer.pausePlayer(item.url);
    };

    const onResumePlay = async (item) => {
        await audioRecorderPlayer.resumePlayer(item.url);
    };

    const onStopPlay = async (item) => {
        audioRecorderPlayer.stopPlayer(item.url);
        audioRecorderPlayer.removePlayBackListener();
    };

    return (

        <Animated.View style={[styles.mainTrack, {
            backgroundColor: colors.sheetBG, height: trackHeight,
            transform: [{
                translateY: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [150, 0]
                })
            }]
        }]}>
            <View style={[styles.row, { marginHorizontal: 25 }]}>
                <Text style={[styles.timeText, { color: colors.text }]} numberOfLines={1}>{item && item.name}</Text>
                <Text style={[styles.timeText, { color: colors.text }]}>{playtime + "/" + duration}</Text>
            </View>
            <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={0}
                maximumValue={1}
                value={sliderValue}
                thumbTintColor={colors.primary}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.secondaryVariant}
                onSlidingStart={() => setIsSeeking(true)}
                onSlidingComplete={slidingCompleted}
                onValueChange={(value) => setPlaytime(audioRecorderPlayer.mmssss(Math.floor(value * currentDurationSec)))}
            />
            <View style={{
                flexDirection: "row",
                justifyContent: "space-evenly"
            }}>
                <IconButton color={colors.primary} icon="play" onPress={() => onStartPlay(item, currentIndex, "recordPlayer")} ></IconButton>
                <IconButton color={colors.primary} icon="pause" onPress={() => onPausePlay(item, currentIndex)} ></IconButton>
                <IconButton color={colors.primary} icon="play-pause" onPress={() => onResumePlay(item, currentIndex)} ></IconButton>
                <IconButton color={colors.primary} icon="stop" onPress={() => onStopPlay(item)} ></IconButton>
                <IconButton color={colors.primary} icon="close" onPress={() => setStarted(false)} ></IconButton>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({

    mainTrack: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: "100%",
        borderTopEndRadius: 30,
        borderTopStartRadius: 30
    },
    timeText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5
    },
})
export default RecordPlayer