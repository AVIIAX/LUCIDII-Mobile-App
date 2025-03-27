import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';  // Import permissions
import { useAudioPlayer } from '../AudioPlayer';
import Header from '../components/Header';

const LocalList = ({ route }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const { loadSong } = useAudioPlayer(); // Using the loadSong function from AudioPlayerContext
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Request permission to access media files
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
    };

    requestPermission();
  }, []);

  // Fetch audio files from the media library
  useEffect(() => {
    const getAudioFiles = async () => {
      if (permissionStatus !== 'granted') return;

      try {
        const assets = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
        });

        const files = assets.assets.map((asset) => ({
          id: asset.id,
          name: asset.filename,
          uri: asset.uri, // This is the URI to the file
          artist: asset.artist,
          duration: asset.duration,
        }));

        setAudioFiles(files);
      } catch (error) {
        console.error('Error fetching audio files:', error);
      }
    };

    getAudioFiles();
  }, [permissionStatus]);

  // Handle song press (load the song using loadSong from AudioPlayerContext)
  const handlePress = (track) => {
    console.log('Track clicked:', track); // Log track to ensure it's passed correctly
    const updatedTrack = {
      ...track,
      isLocal: true,  // Mark this as a local track
    };
    console.log('Updated track with isLocal:', updatedTrack); // Log the updated track
    loadSong(updatedTrack); // Pass track to loadSong in AudioPlayerContext
  };

  // Render each audio file in the list
  const renderTrack = ({ item: track }) => (
    <TouchableOpacity onPress={() => handlePress(track)} style={styles.trackItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri:  'https://atlast.fm/images/no-artwork.jpg' }} // You can use a default image or extract album art from the track
          style={styles.cardImage}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.trackName}>{track.name || 'Unknown Track'}</Text>
          <Text style={styles.trackDuration}>{track?.Artist }</Text>
          <Text style={styles.trackDuration}>
            {track.duration ? `${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60)}` : '00:00'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.screen}>
        <Text style={styles.noResults}>Permission to access media library is required</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header isGoBack={true} isMail={false} title="Local Music" />
      {/* Render audio files list */}
      <FlatList
        data={audioFiles}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        ListEmptyComponent={<Text style={styles.noResults}>No audio files found.</Text>}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={<View style={{ height: 200 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContainer: {
    padding: 10,
    alignItems: 'center',
    alignItems: 'left',
  },
  noResults: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  trackItem: {
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#1e1e1e',
  },
  trackName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e3e3e3',
    letterSpacing: 2,
  },
  trackDuration: {
    color: 'gray',
    fontSize: 14,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    borderWidth: 0.6,
  },
});

export default LocalList;
