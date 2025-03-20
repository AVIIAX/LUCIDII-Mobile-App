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

const HomeCard = ({ trackId, playList }) => {
  const { uid } = useContext(UserContext);
  const { loadSong, playOrPauseSong, isPlaying, currentTrack, toggleLike } = useAudioPlayer();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
const navigation = useNavigation()

  const track = playList.find((track) => track.id === trackId);
  if (!track) return null;

  const isCurrentTrack = currentTrack && currentTrack.id === track.id;

  useEffect(() => {
    setIsLiked(track.liked?.includes(uid)); // Update like state
  }, [track, uid])

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
        background={TouchableNativeFeedback.Ripple('gray', false)}
      >
        <View style={[styles.card, isCurrentTrack && styles.currentTrackCard]}>
          <Image source={{ uri: track.image }} style={styles.cardImage} />
          <Text style={[styles.cardText, isCurrentTrack && styles.currentCardText]}>{track.name}</Text>
          <Text style={{ color: 'gray' }}>{track.artistName}</Text>
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

                <TouchableOpacity onPress={() => {  navigation.navigate("SearchTab", { 
                screen: "ArtistProfile", 
                params: { userId: track.artist } 
              });
               setModalVisible(false); }}>
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
    backgroundColor: '#333',
    padding: 20,
    width: 130,
    height: 180,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
    overflow: 'hidden',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffffffb3',
  },
  cardText: {
    color: '#e3e3e3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentCardText: {
    color: '#ccedffe8',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  currentTrackCard: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
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

export default HomeCard;
