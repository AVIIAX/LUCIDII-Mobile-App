import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableNativeFeedback,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Header from '../components/Header';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const BORDER_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#A0937D', '#F45D48', '#DBB2FF', '#FFB3BA',
  '#BAFFC9', '#C9B3FF', '#FFDF91', '#91FFD9',
];

const screenWidth = Dimensions.get('window').width;
const tileWidth = (screenWidth / 2) - 20; // Two columns with spacing

const LibraryScreen = () => {
  const navigation = useNavigation();
  const [genres, setGenres] = useState([]);
  const [tracksByGenre, setTracksByGenre] = useState({});

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const systemDocRef = doc(db, 'misc', 'system');
        const systemSnap = await getDoc(systemDocRef);
        if (systemSnap.exists()) {
          setGenres(systemSnap.data().genres || []);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    const fetchTracksByGenre = async () => {
      try {
        const trackRef = collection(db, 'track');
        const trackSnap = await getDocs(trackRef);
        const genreDict = {};

        trackSnap.forEach((docSnap) => {
          const trackData = docSnap.data();
          const trackGenre = trackData.genre || 'Unknown';
          const trackId = trackData.id || docSnap.id;

          if (!genreDict[trackGenre]) {
            genreDict[trackGenre] = [];
          }
          genreDict[trackGenre].push(trackId);
        });

        setTracksByGenre(genreDict);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    fetchGenres();
    fetchTracksByGenre();
  }, []);

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const getRandomHeight = () => Math.floor(Math.random() * (220 - 140 + 1)) + 140;

  const getRandomBorderColor = () => BORDER_COLORS[Math.floor(Math.random() * BORDER_COLORS.length)];

  const renderGenreTile = (genreName) => {
    const genreTracks = tracksByGenre[genreName] || [];
    const trackCount = formatNumber(genreTracks.length);
    const height = getRandomHeight();
    const borderColor = getRandomBorderColor();

    return (
      <TouchableNativeFeedback
        key={genreName}
        onPress={() => navigation.navigate('HomeTab', {
          screen: 'Playlist',
          params: { trackList: genreTracks, title: genreName, isLiked: false },
        })}
      >
        <View style={[styles.genreTile, { height, borderColor, shadowColor: borderColor }]}>
          {/* Neon Glow Layer (Behind Text) */}
          <Text style={[styles.glowText, { color: borderColor }]}>{genreName}</Text>

          {/* Main Text */}
          <Text style={styles.genreName}>{genreName}</Text>
          <Text style={styles.genreCount}>{trackCount} songs</Text>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Header title="Library" />
      <ScrollView contentContainerStyle={styles.tileWrapper}>
        {genres.map((genreName) => renderGenreTile(genreName))}

        <View style={{ width: '100%', height: 200 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#111111',
  },
  tileWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  genreTile: {
    width: tileWidth,
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  genreName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    
    // Text Glow Effect
    textShadowColor: 'rgba(255, 255, 255, 0.17)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  genreCount: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  glowText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.1,

    // Stronger Glow Effect for Text
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
});

export default LibraryScreen;
