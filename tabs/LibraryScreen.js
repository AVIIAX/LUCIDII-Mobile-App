// import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// create a component
const LibraryScreen = () => {
  return (
    <View style={styles.container}>
      
      <Text style={styles.text}>LibraryScreen</Text>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: {
    color: 'white', // set the text color to white
  },
});

// make this component available to the app
export default LibraryScreen;
