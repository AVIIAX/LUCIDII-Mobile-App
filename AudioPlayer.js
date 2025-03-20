import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null); // Now includes sound instance
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);
  const soundRef = useRef(null);
  const currentIndexRef = useRef(currentIndex);

  // Keep the ref in sync with currentIndex state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const storeCurrentTrack = async (track) => {
    try {
      await AsyncStorage.setItem("currentTrack", JSON.stringify(track));
    } catch (error) {
      console.error("Error storing current track:", error);
    }
  };

  const loadTrack = async (track) => {
    
    
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setCurrentTrack({ ...track, sound, duration: status.durationMillis || 1 });
      storeCurrentTrack({ ...track, duration: status.durationMillis || 1 });

      if (isSlowed) {
        await sound.setRateAsync(0.8, true);
      } else {
        await sound.setRateAsync(1.0, true);
      }
    } catch (error) {
      console.error("Error loading track:", error);
    }
  };

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

  const loadSong = async (initialTrack, tracksQueue = []) => {
    console.log("Loading...");
    if (!initialTrack || !initialTrack.url) return;
    setQueue([initialTrack, ...tracksQueue]);
    setCurrentIndex(0);
    await loadTrack(initialTrack);
  };

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

  // The seek function expects a value in seconds (from the slider)
  const seek = async (valueInSeconds) => {
    if (soundRef.current) {
      const millis = valueInSeconds * 1000;
      await soundRef.current.setPositionAsync(millis);
      setCurrentTrack((prev) => ({ ...prev, progress: millis }));
    }
  };

  const toggleSlowedEffect = async () => {
    if (!soundRef.current) return;

    const newSlowed = !isSlowed;
    setIsSlowed(newSlowed);
    await soundRef.current.setRateAsync(newSlowed ? 0.8 : 1.0, false);
  };

  // Skip to the next song in the queue using the latest index from the ref
  const nextSong = async () => {
    if (queue.length === 0) return;
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      console.log("Loading next track:", queue[nextIndex]);
      await loadTrack(queue[nextIndex]);
    } else {
      console.log("Reached end of queue.");
      // Optionally, loop back to the beginning:
      // setCurrentIndex(0);
      // await loadTrack(queue[0]);
    }
  };

  // Skip to the previous song in the queue using the latest index from the ref
  const prevSong = async () => {
    if (queue.length === 0) return;
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      console.log("Loading previous track:", queue[prevIndex]);
      await loadTrack(queue[prevIndex]);
    } else {
      console.log("Already at the beginning of the queue.");
    }
  };


  const toggleLike = async (trackId, userId) => {
    console.log("Toggle like", trackId, userId);
    
    if (!trackId || !userId) return;
  
    try {
      const userRef = doc(db, "user", userId);
      const trackRef = doc(db, "track", trackId);
  
      // Get user and track data
      const userDoc = await getDoc(userRef);
      const trackDoc = await getDoc(trackRef);
  
      if (userDoc.exists() && trackDoc.exists()) {
        const userLikedTracks = userDoc.data().liked || [];
        const trackLikedUsers = trackDoc.data().liked || [];
  
        const isLiked = userLikedTracks.includes(trackId);
  
        if (isLiked) {
          // Unlike: Remove track from user's liked array and user from track's liked array
          await updateDoc(userRef, { liked: arrayRemove(trackId) });
          await updateDoc(trackRef, { liked: arrayRemove(userId) });
        } else {
          // Like: Add track to user's liked array and user to track's liked array
          await updateDoc(userRef, { liked: arrayUnion(trackId) });
          await updateDoc(trackRef, { liked: arrayUnion(userId) });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  // Cleanup the sound when the component unmounts
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
        loadSong,
        playOrPauseSong,
        toggleSlowedEffect,
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

// Custom hook for consuming the audio player context
export const useAudioPlayer = () => useContext(AudioPlayerContext);
