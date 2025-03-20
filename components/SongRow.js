import { StyleSheet, Text, View, Image, TouchableNativeFeedback, TouchableOpacity, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Audio } from 'expo-av';
import Entypo from '@expo/vector-icons/Entypo';
import { useAudioPlayer } from '../AudioPlayer';
import { UserContext } from "../UserContext";
import { useNavigation } from '@react-navigation/native';


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
  const { uid } = useContext(UserContext);
  const [track, setTrack] = useState(null);
  const { loadSong, playOrPauseSong, isPlaying, currentTrack, toggleLike} = useAudioPlayer();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigation = useNavigation()

  // Fetch track data when trackId changes
  useEffect(() => {
    setTrack(null);
    if (trackId) {
      const fetchTrack = async () => {
        const trackData = await getTrack(trackId);
        if (trackData) {
          setTrack(trackData);
          setIsLiked(trackData?.liked?.includes(uid)); 
        }
      };
      fetchTrack();
      
    } else {
      console.log("No track ID provided");
    }
  }, [trackId, uid]);


  const handleToggleLike = async () => {
    if (!track || !uid) return;
    await toggleLike(track.id, uid);
    setIsLiked(!isLiked); // Optimistically update UI
  };
  const handleLongPress = () => {
    setModalVisible(true);
  };


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
    <>
      <TouchableNativeFeedback
        onPress={handlePress}
        onLongPress={handleLongPress}
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

      {/* Options Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <TouchableOpacity onPress={() => { handleToggleLike(), setModalVisible(false); }}>
                  {isLiked ?
                    <Text style={styles.modalOption}>Remove From Favorites</Text>
                    :
                    <Text style={styles.modalOption}>Add To Favorites</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  navigation.navigate("SearchTab", {
                    screen: "ArtistProfile",
                    params: { userId: track?.artist }
                  });

                  setModalVisible(false);
                }}>
                  <Text style={styles.modalOption}>Go To Artist</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { /* Share song logic */ setModalVisible(false); }}>
                  <Text style={styles.modalOption}>Share Song</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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

   // Modal styles
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#222',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalOption: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalCancel: {
    color: 'red',
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SongRow;
