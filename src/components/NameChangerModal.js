import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Portal, Modal, Headline, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import I18n from '../lang/_i18n';

const NameChangerModal = ({ name, modalVisible, setModalVisible, handleChangeName }) => {
    const language = useSelector(state => state.settingsReducer.lang);
    const { colors } = useTheme();
    const [changedName, setName] = React.useState();

    React.useEffect(() => {
        setName(name);
    }, [name])

    return (
        <Portal>
            <Modal
                transparent={true}
                visible={modalVisible}
                onDismiss={setModalVisible}
                onRequestClose={setModalVisible}
                contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.sheetBG }]}>
                <Headline>{I18n.t('changeTrackName', { locale: language })}</Headline>
                <TextInput
                    style={styles.nameInput}
                    mode="outlined"
                    labelStyle={{ color: colors.text }}
                    onChangeText={setName}
                    defaultValue={changedName}
                    dense
                    underlineColor={colors.primary}
                />
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <Button
                        style={styles.modalButton}
                        mode="outlined"
                        color={colors.primary}
                        onPress={setModalVisible}>
                        {I18n.t('cancel', { locale: language })}
                    </Button>
                    <Button
                        style={styles.modalButton}
                        mode="outlined"
                        color={colors.primary}
                        onPress={() => handleChangeName(changedName)}>
                        {I18n.t('save', { locale: language })}
                    </Button>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
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
    nameInput: {
        marginBottom: 28,
    },
    modalButton: {
        marginVertical: 8,
        marginStart: 8
    },
})
export default NameChangerModal