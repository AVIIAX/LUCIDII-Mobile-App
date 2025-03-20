import { StyleSheet, Text, View, Image, TouchableNativeFeedback, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Audio } from 'expo-av';
import Entypo from '@expo/vector-icons/Entypo';
import { useAudioPlayer } from '../AudioPlayer';

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
    console.log(`Fetching track for ID: ${id}`);
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
    console.error('Error fetching track data:', error);
    return null;
  }
};

const SongRow = ({ trackId, playlist }) => {
  const [track, setTrack] = useState(null);
  const { loadSong, playOrPauseSong, isPlaying, currentTrack } = useAudioPlayer();

  // Fetch track data when trackId changes
  useEffect(() => {
    setTrack(null);
    if (trackId) {
      const fetchTrack = async () => {
        const trackData = await getTrack(trackId);
        if (trackData) {
          setTrack(trackData);
        }
      };
      fetchTrack();
    } else {
      console.log("No track ID provided");
    }
  }, [trackId]);

  // onPress handler: 
  // - If this track is already active, toggle play/pause.
  // - Otherwise, load it (with an optional playlist/queue) and play.
  const handlePress = async () => {
    if (!track) return;
    if (currentTrack && currentTrack.id === track.id) {
      await playOrPauseSong();
    } else {
      const tracksQueue = playlist || [];
      await loadSong(track, tracksQueue);
    }
  };

  // Determine which icon to show:
  const isThisTrackPlaying = currentTrack && currentTrack.id === track?.id && isPlaying;

  return (
    <TouchableNativeFeedback 
      onPress={handlePress}
      background={TouchableNativeFeedback.Ripple('#313030', false)}
    >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: track?.image || 'https://atlast.fm/images/no-artwork.jpg' }}
            style={styles.cardImage}
          />
          <View style={{ marginLeft: 10 }}>
          <Text style={[styles.text, { color: isThisTrackPlaying ? 'green' : '#e3e3e3' }]}>
              {track ? track.name : 'Loading...'}
            </Text>

            <Pressable onPress={() => navigation.navigate("Profile", { userId: track.artist })}>
            <Text style={{ color: 'gray', fontSize: 15 }}>
              {track ? track.artistName : 'Loading...'}
            </Text>
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              {isThisTrackPlaying ? (
                <Entypo name="controller-paus" size={15} color="#e3e3e3" />
              ) : (
                <Entypo name="controller-play" size={15} color="#e3e3e3" />
              )}
              <Text style={{ color: 'gray', fontSize: 14, marginLeft: 5 }}>
                {track ? track.views : '00'} · {track ? formatDuration(track.duration) : '00:00'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableNativeFeedback>
  );
};

// Function to format duration (e.g., 120 seconds -> "02:00")
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  text: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e3e3e3",
    letterSpacing: 2,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    borderWidth: 0.6,
  },
});

export default SongRow;
