import { StyleSheet, Text, View, TouchableNativeFeedback } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from "../UserContext";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const BoostButton = ({ track }) => {
  const navigation = useNavigation();
  const { userData } = useContext(UserContext);
  const [isFollowed, setIsFollowed] = useState(false);


  return (

    <LinearGradient
      // Background Linear Gradient
      colors={['rgba(255, 94, 94, 0.7)', 'rgba(93, 174, 240, 0.7)']}
      style={styles.followBtnContainer}
    >

      <TouchableNativeFeedback
        background={TouchableNativeFeedback.Ripple("#5e5e5e", true)}
        useForeground={true}
        onPress={() => {
          navigation.navigate("Boost",
            { track: track }
          );
        }}
      >
        <View style={styles.followBtn}>
          <Text style={styles.followBtnText}>BOOST</Text>
        </View>
      </TouchableNativeFeedback>
    </LinearGradient>

  );
};

export default BoostButton;

const styles = StyleSheet.create({
  followBtnContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-start",
    borderRadius: 50
  },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  followBtnText: {
    color: "#e3e3e3",
    fontSize: 15,
    fontWeight: 'bold'
  },
  unfollowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e3e3e3",
    overflow: "hidden",
  },
  unfollowBtnText: {
    color: "#e3e3e3",
    fontSize: 16,
  },
});
