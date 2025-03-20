import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, Animated, StyleSheet, Image, Dimensions,
  Pressable
} from "react-native";
import { useAudioPlayer } from "../AudioPlayer";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import Slider from "@react-native-community/slider";
import SlowReverbButton from "../components/SlowReverbButton"
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

const MusicPlayer = () => {
  const navigation = useNavigation();
  const { currentTrack, isPlaying, playOrPauseSong, seek, nextSong, prevSong } = useAudioPlayer();
  const [isExtended, setIsExtended] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [containerHeight] = useState(new Animated.Value(70));

  useEffect(() => {
    let interval;
    if (currentTrack?.sound) {
      const updateProgress = async () => {
        const status = await currentTrack.sound.getStatusAsync();
        if (status.isLoaded) {
          setProgress(status.positionMillis);
          setDuration(status.durationMillis || 1);
        }
      };

      interval = setInterval(updateProgress, 500); // update every 500ms for smoother progress
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleExpansion = () => {
    if (isExtended) {
      Animated.timing(containerHeight, {
        toValue: 70,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsExtended(false));
    } else {
      Animated.timing(containerHeight, {
        toValue: height / 2,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsExtended(true));
    }
  };

  if (!currentTrack) return null;

  return (
    <Animated.View style={[styles.container]}>
      {isExtended ? (
        <View style={styles.expandedContainer}>
          <TouchableOpacity onPress={toggleExpansion} style={styles.collapseButton}>
            <Entypo name="chevron-thin-down" size={30} color="#e3e3e3" />
          </TouchableOpacity>

          <Image
            source={{ uri: currentTrack.image || "https://atlast.fm/images/no-artwork.jpg" }}
            style={styles.albumArt}
          />
          <Text style={styles.trackTitle}>{currentTrack.name || "Unknown Track"}</Text>

          <Pressable 
          style={{
            padding: 5
          }}
           onPress={() => {
            navigation.navigate("ArtistProfile", { userId: currentTrack.artist });
            toggleExpansion();
          }}>
            <Text style={styles.artist}>{currentTrack.artistName || "Unknown Artist"}</Text>
          </Pressable>


          <View style={styles.seekContainer}>
            <Text style={styles.timeText}>{formatTime(progress)}</Text>
            <Slider
              style={styles.slider}
              value={progress / 1000}
              minimumValue={0}
              maximumValue={duration / 1000}
              onSlidingComplete={seek} // pass seconds directly
              minimumTrackTintColor="#e3e3e3"
              maximumTrackTintColor="#555"
              thumbTintColor="#e3e3e3"
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>


            <TouchableOpacity onPress={prevSong}>
              <Feather name={"skip-back"} size={35} color="#e3e3e3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={playOrPauseSong}>
              <Feather name={isPlaying ? "pause" : "play"} size={35} color="#e3e3e3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextSong}>
              <Feather name={"skip-forward"} size={35} color="#e3e3e3" />
            </TouchableOpacity>


            <SlowReverbButton />

          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={toggleExpansion} style={styles.collapsedContainer}>
          <Image source={{ uri: currentTrack.image || "https://atlast.fm/images/no-artwork.jpg" }} style={styles.thumbnail} />

          <View style={{
            flex: 1,
            marginLeft: 15,
            justifyContent: 'center',
            gap: 2
          }}>
            <Text style={styles.collapsedTitle}>{currentTrack.name || "Unknown Track"}</Text>
            <Text style={{
              color: "gray",
              fontSize: 12,
              textAlign: 'left',
            }}>{currentTrack.artistName || "Unknown Artist"}</Text>
          </View>



          <View style={{
            flexDirection: 'row',
            gap: 15,
          }}>

            <TouchableOpacity onPress={playOrPauseSong}>
              <Feather name={isPlaying ? "pause" : "play"} size={30} color="#e3e3e3" />
            </TouchableOpacity>

            <TouchableOpacity onPress={nextSong}>
              <Feather name={"heart"} size={30} color="#e3e3e3" />
            </TouchableOpacity>


          </View>

        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: "#000000e0",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden", // prevents content from spilling out
  },
  collapsedContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "space-between",
    height: 70,
  },
  expandedContainer: {
    flex: 0.5,
    alignItems: "center",
    padding: 30,
    bottom: 0,
  },
  collapseButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  albumArt: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 10,
    marginBottom: 15,
  },
  trackTitle: {
    color: "#e3e3e3",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  artist: {
    color: "#aaa",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  seekContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  timeText: {
    color: "#e3e3e3",
    fontSize: 14,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    gap: 30,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  collapsedTitle: {
    color: "#e3e3e3",
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left'
  },
});
