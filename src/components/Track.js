import React from "react";
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';

const Track = ({ children, item, index, playerOpener, start }) => {
    const { colors } = useTheme();

    return (
        <Pressable style={[styles.listTrack, { borderColor: colors.primary }]} onPress={() => playerOpener()}>
            <Text style={[styles.indexText, { color: colors.text }]}>{index + 1}</Text>
            <View style={[styles.listBorder, { borderColor: colors.primary }]}></View>
            <Text style={[styles.timeText, { color: colors.text, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
            <IconButton style={[styles.playButton, { borderColor: colors.primary, backgroundColor: colors.background }]} icon="play" size={30} color={colors.primary} onPress={() => start()} ></IconButton>
            {children}
        </Pressable>
    )
}
export default Track;

const styles = StyleSheet.create({
    listTrack: {
        margin: 10,
        padding: 10,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        borderRadius: 8,
        borderWidth: 1,
    },
    timeText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    indexText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    listBorder: {
        borderRightWidth: 1,
        height: "100%",
        marginHorizontal: 10,
    },
    playButton: {
        borderWidth: 3,
    },
})