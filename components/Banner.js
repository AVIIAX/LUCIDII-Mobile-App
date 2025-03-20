import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, Pressable } from "react-native";
import { useAudioPlayer } from "../AudioPlayer";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Audio } from "expo-av";
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import {  UserContext } from "../UserContext";


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
  const { uid  } = useContext(UserContext);
  const { currentTrack, isPlaying, playOrPauseSong, loadSong, toggleLike  } = useAudioPlayer();
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isThisTrackPlaying = currentTrack && currentTrack.id === track?.id && isPlaying;
  const [isLiked, setIsLiked] = useState(false);

  const trackIdToUse = (typeof trackId === 'object' && trackId.id) || trackId;

  useEffect(() => {
    setTrack(null);
    setIsLoading(false);

    if (trackIdToUse) {
      const fetchTrack = async () => {
        const trackData = await getTrack(trackIdToUse);
        if (trackData) {
          setTrack(trackData);
          setIsLiked(trackData.liked?.includes(uid)); // Update like state
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

  const handleToggleLike = async () => {
    if (!trackIdToUse || !uid) return;
    await toggleLike(trackIdToUse, uid);
    setIsLiked(!isLiked); // Optimistically update UI
  };

  if (isLoading) {
    return (
      <View style={styles.Banner}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // This function will only load the song once when needed
  const handlePress = () => {
    if (isThisTrackPlaying) {
      // If the track is playing, pause it
      playOrPauseSong();
    } else {
      // If it's not playing, either load it if it's a new track or just play/pause
      if (!currentTrack || currentTrack.id !== track.id) {
        loadSong(track);  // Load a new song when necessary
      } else {
        playOrPauseSong();  // Toggle play/pause
      }
    }
  };

  return (
    <ImageBackground
      source={{ uri: track?.image }}
      style={styles.Banner}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.BannerTextMain}>{track?.name || "Track Name"}</Text>
        <Text style={styles.BannerTextSub}>{track?.artistName || "Unknown Artist"}</Text>

        <View style={{
          flexDirection: 'row',
          gap: 20
        }}>

          <Pressable onPress={handlePress} style={styles.infoContainer}>
            {isThisTrackPlaying ? (
              <Feather name="pause" size={40} color="#e3e3e3" />
            ) : (
              <Feather name="play" size={40} color="#e3e3e3" />
            )}

          </Pressable>

          <Pressable onPress={handleToggleLike} style={styles.infoContainer}>
  {isLiked ? (
    <Entypo name="heart" size={40} color="#e3e3e3" />
  ) : (
    <Entypo name="heart-outlined" size={40} color="#e3e3e3" />
  )}
</Pressable>


          <View style={{
            justifyContent: 'center'
          }}>
          <Text style={styles.infoText}>
            {track ? track.views : '00'} · {track && track.liked ? track.liked.length : '00'}
          </Text>
          </View>

        </View>



      </View>
    </ImageBackground>
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
