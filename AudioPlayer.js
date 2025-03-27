// AudioPlayer.js
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null); // includes sound instance
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);
  const [isReverb, setIsReverb] = useState(false);
  const soundRef = useRef(null);
  const currentIndexRef = useRef(currentIndex);

  // Keep currentIndex ref in sync
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Store the current track in AsyncStorage (optional)
  const storeCurrentTrack = async (track) => {
    try {
      await AsyncStorage.setItem("currentTrack", JSON.stringify(track));
    } catch (error) {
      console.error("Error storing current track:", error);
    }
  };

  // Load a track (local or remote)
  const loadTrack = async (track) => {
    try {
      // Unload the previous sound if it exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
      // Determine the URI: local tracks use "uri", remote tracks use "url"
      const uri = track.isLocal ? track.uri : track.url;
      if (!uri) {
        console.error("No URI available for track:", track);
        return;
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      // Save the track with its sound instance and duration info
      const updatedTrack = { ...track, sound, duration: status.durationMillis || 1 };
      setCurrentTrack(updatedTrack);
      storeCurrentTrack(updatedTrack);

      // Calculate the playback rate based on slowed and reverb states
      let newRate = 1.0;
      if (isSlowed && isReverb) {
        newRate = 0.6; // Example value when both slowed and reverb
      } else if (isReverb) {
        newRate = 0.9; // Example value for reverb only
      } else if (isSlowed) {
        newRate = 0.8; // Example value for slowed only
      }
      await sound.setRateAsync(newRate, true);
    } catch (error) {
      console.error("Error loading track:", error);
    }
  };

  // Playback status update handler
  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      nextSong();
    } else if (status.isLoaded) {
      setCurrentTrack((prev) => ({
        ...prev,
        progress: status.positionMillis,
        duration: status.durationMillis,
      }));
    }
  };

  // loadSong accepts an initial track and a full playlist (queue)
  const loadSong = async (initialTrack, tracksQueue = []) => {
    console.log("Loading track...", initialTrack);
    if (!initialTrack || (!(initialTrack.url || initialTrack.uri))) return;
    // Use the full playlist from local files or remote tracks
    setQueue([initialTrack, ...tracksQueue]);
    setCurrentIndex(0);
    await loadTrack(initialTrack);
  };

  // Play or pause the current track
  const playOrPauseSong = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  // Seek to a new position (valueInSeconds comes from the slider)
  const seek = async (valueInSeconds) => {
    if (soundRef.current) {
      const millis = valueInSeconds * 1000;
      await soundRef.current.setPositionAsync(millis);
      setCurrentTrack((prev) => ({ ...prev, progress: millis }));
    }
  };

  // Toggle the slowed playback effect
  const toggleSlowedEffect = async () => {
    if (!soundRef.current) return;
    const newSlowed = !isSlowed;
    setIsSlowed(newSlowed);
    // Recalculate playback rate considering reverb as well
    let newRate = 1.0;
    if (newSlowed && isReverb) {
      newRate = 0.6;
    } else if (isReverb) {
      newRate = 0.9;
    } else if (newSlowed) {
      newRate = 0.8;
    }
    await soundRef.current.setRateAsync(newRate, false);
  };

  // Toggle the reverb effect (simulation)
  const toggleReverbEffect = async () => {
    if (!soundRef.current) return;
    const newReverb = !isReverb;
    setIsReverb(newReverb);
    // Recalculate playback rate considering slowed as well
    let newRate = 1.0;
    if (isSlowed && newReverb) {
      newRate = 0.6;
    } else if (newReverb) {
      newRate = 0.9;
    } else if (isSlowed) {
      newRate = 0.8;
    }
    await soundRef.current.setRateAsync(newRate, false);
  };

  // Skip to the next song in the queue
  const nextSong = async () => {
    if (queue.length === 0) return;
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      console.log("Loading next track:", queue[nextIndex]);
      await loadTrack(queue[nextIndex]);
    } else {
      console.log("Reached end of queue.");
      // Do nothing when there is no next track.
    }
  };

  // Skip to the previous song in the queue
  const prevSong = async () => {
    if (queue.length === 0) return;
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      console.log("Loading previous track:", queue[prevIndex]);
      await loadTrack(queue[prevIndex]);
    } else {
      console.log("Already at beginning of queue.");
      // Do nothing if already at the first track.
    }
  };

  // Toggle the like status for a track (for Firebase-fetched tracks)
  const toggleLike = async (trackId, userId) => {
    console.log("Toggle like", trackId, userId);
    if (!trackId || !userId) return;
    try {
      const userRef = doc(db, "user", userId);
      const trackRef = doc(db, "track", trackId);
      const userDoc = await getDoc(userRef);
      const trackDoc = await getDoc(trackRef);
      if (userDoc.exists() && trackDoc.exists()) {
        const userLikedTracks = userDoc.data().liked || [];
        const isLiked = userLikedTracks.includes(trackId);
        if (isLiked) {
          await updateDoc(userRef, { liked: arrayRemove(trackId) });
          await updateDoc(trackRef, { liked: arrayRemove(userId) });
        } else {
          await updateDoc(userRef, { liked: arrayUnion(trackId) });
          await updateDoc(trackRef, { liked: arrayUnion(userId) });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Cleanup the sound instance on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        queue,
        currentIndex,
        currentTrack,
        isPlaying,
        isSlowed,
        isReverb,
        loadSong,
        playOrPauseSong,
        toggleSlowedEffect,
        toggleReverbEffect,
        nextSong,
        prevSong,
        seek,
        toggleLike,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Custom hook to use the audio player context
export const useAudioPlayer = () => useContext(AudioPlayerContext);

export default AudioPlayerProvider;
