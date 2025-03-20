import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SearchResult from '../components/SearchResult'; // Adjust path as necessary

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // Options: 'all', 'tracks', 'artists'
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce search when query or filter changes.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedFilter]);

  // Firestore does not support substring queries natively.
  // For demonstration, we fetch the collections and then filter client-side.
  const performSearch = async () => {
    setLoading(true);
    let results = [];
    const lowerQuery = searchQuery.toLowerCase();

    try {
      // Fetch and filter tracks if needed.
      if (selectedFilter === 'all' || selectedFilter === 'tracks') {
        const tracksRef = collection(db, 'track');
        const trackSnapshot = await getDocs(tracksRef);
        trackSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name && data.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: doc.id, // Document id is the track's unique id
              type: 'track',
              ...data,
            });
          }
        });
      }
      // Fetch and filter artists if needed.
      if (selectedFilter === 'all' || selectedFilter === 'artists') {
        const usersRef = collection(db, 'user');
        const userSnapshot = await getDocs(usersRef);
        userSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name && data.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: doc.id, // Document id here is the user's uid
              type: 'artist',
              ...data,
            });
          }
        });
      }
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => <SearchResult result={item} />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#e3e3e3"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {/* Toggle Buttons for filtering */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedFilter === 'all' && styles.activeButton]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.toggleText, selectedFilter === 'all' && styles.activeText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedFilter === 'tracks' && styles.activeButton]}
          onPress={() => setSelectedFilter('tracks')}
        >
          <Text style={[styles.toggleText, selectedFilter === 'tracks' && styles.activeText]}>
            Tracks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedFilter === 'artists' && styles.activeButton]}
          onPress={() => setSelectedFilter('artists')}
        >
          <Text style={[styles.toggleText, selectedFilter === 'artists' && styles.activeText]}>
            Artists
          </Text>
        </TouchableOpacity>
      </View>
      {/* Display loading indicator or search results */}
      {loading ? (
        <ActivityIndicator size="large" color="#e3e3e3" />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
          ListFooterComponent={<View style={{ height: 200 }} />}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
    paddingTop: 40,
  },
  searchBar: {
    height: 50,
    borderWidth: 1,
    color: '#e3e3e3',
    backgroundColor: '#474747cf',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 25,
  },
  activeButton: {
    backgroundColor: '#e3e3e3',
  },
  toggleText: {
    fontSize: 16,
    color: '#e3e3e3',
  },
  activeText: {
    color: '#121212',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#e3e3e3',
  },
});
