import React from 'react'
import { View, Text, FlatList, StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { deleteVoice, changeName } from "../redux/sendVoice";
import { addRecord, updateList } from '../redux/listActions';
import RevoHeader from "../components/header";
import RevoSearchBar from "../components/searchBar";
import Track from "../components/Track";
import BottomSheet from 'reanimated-bottom-sheet';
import { Button, IconButton, Divider, Menu, Checkbox } from 'react-native-paper';
import Icon from "react-native-vector-icons/dist/MaterialCommunityIcons";
import ReactNativeBlobUtil from 'react-native-blob-util'
import { useTheme } from '@react-navigation/native';
import I18n from '../lang/_i18n';
import RecordPlayer from '../components/RecordPlayer';
import NameChangerModal from '../components/NameChangerModal';

const emptyScreenDesign = () => {
    const language = useSelector(state => state.settingsReducer.lang)
    const { colors } = useTheme();
    return (
        <View style={styles.emptyScreenView}>
            <Icon name="microphone" color={colors.primary} size={100} />
            <Text style={[styles.emptyScreenTitle, { color: colors.text }]}>{I18n.t('emptyAPSTitle', { locale: language })}</Text>
            <Text style={[styles.emptyScreenText, { color: colors.text }]}>{I18n.t('emptyAPSSubtitle', { locale: language })}</Text>
        </View>
    )
}
const emptyListDesign = () => {
    const language = useSelector(state => state.settingsReducer.lang)
    const { colors } = useTheme();
    return (
        <View style={styles.emptyScreenView}>
            <Text style={[styles.emptyScreenTitle, { color: colors.text }]}>{I18n.t('emptyListTitle', { locale: language })}</Text>
            <Text style={[styles.emptyScreenText, { color: colors.text }]}>{I18n.t('emptyListSubtitle', { locale: language })}</Text>
        </View>
    )
}

const AudioPlayingScreen = () => {
    const { colors } = useTheme();
    const language = useSelector(state => state.settingsReducer.lang);
    const sendedVoice = useSelector(state => state.voiceSenderReducer.voiceFiles);
    const groupList = useSelector((state) => state.listRedux.groupLists);
    const dispatch = useDispatch()
    const voiceDeleter = result => dispatch(deleteVoice(result))
    const nameChanger = result => dispatch(changeName(result))
    const addRecordDispatcher = (result) => dispatch(addRecord(result));
    const updateListDispatcher = (result) => dispatch(updateList(result));
    const [sendedVoices, setSendedVoices] = React.useState([]);
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [started, setStarted] = React.useState(false);
    const [searchClicked, setSearchClicked] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [checkedList, setCheckedList] = React.useState([])
    const listsSheetRef = React.useRef(null);
    const [lists, setLists] = React.useState([]);
    const transition = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (sendedVoice == null || sendedVoice == [] || sendedVoice == undefined) {
            setSendedVoices([])
        } else {
            let newArray = [];
            sendedVoice.map(item => newArray = [...newArray, item])
            setSendedVoices(newArray)
        }
    }, [sendedVoice])

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

    /* SEARCH FUNCTION*/
    React.useEffect(() => {
        let newArray = []
        if (sendedVoice == null || sendedVoice == [] || sendedVoice == undefined) {
            newArray = []
        } else {
            newArray = [...sendedVoice]
        }
        let newData = newArray.filter((voice, vIndex) => voice.name.toLowerCase().includes(searchQuery.toLowerCase()))
        setSendedVoices(newData)
    }, [searchQuery])

    /* group lists */
    React.useEffect(() => {
        let checkedArray = []
        let newData = []
        if (groupList == undefined) {
            newData = []
        } else {
            newData = [...groupList]
            groupList.forEach(item => checkedArray.push(false))
        }
        setLists(newData)
        setCheckedList(checkedArray)
    }, [groupList])

    const handleChangeName = (value) => {
        let newArray = [...sendedVoices]
        newArray[currentIndex].name = value;
        setModalVisible(false)
        nameChanger(newArray)
        setSendedVoices(newArray)
    }
    const onDelete = (index) => {
        setMenuVisible(false)
        let newArray = [...sendedVoices]
        // create a path you want to delete
        var path = newArray[index].url;
        console.log("path", path);
        /* Deleting from device folder */
        ReactNativeBlobUtil.fs.unlink(path)
            .then(() => {
                voiceDeleter(index);
            })
            .catch((err) => { console.log(err.message); })
        /* Check if this deleted record is in also groups and delete it */
        let newData = [...groupList]
        newData.map((item, listIndex) => {
            if (item.records.map(record => record.id).find(id => id == newArray[index].id)) {
                let deletedID = item.records.map(record => record.id).find(id => id == newArray[index].id)
                let copyOfGroupList = newData[listIndex].records.filter((voice, vIndex) => voice.id !== deletedID)
                newData[listIndex].records = copyOfGroupList;
            }
        })
        updateListDispatcher(newData)
        /* Deleting from records tab */
        let copyOfSendedVoices = newArray.filter((voice, vIndex) => vIndex !== index)
        setSendedVoices(copyOfSendedVoices)
    }

    const openMenu = (index) => { setMenuVisible(true); setCurrentIndex(index) };
    const playerOpener = (index) => { setStarted(true); setCurrentIndex(index) };
    const addTracksToLists = (data) => {
        let newArray = [...groupList];
        data.map((item, index) => {
            if (item && !newArray[index].records.includes(sendedVoices[currentIndex])) {
                newArray[index].records.push(sendedVoices[currentIndex])
            }
        })
        addRecordDispatcher(newArray)
        listsSheetRef.current.snapTo(2);
        setCheckedList([])
    }
    const changeNameOption = (index) => {
        setModalVisible(true);
        setCurrentIndex(index);
        setMenuVisible(false)
    }
    const addToGroupOption = (index) => {
        listsSheetRef.current.snapTo(0);
        setCurrentIndex(index);
        setMenuVisible(false);
    }
    const renderListHeader = () => {
        return (
            <View style={[styles.listHeader, { backgroundColor: colors.sheetBG }]}>
                <Text style={[styles.listHeaderText, { color: colors.text }]}>{I18n.t('lists', { locale: language })}</Text>
            </View>
        )
    }
    const renderListContent = () => {
        return (
            <View style={[styles.bottomSheet, { backgroundColor: colors.sheetBG }]}>
                <FlatList
                    data={lists}
                    renderItem={({ item, index }) => (
                        <View style={styles.recordCard}>
                            <Text style={[styles.listName, { color: colors.text }]}>{item.listName}</Text>
                            <Checkbox
                                color={colors.text}
                                status={checkedList[index] ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    let newArray = [...checkedList];
                                    newArray[index] = !newArray[index]
                                    setCheckedList(newArray);
                                }}
                            />
                        </View>
                    )}
                    ListEmptyComponent={emptyListDesign}
                    ItemSeparatorComponent={() => <Divider />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={lists.length ? {} : { flex: 1 }}
                />
                {lists.length > 0 &&
                    <Button
                        style={styles.createButton}
                        icon="plus"
                        mode="contained"
                        color={colors.primary}
                        onPress={() => addTracksToLists(checkedList)}>
                        {I18n.t('listButton', { locale: language })}
                    </Button>
                }
            </View>
        );
    };
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <RevoHeader title={I18n.t('records', { locale: language })} searchBarToggler={() => setSearchClicked(!searchClicked)} listScreen={false} />
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
                    data={sendedVoices}
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
                                <Menu.Item onPress={() => addToGroupOption(index)} title={I18n.t('addToGroup', { locale: language })} />
                                <Menu.Item onPress={() => onDelete(index)} title={I18n.t('delete', { locale: language })} />
                            </Menu>
                        </Track>
                    }
                    keyExtractor={(item, index) => item.id}
                    contentContainerStyle={sendedVoices.length ? {} : { flex: 1 }}
                    ListEmptyComponent={emptyScreenDesign}
                />
            </Animated.View>
            <NameChangerModal
                name={sendedVoices[currentIndex]?.name}
                modalVisible={modalVisible}
                setModalVisible={() => setModalVisible(false)}
                handleChangeName={(value) => handleChangeName(value)}
            />
            <RecordPlayer
                item={sendedVoices[currentIndex]}
                setStarted={(value) => setStarted(value)}
                started={started}
                setCurrentIndex={(value) => setCurrentIndex(value)}
                currentIndex={currentIndex}
            />
            <BottomSheet
                ref={listsSheetRef}
                snapPoints={['60', '30%', 0]}
                initialSnap={2}
                enabledContentTapInteraction={false}//Need this for onPress to work in BottomSheet
                enabledInnerScrolling={true}
                enabledContentGestureInteraction={false}
                renderContent={renderListContent}
                renderHeader={renderListHeader}
            />
        </View>
    )
}

const styles = StyleSheet.create({

    mainTrack: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: "100%",
        borderTopEndRadius: 30,
        borderTopStartRadius: 30
    },
    listTrack: {
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
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
        marginHorizontal: 10
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5
    },
    playButton: {
        borderWidth: 3,
    },
    mainPlayButton: {
        flex: 1,
    },
    stopButton: {
        marginHorizontal: 10,
        flex: 1,
    },
    resumeButton: {
        flex: 1,
    },
    emptyScreenView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyScreenTitle: {
        fontSize: 24,
        textAlign: "center",
        fontWeight: "bold"
    },
    emptyScreenText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 15
    },
    createButton: {
        marginVertical: 20,
        marginHorizontal: 20,
        marginVertical: 10
    },
    listHeader: {
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderTopEndRadius: 30,
        borderTopStartRadius: 30
    },
    listHeaderText: {
        fontSize: 24,
        fontWeight: "bold"
    },
    bottomSheet: {
        height: '100%'
    },
    recordCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        margin: 10,
        padding: 10,
    },
    listName: {
        marginHorizontal: 20,
        marginVertical: 10
    },
    containerStyle: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        margin: 10,
        paddingTop: 18,
        borderRadius: 8,
        justifyContent: "space-between",
        paddingHorizontal: 12,
    },
    nameInput: {
        marginBottom: 28,
    }
})

export default AudioPlayingScreen
