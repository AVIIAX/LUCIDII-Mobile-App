import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Header from '../components/Header';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const BoostScreen = ({ route }) => {
    const { track } = route.params;  // Extracting the track object from route.params
    const [featuresOpen, setFeaturesOpen] = useState(false);

    const premiumFeatures = [
        'Display On Home Screen',
        'Add To Queue Automatically'
    ]

    const handleBoost = () => {
        // You can implement boosting functionality here.
        console.log("Track boosted:", track?.name);
    };

    return (
        <View style={styles.container}>
            <Header isGoBack={true} isMail={false} title={"Boost"} />
            <ScrollView contentContainerStyle={styles.main}>
                <Text style={styles.trackName}>
                    {track?.name}
                </Text>
                <Text style={styles.artistName}>
                    {track?.artistName}
                </Text>
                <LottieView
                    source={{ uri: 'https://assets-v2.lottiefiles.com/a/c59578c6-1150-11ee-9560-bf9b508ade51/a1hEgaFUT5.lottie' }}
                    autoPlay
                    loop
                    style={styles.lottie}
                />

                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Level</Text>
                    <Text style={styles.labelSub}>{track?.boost ? track.boost : '0'}</Text>

                    <Text style={styles.label}>Plays</Text>
                    <Text style={styles.labelSub}>{track?.views ? track.views : '0'}</Text>

                    <Text style={styles.label}>Likes</Text>
                    <Text style={styles.labelSub}>{track?.liked?.length ? track.liked.length : '0'}</Text>
                </View>

                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple("#2e2e2eba", false)}  // Ripple happens only inside the button now
                    useForeground={true}
                    onPress={handleBoost}  // Adding the onPress handler
                >
                    <View style={styles.boostButton}>
                        <Text style={styles.boostText}>Boost With 5</Text>
                        <MaterialCommunityIcons name="circle-multiple" size={24} color="#e3e3e3" />
                    </View>
                </TouchableNativeFeedback>

                <Text style={styles.instructionText}>Boost Track To Get More Audiance!!</Text>

                {/* Dropdown: Why PRO? */}
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => setFeaturesOpen(!featuresOpen)}>
                    <Text style={styles.dropdownHeaderText}>Why BOOSTING?</Text>
                    {featuresOpen ? (
                        <MaterialIcons name="expand-less" size={24} color="#FFF" />
                    ) : (
                        <MaterialIcons name="expand-more" size={24} color="#FFF" />
                    )}
                </TouchableOpacity>
                {featuresOpen && (
                    <View style={styles.dropdownContent}>
                        {premiumFeatures.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                )}



                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

export default BoostScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        height: '100%',
    },
    main: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackName: {
        color: '#e3e3e3',
        textAlign: 'center',
        fontSize: 40,
    },
    artistName: {
        color: '#a1a1a1',
        textAlign: 'center',
        fontSize: 15,
        marginBottom: 20,
    },
    lottie: {
        height: 200,
        width: 200,
        marginBottom: 20,
    },
    labelContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    label: {
        color: '#e3e3e3',
        fontSize: 25,
        marginBottom: 10,
        letterSpacing: 3,
    },
    labelSub: {
        color: '#6e91de',
        fontSize: 25,  // Adjusted size for better alignment
        marginBottom: 20,
    },
    boostButton: {
        backgroundColor: 'transparent',
        borderColor: '#e3e3e3',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
        flexDirection: 'row',
        gap: 10,
    },
    boostText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    instructionText: {
        color: '#e3e3e3',
        marginTop: 10
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#444',
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginTop: 20,
    },
    dropdownHeaderText: {
        color: '#FFF',
        fontSize: 16,
    },
    dropdownContent: {
        alignSelf: 'stretch',
        padding: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        paddingVertical: 5,
    },
    featureText: {
        color: '#ccc',
        fontSize: 14,
    },
});
