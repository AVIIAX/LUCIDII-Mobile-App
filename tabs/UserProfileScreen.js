import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  TouchableNativeFeedback,
  Pressable,
  FlatList,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { UserContext } from "../UserContext";
import Header from "../components/Header";
import { doc, onSnapshot, getDoc } from "firebase/firestore"; // <-- Added getDoc here
import HomeCard from "../components/HomeCard";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FollowButton from "../components/FollowButton";

const fetchTracks = async (trackIds) => {
  try {
    const trackPromises = trackIds.map(async (trackId) => {
      // Fetch the track document
      const trackDoc = await getDoc(doc(db, "track", trackId));
      if (trackDoc.exists()) {
        const trackData = trackDoc.data();
        // Use the 'artist' field (user id) from the track data to fetch the user's document
        const userDoc = await getDoc(doc(db, "user", trackData.artist));
        let artistName = "Unknown Artist";
        if (userDoc.exists()) {
          // Assuming the user's name is stored in the 'name' field
          artistName = userDoc.data().name || artistName;
        }
        // Return the track data with the artistName appended
        return { id: trackId, ...trackData, artistName };
      } else {
        return null;
      }
    });

    const tracks = (await Promise.all(trackPromises)).filter(
      (track) => track !== null
    );
    return tracks;
  } catch (error) {
    console.error("Error fetching tracks:", error);
  }
};


const ProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const { userData: appUserData } = useContext(UserContext);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [myTracks, setMyTracks] = useState(null);
  const [myLikedTracks, setMyLikedTracks] = useState(null);

  // Set up a realtime listener for the user data
  useEffect(() => {
    if (userId) {
      const userDocRef = doc(db, "user", userId);
      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = { uid: userId, ...docSnap.data() };
            console.log("Fetched User Data:", data);
            setUserProfileData(data);
          } else {
            console.log("User not found!");
          }
        },
        (error) => {
          console.error("Error fetching user profile:", error);
        }
      );
      return () => unsubscribe();
    }
  }, [userId]);

  // Fetch track details when userProfileData updates and contains track IDs.
  useEffect(() => {
    if (userProfileData?.tracks && userProfileData.tracks.length > 0) {
      fetchTracks(userProfileData.tracks).then((tracks) => {
        setMyTracks(tracks);
      });

      fetchTracks(userProfileData.liked).then((tracks) => {
        setMyLikedTracks(tracks);
      });

    } else {
      setMyTracks([]); // Handle case when no tracks are available
      setMyLikedTracks([])
    }
  }, [userProfileData]);

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      Alert.alert("Error", error.message);
    });
  };

  // Refresh control to reinitialize listener if needed
  const onRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (!userProfileData) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  // Truncated bio text (show full bio if pressed)
  const bioText = showFullBio
    ? userProfileData.about
    : userProfileData.about?.slice(0, 100) + "...";

  return (
    <View style={styles.screenContainer}>
      <Header isGoBack={false} title={"Profile"} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.banner}>
          {userProfileData?.avatar && (
            <Image
              source={{ uri: userProfileData.avatar }}
              style={styles.bannerImage}
            />
          )}
        </View>

        <View style={styles.avatarContainer}>
          {userProfileData?.avatar && (
            <Image
              source={{ uri: userProfileData.avatar }}
              style={styles.avatar}
            />
          )}
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {userProfileData?.name || "No Name"}
          </Text>
          <SimpleLineIcons name="music-tone" size={15} color="#e3e3e3" />
        </View>

        <Text style={styles.location}>
          {userProfileData?.location || "No Location"}
        </Text>
        <Text style={styles.genre}>
          {userProfileData?.genre || "No Genre"}
        </Text>

        {/* Follow/Unfollow Buttons */}
        <View style={styles.followBtnContainer}>
          <FollowButton />
        </View>
        {/* Followers and Following Count */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {userProfileData?.followers?.length || 0} Follower(s)
          </Text>
          <Text style={styles.statsText}>
            {userProfileData?.following?.length || 0} Following
          </Text>
        </View>

        {/* BIO */}
        <Pressable
          onPress={() => !showFullBio ? setShowFullBio(true) : setShowFullBio(false)}
          style={styles.aboutContainer}
        >
          <Text style={styles.aboutText}>{bioText}</Text>
          {!showFullBio && userProfileData?.about?.length > 100 && (
            <TouchableOpacity onPress={() => !showFullBio ? setShowFullBio(true) : setShowFullBio(false)}>
              <Text style={styles.moreText}>More</Text>
            </TouchableOpacity>
          )}
        </Pressable>

        <Text style={
          [styles.name, {
            marginTop: 40,
            textAlign: 'left',
            width: '100%',
            paddingLeft: 20
          }]
        } >{userProfileData.name}'s Tracks</Text>
        <FlatList
          horizontal
          contentContainerStyle={styles.cardContainer}
          data={myTracks}
          keyExtractor={(item) => item?.id || item}
          renderItem={({ item }) => (
            <HomeCard trackId={item.id} playList={myTracks} />
          )}
        />

        <Text style={
          [styles.name, {
            marginTop: 40,
            textAlign: 'left',
            width: '100%',
            paddingLeft: 20,
          }]
        } >{userProfileData.name}'s Liked Tracks</Text>
        <FlatList
          horizontal
          contentContainerStyle={styles.cardContainer}
          data={myLikedTracks}
          keyExtractor={(item) => item?.id || item}
          renderItem={({ item }) => (
            <HomeCard trackId={item.id} playList={myLikedTracks} />
          )}
        />


        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#111111",
  },
  container: {
    alignItems: "center",
    paddingBottom: 200,
  },
  banner: {
    width: "100%",
    height: 120,
    backgroundColor: "gray",
    marginBottom: 40,
    borderColor: "#e3e3e3",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  avatarContainer: {
    position: "absolute",
    top: 70,
    width: "100%",
    paddingLeft: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 0.8,
    borderColor: "#e3e3e3",
  },
  nameContainer: {
    marginTop: 50,
    width: "100%",
    paddingLeft: 20,
    flexDirection: 'row',
    gap: 5
  },
  name: {
    color: "#e3e3e3",
    fontSize: 18,
    fontWeight: "bold",
  },
  location: {
    color: "#d1d1d1",
    fontSize: 15,
    marginTop: 5,
    width: "100%",
    paddingLeft: 20,
  },
  genre: {
    color: "#969696",
    fontSize: 12,
    marginTop: 5,
    width: "100%",
    paddingLeft: 20,
  },
  followBtnContainer: {
    marginTop: 15,
    width: "100%",
    paddingLeft: 20,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
    width: "100%",
    paddingLeft: 20,
  },
  statsText: {
    color: "#e3e3e3",
    fontSize: 16,
  },
  aboutContainer: {
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 10,
    justifyContent: "center",
    paddingLeft: 20,
  },
  aboutText: {
    color: "#e3e3e3",
    textAlign: "left",
  },
  moreText: {
    color: "#4CAF50",
    marginTop: 5,
    fontSize: 14,
  },
  label: {
    color: "#e3e3e3",
    fontSize: 16,
    marginTop: 20,
    paddingLeft: 20,
    alignSelf: "flex-start",
  },
  cardContainer: {
    paddingLeft: 20,
    marginVertical: 10,
  },
  button: {
    width: "50%",
    height: 50,
    backgroundColor: "#3d3d3d",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
