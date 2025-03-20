// Playlist.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SongRow from '../components/SongRow';
import Header from '../components/Header';

const Playlist = ({ route }) => {
  // Access the isLiked parameter from the route
  const { isLiked } = route.params;
  const { myLiked } = route.params;

  if (isLiked && myLiked) {
    // Fetch liked tracks
    console.log(myLiked);
  }

  return (
    <View>
    <Header isGoBack={true} title="Liked"/>
    <View style={styles.container}>

      {isLiked ? (
        <ScrollView style={{ width: '100%' }}>
          {myLiked.map((trackId, index) => (
            <SongRow key={index} trackId={trackId} playlist={myLiked} />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.text}>This is the Default Playlist view.</Text>
      )}
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 10,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Playlist;
