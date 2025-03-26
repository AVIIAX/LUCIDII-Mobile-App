import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, Pressable, Animated } from "react-native";
import { useAudioPlayer } from "../AudioPlayer";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { Audio } from "expo-av";
import AntDesign from '@expo/vector-icons/AntDesign';
import { UserContext } from "../UserContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import { ToastAndroid } from 'react-native';

// Function to fetch track duration using expo-av
const getTrackDuration = async (url) => {
  let sound;
  try {
    const { sound: createdSound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: false }
    );
    sound = createdSound;
    const status = await sound.getStatusAsync();
    // Unload the sound once we have the duration
    await sound.unloadAsync();
    return status.durationMillis ? status.durationMillis / 1000 : 0;
  } catch (error) {
    console.error("Error fetching audio duration:", error);
    return 0;
  }
};

// Function to fetch track data from Firestore
const getTrack = async (id) => {
  try {
    if (!id) {
      console.log("Invalid track ID");
      return null;
    }
    const trackRef = doc(db, 'track', id);
    const trackDoc = await getDoc(trackRef);

    if (trackDoc.exists()) {
      const trackData = trackDoc.data();

      // Fetch artist/user data
      const userRef = doc(db, 'user', trackData.artist);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        trackData.artistName = userData.name;
      }

      // Get track URL and duration
      const trackUrl = trackData.url;
      if (trackUrl) {
        const duration = await getTrackDuration(trackUrl);
        trackData.duration = duration;
      }

      return trackData;
    } else {
      console.log(`Track not found for ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching track data:", error);
    return null;
  }
};

const Banner = ({ trackId }) => {
  const { uid } = useContext(UserContext);
  const { currentTrack, isPlaying, playOrPauseSong, loadSong, toggleLike } = useAudioPlayer();
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const scale = useRef(new Animated.Value(1)).current; // To animate the heart icon

  const isThisTrackPlaying = currentTrack && currentTrack.id === track?.id && isPlaying;

  const trackIdToUse = (typeof trackId === 'object' && trackId.id) || trackId;

  const [lastTap, setLastTap] = useState(0);  // Time of last tap

  useEffect(() => {
    setTrack(null);
    setIsLoading(true);

    if (trackIdToUse) {
      const fetchTrack = async () => {
        const trackData = await getTrack(trackIdToUse);
        if (trackData) {
          setTrack(trackData);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      };
      fetchTrack();
    } else {
      setIsLoading(false);
    }
  }, [trackIdToUse, uid]);

  useEffect(() => {
    // Firestore listener to update isLiked in real-time
    if (track && track.id) {
      const trackRef = doc(db, 'track', track.id);

      const unsubscribe = onSnapshot(trackRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedTrackData = docSnap.data();
          setIsLiked(updatedTrackData.liked?.includes(uid)); // Listen for changes to "liked" field
        }
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    }
  }, [track, uid]);

  const handleToggleLike = async () => {
    if (!trackIdToUse || !uid) return;
    
    // Trigger scale animation on like press
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.2, // Enlarge the heart
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1, // Shrink back to original size
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();

    await toggleLike(trackIdToUse, uid);

    // Show toast message after the like action
    await ToastAndroid.show('You liked this track!', ToastAndroid.SHORT);
  };

  const handleDoubleTapLike = () => {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastTap;

    if (timeDifference < 300) { // Double-tap threshold (300ms)
      if (isLiked) return;  // Prevent toggling if already liked
      handleToggleLike();  // Toggle the like state
    }

    setLastTap(currentTime);  // Update the last tap time
  };

  if (isLoading) {
    return (
      <View style={styles.Banner}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handlePress = () => {
    if (isThisTrackPlaying) {
      playOrPauseSong(); // Pause the song if it's playing
    } else {
      if (!currentTrack || currentTrack.id !== track.id) {
        loadSong(track); // Load new song if it's not the current one
      } else {
        playOrPauseSong(); // Toggle play/pause
      }
    }
  };

  return (
    <Pressable onPress={handleDoubleTapLike}> 
      <ImageBackground 
        source={{ uri: track?.image }}
        style={styles.Banner}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.BannerTextMain}>{track?.name || "Track Name"}</Text>
          <Text style={styles.BannerTextSub}>{track?.artistName || "Unknown Artist"}</Text>

          <View style={{ flexDirection: 'row', gap: 20 }}>
            <Pressable onPress={handlePress} style={styles.infoContainer}>
              {isThisTrackPlaying ? (
                <Ionicons name="pause-outline" size={40} color="#e3e3e3" />
              ) : (
                <Ionicons name="play-outline" size={40} color="#e3e3e3" />
              )}
            </Pressable>

            {/* Animated Heart Icon */}
            <Pressable onPress={handleToggleLike} style={styles.infoContainer}>
              <Animated.View style={{ transform: [{ scale }] }}>
                {isLiked ? (
                  <AntDesign name="heart" size={30} color="#e3e3e3" />
                ) : (
                  <AntDesign name="hearto" size={30} color="#e3e3e3" />
                )}
              </Animated.View>
            </Pressable>

            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.infoText}>
                {track ? track.views : '00'} · {track && track.liked ? track.liked.length : '00'}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  Banner: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  BannerTextMain: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e3e3e3",
    textAlign: "center",
    marginBottom: 5,
  },
  BannerTextSub: {
    fontSize: 14,
    color: "#dedede",
    textAlign: "center",
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#adadad',
    fontSize: 20,
    marginLeft: 5,
  },
});

export default Banner;
