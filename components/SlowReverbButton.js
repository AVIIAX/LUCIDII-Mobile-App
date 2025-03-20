import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useAudioPlayer } from '../AudioPlayer';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const SlowReverbButton = () => {
    const { isSlowed, toggleSlowedEffect } = useAudioPlayer();

    return (
        <View>
            <Pressable
                onPress={toggleSlowedEffect}
                style={[styles.button, isSlowed ? styles.buttonSlowed : styles.buttonNormal]}
            >
                <MaterialCommunityIcons 
                    name="snail" 
                    size={24} 
                    color={isSlowed ? "#121212" : "#e3e3e3"} // Icon color changes based on isSlowed
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: '100%',
        borderWidth: 1,
        padding: 10,
        margin: 10,
        width: 'fit-content',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonNormal: {
        borderColor: '#e3e3e3',
    },
    buttonSlowed: {
        backgroundColor: '#e3e3e3',
    },
});

export default SlowReverbButton;
