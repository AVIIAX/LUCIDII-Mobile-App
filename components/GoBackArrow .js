// GoBackArrow.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Using react-navigation's useNavigation hook
import Feather from '@expo/vector-icons/Feather';

const GoBackArrow = () => {
  const navigation = useNavigation();  // Hook to access navigation

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowButton}>
       
        <Feather style={styles.arrow} name="chevron-left" size={30} color="#e3e3e3" />
       
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 'fit-content',
    height: 'fit-content',
    zIndex: 1,
    marginRight: 15
  },
  arrowButton: {
  },
  arrow: {
    color: '#fff',
    fontSize: 30,
  },
});

export default GoBackArrow;
