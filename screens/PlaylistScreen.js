import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import SongRow from '../components/SongRow';
import Header from '../components/Header';

const Playlist = ({ route }) => {
  // Destructure route.params safely with defaults
  const {
    isLiked = false,
    myLiked = [],
    trackList = [],
    title = "Playlist",
  } = route.params || {};

  const data = isLiked ? myLiked : trackList;

  return (
    <View style={styles.screen}>
      <Header isGoBack={true} title={isLiked ? "Liked Songs" : title} />
      <FlatList
        data={data}
        keyExtractor={(trackId, index) => trackId || index.toString()} // Ensure a unique key
        renderItem={({ item }) => <SongRow trackId={item} playlist={data} />}
        ListEmptyComponent={<Text style={styles.noResults}>No songs found.</Text>}
        ListFooterComponent={<View style={{ height: 100 }} />} // Adds bottom spacing
        contentContainerStyle={styles.listContainer}
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
});

export default Playlist;
