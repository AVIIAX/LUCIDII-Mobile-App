import { StyleSheet, Text, View, TouchableNativeFeedback } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from "../UserContext";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const FollowButton = ({ target }) => {
  const { userData } = useContext(UserContext);
  const [isFollowed, setIsFollowed] = useState(false);

  // Check if the target user is in the current user's following array
  useEffect(() => {
    if (userData && userData.following) {
      setIsFollowed(userData.following.includes(target));
    }
  }, [userData, target]);

  // Function to follow the target user
  const followUser = async () => {
    try {
      const currentUserRef = doc(db, "user", auth.currentUser.uid);
      const targetUserRef = doc(db, "user", target);
      await updateDoc(currentUserRef, {
        following: arrayUnion(target)
      });
      await updateDoc(targetUserRef, {
        followers: arrayUnion(auth.currentUser.uid)
      });
      setIsFollowed(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Function to unfollow the target user
  const unfollowUser = async () => {
    try {
      const currentUserRef = doc(db, "user", auth.currentUser.uid);
      const targetUserRef = doc(db, "user", target);
      await updateDoc(currentUserRef, {
        following: arrayRemove(target)
      });
      await updateDoc(targetUserRef, {
        followers: arrayRemove(auth.currentUser.uid)
      });
      setIsFollowed(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <View style={styles.followBtnContainer}>
      {isFollowed ? (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple("#5e5e5e", true)}
          useForeground={true}
          onPress={unfollowUser}
        >
          <View style={styles.unfollowBtn}>
            <Text style={styles.unfollowBtnText}>Following</Text>
          </View>
        </TouchableNativeFeedback>
      ) : (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple("#5e5e5e", true)}
          useForeground={true}
          onPress={followUser}
        >
          <View style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </View>
        </TouchableNativeFeedback>
      )}
    </View>
  );
};

export default FollowButton;

const styles = StyleSheet.create({
  followBtnContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-start",
  },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3e3e3",
    overflow: "hidden",
  },
  followBtnText: {
    color: "#121212",
    fontSize: 16,
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
