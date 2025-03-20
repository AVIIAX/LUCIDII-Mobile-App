import React from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SongRow from './SongRow';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FollowButton from './FollowButton';

const SearchResult = ({ result }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.resultContainer}>
      {result.type === 'track' ? (
        <View>
          <SongRow trackId={result.id} />
        </View>
      ) : (
        <View style={styles.artistResult}>
          <TouchableNativeFeedback
            onPress={() => {
              // Navigate to ArtistProfile screen nested in HomeTab (HomeStack)
              navigation.navigate("SearchTab", { 
                screen: "ArtistProfile", 
                params: { userId: result.id } 
              });
            }}
            background={TouchableNativeFeedback.Ripple('#313030', false)}
          >
            <View style={styles.container}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={{ uri: result?.avatar || 'https://atlast.fm/images/no-artwork.jpg' }}
                  style={styles.cardImage}
                />
                <View style={{ marginLeft: 10 }}>
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>
                      {result ? result.name : 'Loading...'}
                    </Text>
                    {result.artist ? (
                      <SimpleLineIcons name="music-tone" size={12} color="#e3e3e3" />
                    ) : null}
                  </View>
                  <Text style={{ color: '#b3b3b3', fontSize: 12, marginLeft: 5 }}>
                    {result ? result.followers?.length : '0'} Follower(s)
                  </Text>
                </View>
              </View>
              {/* Pass the user UID (document id) as target to FollowButton */}
              <FollowButton target={result.id} />
            </View>
          </TouchableNativeFeedback>
        </View>
      )}
    </View>
  );
};

export default SearchResult;

const styles = StyleSheet.create({
  resultContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e338',
  },
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e3e3e3',
    letterSpacing: 2,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderColor: '#e3e3e3',
    borderWidth: 0.6,
  },
});
