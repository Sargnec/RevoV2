import React from 'react'
import { Animated } from 'react-native'
import { Searchbar } from 'react-native-paper'
import I18n from '../lang/_i18n';
import { useSelector, useDispatch } from 'react-redux';
import { translate } from 'i18n-js';

const AnimatedSearchBar = Animated.createAnimatedComponent(Searchbar)
const RevoSearchBar = ({ onChangeText, searchClicked }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const searchBar = React.useRef();
    const language = useSelector(state => state.settingsReducer.lang)
    const transition = React.useRef(new Animated.Value(0)).current;

    //Focus on input after it showed up
    React.useEffect(() => {
        if (searchClicked) {
            Animated.timing(transition, {
                duration: 300,
                useNativeDriver: true,
                toValue: 1
            }).start()
            searchBar.current.focus()
        } else {
            Animated.timing(transition, {
                duration: 300,
                useNativeDriver: true,
                toValue: 0
            }).start()
            searchBar.current.blur()
        }
    }, [searchClicked])

    React.useEffect(() => {
        onChangeText(searchQuery)
    }, [searchQuery])

    return (
        <AnimatedSearchBar
            style={{
                zIndex: -1,
                position: "absolute",
                right: 0,
                left: 0,
                top: 0,
                transform: [{
                    translateY: transition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 60]
                    })
                }]
            }}
            placeholder={I18n.t('search', { locale: language })}
            onChangeText={(query) => setSearchQuery(query)}
            value={searchQuery}
            ref={searchBar}
        />
    )
}

export default RevoSearchBar