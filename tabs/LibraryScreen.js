import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableNativeFeedback,
  ScrollView,
  Dimensions,
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
const tileWidth = (screenWidth / 2) - 16; // Two columns with spacing

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
        <View style={[styles.genreTile, { height, borderColor }]}>
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
    padding: 8,
  },
  genreTile: {
    width: tileWidth, // Ensures two tiles per row
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 8, // Space between rows
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  genreName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  genreCount: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
});

export default LibraryScreen;
