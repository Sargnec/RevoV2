import React from 'react'
import { View, Text, FlatList, StyleSheet, Alert, useWindowDimensions, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '@react-navigation/native';
import { deleteVoice, changeName } from "../redux/sendVoice";
import RevoHeader from "../components/header";
import RevoSearchBar from "../components/searchBar";
import Track from "../components/Track";
import { IconButton, Divider, Menu } from 'react-native-paper';
import Icon from "react-native-vector-icons/dist/MaterialCommunityIcons";
import { changeListName } from '../redux/listActions';
import I18n from '../lang/_i18n'
import * as RNFS from 'react-native-fs';
import RecordPlayer from '../components/RecordPlayer';
import NameChangerModal from '../components/NameChangerModal';


const emptyScreenDesign = () => {
    const language = useSelector(state => state.settingsReducer.lang)
    const { colors } = useTheme();
    return (
        <View style={styles.emptyScreenView}>
            <Icon name="microphone" color={colors.primary} size={100} />
            <Text style={[styles.emptyScreenTitle, { color: colors.text }]}>{I18n.t('emptyAPSTitle', { locale: language })}</Text>
            <Text style={[styles.emptyScreenText, { color: colors.text }]}>{I18n.t('emptyLSSubtitle', { locale: language })}</Text>
        </View>
    )
}

const ListScreen = ({ route, navigation }) => {
    const { title, listIndex } = route.params;
    const language = useSelector(state => state.settingsReducer.lang)
    const { colors } = useTheme();
    const groupList = useSelector((state) => state.listRedux.groupLists);
    const sendedVoice = useSelector(state => state.voiceSenderReducer.voiceFiles)
    const dispatch = useDispatch()
    const voiceDeleter = result => dispatch(deleteVoice(result))
    const nameChanger = result => dispatch(changeName(result))
    const changeNameDispatcher = (result) => dispatch(changeListName(result));
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [currentName, setCurrentName] = React.useState(null)
    const [started, setStarted] = React.useState(false);
    const [listRecords, setListRecords] = React.useState([]);
    const [searchClicked, setSearchClicked] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('');
    const transition = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        let newData = [...groupList[listIndex].records]
        console.log("newData",newData);
        setListRecords(newData)
        console.log("newdata listrecord",listRecords);
    }, [groupList[listIndex].records])
    React.useEffect(() => {
        console.log("listrecords neden boş",listRecords);
    }, [])
    React.useEffect(() => {
        let newArray = [...groupList[listIndex].records]
        let newData = newArray.filter((voice, vIndex) => voice.name.toLowerCase().includes(searchQuery.toLowerCase()))
        setListRecords(newData)
    }, [searchQuery])

    //Flatlist animation to go down when searchbar appears
    React.useEffect(() => {
        if (searchClicked) {
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
    }, [searchClicked])

    const openMenu = (index) => { console.log(index);setMenuVisible(true); setCurrentIndex(index) };
    const playerOpener = (index) => { setStarted(true); setCurrentIndex(index) };

    const handleChangeName = (value) => {
        const newSendedVoices = [...sendedVoice]
        let newListRecords = [...groupList]
        let index = newSendedVoices.findIndex((item, index) => item.id == listRecords[currentIndex].id)
        newListRecords[listIndex].records[currentIndex].name = value;
        newSendedVoices[index].name = value;
        setModalVisible(false);
        changeNameDispatcher(newListRecords);
        nameChanger(newSendedVoices)
    }
    const handleDelete = (index) => {
        Alert.alert(
            "",
            I18n.t("delete", { locale: language }),
            [
                {
                    text: I18n.t("fromList", { locale: language }),
                    onPress: () => deleteFromList(index)
                },
                {
                    text: I18n.t('completely', { locale: language }),
                    onPress: () => onDelete(index)
                }
            ],
            { cancelable: true }
        )
    }
    const onDelete = (index) => {
        let tracks = [...sendedVoice]
        let newData = [...groupList];
        let deleted = newData[listIndex].records
        let deletedIndex = tracks.findIndex(record => record.id == deleted[index].id);
        deleted.splice(index, 1)
        changeNameDispatcher(newData);
        setListRecords(deleted)
        if (deletedIndex !== -1) {
            var path = tracks[deletedIndex].url;
            RNFS.unlink(path)
                .then(() => {
                    voiceDeleter(deletedIndex)
                })
                // `unlink` will throw an error, if the item to unlink does not exist
                .catch((err) => {
                    console.log(err.message);
                });
        }
    }
    const changeNameOption = (index) => {
        setModalVisible(true);
        setCurrentIndex(index);
        setMenuVisible(false);
        setCurrentName(listRecords[currentIndex].name)
    }

    const deleteFromList = (index) => {
        let newData = [...groupList];
        newData[listIndex].records.splice(index, 1)
        changeNameDispatcher(newData);
        setListRecords(newData[listIndex].records)
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <RevoHeader title={title} searchBarToggler={() => setSearchClicked(!searchClicked)} listScreen={true} navigation={navigation} />
            <RevoSearchBar
                onChangeText={(query) => setSearchQuery(query)}
                searchClicked={searchClicked} />
            <Animated.View style={{
                flex: 1,
                marginBottom: searchClicked ? 50 : 0,
                transform: [{
                    translateY: transition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 50]
                    })
                }]
            }}>
                <FlatList
                    data={listRecords}
                    renderItem={({ item, index }) =>
                        <Track
                            item={item}
                            index={index}
                            playerOpener={() => playerOpener(index)}
                            start={() => playerOpener(index)} >
                            <Menu
                                visible={menuVisible && (currentIndex == index)}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={<IconButton icon="dots-vertical" onPress={() => openMenu(index)}></IconButton>}>
                                <Menu.Item onPress={() => changeNameOption(index)} title={I18n.t('changeName', { locale: language })} />
                                <Menu.Item onPress={() => handleDelete(index)} title={I18n.t("delete", { locale: language })} />
                            </Menu>
                        </Track>
                    }
                    ItemSeparatorComponent={() => <Divider style={{ color: colors.text }} />}
                    keyExtractor={(item, index) => item.id}
                    contentContainerStyle={listRecords.length ? {} : { flex: 1 }}
                    ListEmptyComponent={emptyScreenDesign}
                />
            </Animated.View>
            <NameChangerModal
                name={currentName}
                modalVisible={modalVisible}
                setModalVisible={() => setModalVisible(false)}
                handleChangeName={(value) => handleChangeName(value)}
            />
            <RecordPlayer
                item={listRecords[currentIndex]}
                setStarted={(value) => setStarted(value)}
                started={started}
                setCurrentIndex={(value) => setCurrentIndex(value)}
                currentIndex={currentIndex}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    emptyScreenView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    emptyScreenTitle: {
        fontSize: 24,
        textAlign: "center",
        fontWeight: "bold"
    },
    emptyScreenText: {
        fontSize: 16,
        textAlign: "center",
    },
})

export default ListScreen
