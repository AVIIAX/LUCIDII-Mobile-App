// Playlist.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SongRow from '../components/SongRow';
import Header from '../components/Header';

const Playlist = ({ route }) => {
  // Safely destructure route.params (defaulting to an empty object if undefined)
  const {
    isLiked = false,
    myLiked = [],
    trackList = [],
    title = "Playlist",
  } = route.params || {};
console.log("GEnre", title, trackList);

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <Header isGoBack={true} title={isLiked ? "Liked" : title} />
      <View style={styles.container}>
        {isLiked ? (
          <ScrollView style={{ width: '100%' }}>
            {myLiked.map((trackId, index) => (
              <SongRow key={index} trackId={trackId} playlist={myLiked} />
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={{ width: '100%' }}>
            {trackList.map((trackId, index) => (
              <SongRow key={index} trackId={trackId} playlist={trackList} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
});

export default Playlist;
