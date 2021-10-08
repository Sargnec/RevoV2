import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, StatusBar, useWindowDimensions, Animated } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet';
import {
    Card,
    Title,
    Paragraph,
    FAB,
    Colors,
    Divider,
    Portal,
    Modal,
    Headline,
    Button,
    Dialog,
    Snackbar,
    Checkbox,
    TextInput
} from 'react-native-paper';
import RevoHeader from "../components/header"
import RevoSearchBar from "../components/searchBar"
import I18n from '../lang/_i18n';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
//Redux
import { useSelector, useDispatch } from 'react-redux';
import {
    addList,
    addRecord,
    updateList,
    deleteList,
} from '../redux/listActions';
import { useTheme } from '@react-navigation/native';
import { color } from 'react-native-reanimated';

const FABButton = (props) => (
    <FAB
        style={[styles.fab, { backgroundColor: props.colors.primary }]}
        big
        color={props.colors.secondary}
        icon="plus"
        onPress={() => { props.showModal(); props.setClicked() }}
    />
);

const GroupListsScreen = ({ navigation }) => {
    let checkedArray = [];
    const { colors } = useTheme();
    const theme = useTheme();
    const sheetRef = React.useRef(null);
    const language = useSelector(state => state.settingsReducer.lang)
    const sendedVoice = useSelector((state) => state.voiceSenderReducer.voiceFiles);
    const groupList = useSelector((state) => state.listRedux.groupLists);
    const dispatch = useDispatch();
    const addListDispatcher = (result) => dispatch(addList(result));
    const addRecordDispatcher = (result) => dispatch(addRecord(result));
    const changeNameDispatcher = (result) => dispatch(updateList(result));
    const deleteListDispatcher = (result) => dispatch(deleteList(result));
    const [lists, setLists] = React.useState([]);
    const [text, setText] = React.useState('');
    const [searchClicked, setSearchClicked] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [sendedVoices, setSendedVoices] = React.useState([]);
    const [checkedVoices, setCheckedVoices] = React.useState(checkedArray)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [clicked, setClicked] = React.useState(false);
    const [snackbarVisible, setSnackbarVisible] = React.useState(false);
    const transition = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        let newData = []
        if (groupList !== undefined) {
            newData = [...groupList]
        }
        setLists(newData)
    }, [groupList])

    React.useEffect(() => {
        if (sendedVoice == null || sendedVoice == [] || sendedVoice == undefined) {
            setSendedVoices([])
        } else {
            let newArray = []
            sendedVoice.map(item => newArray = [...newArray, item])
            setSendedVoices(newArray)
        }
        sendedVoices.map((item, index) => checkedArray.push(false))

    }, [sendedVoice]);

    React.useEffect(() => {
        let newArray = []
        if (groupList == null || groupList == [] || groupList == undefined) {
            newArray = []
        } else {
            //lists.map(item => newArray = [...newArray, item])
            newArray = [...groupList]
        }
        let newData = newArray.filter((list, lIndex) => list.listName.toLowerCase().includes(searchQuery.toLowerCase()))
        setLists(newData)
    }, [searchQuery])

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

    const showDialog = (index) => {
        setDialogVisible(true);
        setCurrentIndex(index);
    };

    const onAddList = () => {
        var d = new Date();
        let date =
            d.getFullYear().toString().slice(-2) +
            d.getMonth().toString() +
            d.getDate().toString() +
            d.getHours().toString() +
            d.getMinutes().toString() +
            d.getSeconds().toString() +
            d.getMilliseconds().toString();
        if (clicked) {
            let emptyData = lists == undefined ? [] : lists
            let newList = [...emptyData, { listName: text, records: [], id: date }];
            setVisible(false);
            addListDispatcher(newList);
            setSnackbarVisible(true);
        } else {
            let newData = [...lists];
            newData[currentIndex].listName = text;
            changeNameDispatcher(newData);
            setVisible(false);
            setText('');
            setClicked(false);
        }
    };
    const onDeleteList = () => {
        deleteListDispatcher(currentIndex);
        setDialogVisible(false);
    };
    const onChangeName = () => {
        setClicked(false);
        setText(lists[currentIndex].listName);
        setDialogVisible(false);
        setVisible(true);
    };
    const emptyScreenDesign = () => {
        return (
            <View style={styles.emptyScreenView}>
                <Icon name="list" color={colors.primary} size={100} />
                <Text style={[styles.emptyScreenTitle, { color: colors.text }]}>{I18n.t('emptyGLSTitle', { locale: language })}</Text>
                <Text style={[styles.emptyScreenText, { color: colors.text }]}>{I18n.t('emptyGLSSubitle', { locale: language })}</Text>
            </View>
        );
    };

    const addRecordsToLists = (data) => {
        let newArray = [...lists];
        data.map((item, index) => {
            if (item && !newArray[currentIndex].records.includes(sendedVoices[index])) {
                newArray[currentIndex].records.push(sendedVoices[index])
            }
        })
        addRecordDispatcher(newArray)
        sheetRef.current.snapTo(3);
        setCheckedVoices(checkedArray)
    }
    const renderContent = () => {
        return (
            <View style={[styles.bottomSheet, { backgroundColor: colors.sheetBG }]}>
                <FlatList
                    data={sendedVoices}
                    renderItem={({ item, index }) => (
                        <View style={[styles.recordCard, { backgroundColor: colors.sheetBg }]}>
                            <Text style={{ fontSize: 16, color: colors.text }}>{item.name}</Text>
                            <Checkbox
                                color={colors.primary}
                                status={checkedVoices[index] ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    let newArray = [...checkedVoices];
                                    newArray[index] = !newArray[index]
                                    setCheckedVoices(newArray);
                                }}
                            />
                        </View>
                    )}
                    ItemSeparatorComponent={() => <Divider />}
                    keyExtractor={(item, index) => item.id}
                    contentContainerStyle={sendedVoices.length ? {} : { flex: 1 }}
                />

                <Button
                    style={[styles.createButton, { marginHorizontal: 20, marginVertical: 10 }]}
                    icon="plus"
                    mode="contained"
                    color={colors.primary}
                    onPress={() => addRecordsToLists(checkedVoices)}>
                    {I18n.t('addRecordsButton', { locale: language })}
                </Button>
            </View>
        );
    };
    const renderHeader = () => {
        return (
            <View style={[styles.bottomSheetHeader, { backgroundColor: colors.sheetBG }]}>
                <Text style={[styles.bottomSheetHeaderText, { color: colors.text }]}>{I18n.t('records', { locale: language })}</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar backgroundColor={colors.background} barStyle={theme.dark ? "light-content" : "dark-content"} />
            <RevoHeader title={I18n.t('lists', { locale: language })} searchBarToggler={() => setSearchClicked(!searchClicked)} listScreen={false} />
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
                    data={lists}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={emptyScreenDesign}
                    contentContainerStyle={
                        lists !== undefined
                            ? lists.length
                                ? styles.list
                                : { flex: 1 }
                            : { flex: 1 }
                    }
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item, index }) => (
                        <Pressable onPress={() => navigation.navigate('ListScreen', { title: item.listName, listIndex: index })} style={[styles.card, { borderColor: colors.primary }]}>
                            <Card.Content>
                                <Title style={{ color: colors.text }}>{item.listName}</Title>
                                <Paragraph style={{ color: colors.text }}>
                                    {I18n.t('records', { locale: language })}: {item.records.length}
                                </Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Icon
                                    onPress={() => showDialog(index)}
                                    name="bars"
                                    size={20}
                                    color={colors.text}
                                    style={{ padding: 10 }}
                                />
                            </Card.Actions>
                        </Pressable>
                    )}
                />
            </Animated.View>
            <FABButton showModal={() => setVisible(true)} setClicked={() => setClicked(true)} colors={colors} />
            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                    style={{ borderRadius: 10 }}>
                    <Pressable
                        style={styles.centeredRow}
                        onPress={() => {
                            setDialogVisible(false);
                            sheetRef.current.snapTo(0);
                        }}>
                        <Paragraph style={[styles.options, { color: colors.text }]}>{I18n.t('addRecords', { locale: language })}</Paragraph>
                        <Icon
                            name="plus"
                            size={14}
                            color={colors.text}
                            style={{ marginHorizontal: 10 }}
                        />
                    </Pressable>
                    <Divider />
                    <Pressable style={styles.centeredRow} onPress={() => onChangeName()}>
                        <Paragraph style={[styles.options, { color: colors.text }]}>{I18n.t('changeName', { locale: language })}</Paragraph>
                        <Icon
                            name="pencil-alt"
                            size={14}
                            color={colors.text}
                            style={{ marginHorizontal: 10 }}
                        />
                    </Pressable>
                    <Divider />
                    <Pressable style={styles.centeredRow} onPress={() => onDeleteList()}>
                        <Paragraph style={[styles.options, { color: colors.alert }]}>
                            {I18n.t('delete', { locale: language })}
                        </Paragraph>
                        <Icon
                            name="trash"
                            size={14}
                            color={colors.alert}
                            style={{ marginHorizontal: 10 }}
                        />
                    </Pressable>
                </Dialog>

                <Modal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    onRequestClose={() => {
                        setVisible(false)
                    }}
                    contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.sheetBG }]}>
                    <Headline>{clicked ? I18n.t('create', { locale: language }) : I18n.t('change', { locale: language })}</Headline>
                    <TextInput
                        style={styles.nameInput}
                        mode="outlined"
                        label={I18n.t('addListName', { locale: language })}
                        labelStyle={{ color: colors.text }}
                        defaultValue={text}
                        dense
                        onChangeText={setText}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <Button
                            style={styles.createButton}
                            mode="outlined"
                            color={colors.primary}
                            onPress={() => setVisible(false)}>
                            {I18n.t('cancel', { locale: language })}
                        </Button>
                        <Button
                            style={styles.createButton}
                            disabled={text == "" ? true : false}
                            mode="outlined"
                            color={colors.primary}
                            onPress={() => onAddList(text)}>
                            {clicked ? I18n.t('create', { locale: language }) : I18n.t('change', { locale: language })}
                        </Button>
                    </View>
                </Modal>
                <BottomSheet
                    ref={sheetRef}
                    snapPoints={['90%', '60', '30%', 0]}
                    initialSnap={3}
                    enabledContentTapInteraction={false}//Need this for onPress to work in BottomSheet
                    renderContent={renderContent}
                    renderHeader={renderHeader}
                />
            </Portal>
            <Snackbar
                duration={visible ? 5000 : 1000}
                visible={snackbarVisible}
                style={{ backgroundColor: colors.info }}
                onDismiss={() => setSnackbarVisible(false)}>
                {I18n.t('GLSAlert', { locale: language })}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerStyle: {
        position: "absolute",
        right: 0,
        left: 0,
        top: 50,
        margin: 10,
        paddingTop: 18,
        borderRadius: 8,
        justifyContent: "space-between",
        paddingHorizontal: 12,
    },
    bottomSheetHeader: {
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderTopEndRadius: 30,
        borderTopStartRadius: 30
    },
    bottomSheetHeaderText: {
        fontSize: 18,
        fontWeight: '700',
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
    card: {
        margin: 10,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 6,
        borderWidth: 1,
    },
    listHeader: {
        fontSize: 18,
        fontWeight: '400',
        marginStart: 10,
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
    },
    createButton: {
        marginVertical: 8,
        marginStart: 8
    },
    options: {
        textTransform: 'uppercase',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centeredRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    emptyScreenView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyScreenTitle: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    emptyScreenText: {
        fontSize: 16,
        textAlign: 'center',
    },
    nameInput: {
        marginBottom: 28,
    },
});
export default GroupListsScreen;
