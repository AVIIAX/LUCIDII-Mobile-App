import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAudioPlayer } from '../AudioPlayer';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserContext } from "../UserContext";
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BoostButton from '../components/BoostButton';

const HomeCard = ({ trackId, playList }) => {
  const { uid } = useContext(UserContext);
  const { loadSong, playOrPauseSong, isPlaying, currentTrack, toggleLike } = useAudioPlayer();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const navigation = useNavigation();

  const track = playList.find((track) => track.id === trackId);
  if (!track) return null;

  const isCurrentTrack = currentTrack && currentTrack.id === track.id;

  useEffect(() => {
    setIsLiked(track.liked?.includes(uid)); // Update like state
  }, [track, uid]);

  useEffect(() => {
    setIsMine(track?.artist == uid); // Update like state
  }, [track, uid]);

  const handleToggleLike = async () => {
    if (!track || !uid) return;
    await toggleLike(track.id, uid);
    setIsLiked(!isLiked); // Optimistically update UI
  };

  const handlePress = async () => {
    if (!track) return;
    if (isCurrentTrack) {
      await playOrPauseSong();
    } else {
      await loadSong(track, playList || []);
    }
  };

  const handleLongPress = () => {
    setModalVisible(true);
  };

  return (
    <>
      {/* Card with long-press */}
      <TouchableNativeFeedback
        onPress={handlePress}
        onLongPress={handleLongPress}
        background={TouchableNativeFeedback.Ripple('#363636ed', false)}
        style={{
          borderRadius: 25
        }}
      >
        <LinearGradient
          // Background Linear Gradient
          colors={['rgba(0, 22, 51, 0.37)', 'rgba(19, 0, 37, 0.41)']}
          style={[styles.card, isCurrentTrack && styles.currentTrackCard]}
        >

          <Image source={{ uri: track.image }} style={styles.cardImage} />
          <Text style={[styles.cardText, isCurrentTrack && styles.currentCardText]}>{track.name}</Text>
          <Text style={styles.artistText}>{track.artistName}</Text>

        </LinearGradient>
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

                {isMine ?
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("Boost", { track: track });
                      setModalVisible(false);
                    }}
                  >


                    <Text style={styles.modalOption}>
                      <BoostButton track={track} />      This Track
                    </Text>

                  </TouchableOpacity> : null
                }
                <TouchableOpacity onPress={() => { handleToggleLike(), setModalVisible(false); }}>
                  {isLiked ?
                    <Text style={styles.modalOption}>Remove From Favorites</Text>
                    :
                    <Text style={styles.modalOption}>Add To Favorites</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  navigation.navigate("SearchTab", {
                    screen: "ArtistProfile",
                    params: { userId: track.artist }
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

// Styles
const styles = StyleSheet.create({
  card: {
    fbackgroundColor: 'rgba(36, 36, 36, 0.6)',  // Glass effect with transparency
    padding: 20,
    paddingBottom: 20,
    width: 110,
    height: 'fit-content',
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    margin: 10,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)', // Optional: For blur effect (if supported by device)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',  // Subtle border for glassmorphism
  },
  cardImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffffffb3',
  },
  cardText: {
    color: '#e3e3e3',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  currentCardText: {
    color: '#ccedffe8',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  artistText: {
    color: '#8a8a8a',
  },
  currentTrackCard: {
    borderWidth: 2,
    borderColor: '#e3e3e3',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'rgba(34, 34, 34, 0.8)', // Semi-transparent dark background for modal
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backdropFilter: 'blur(10px)', // Optional: for blur effect in modal (if supported)
  },
  modalOption: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    alignContent: 'center',
    alignItems: 'center',
  },
  modalCancel: {
    color: 'red',
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  boostText: {
    backgroundColor: '#4b9ad2bd',
    padding: 1,
    borderRadius: 25,

  }
});

export default HomeCard;
