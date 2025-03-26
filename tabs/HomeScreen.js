import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableNativeFeedback, FlatList, RefreshControl } from 'react-native';
import Banner from '../components/Banner';
import HomeCard from '../components/HomeCard';
import { AntDesign } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import Header from '../components/Header';
import { getRandomBoostedTrackId } from '../utils/boostedtracks';

// Function to get tracks and assign artist name
const getTracks = async (field, sortOrder = 'asc', limitCount) => {
  try {
    const tracksCollection = collection(db, 'track');
    let tracksQuery;

    if (limitCount) {
      tracksQuery = query(tracksCollection, orderBy(field, sortOrder), limit(limitCount));
    } else {
      tracksQuery = query(tracksCollection, orderBy(field, sortOrder));
    }

    const querySnapshot = await getDocs(tracksQuery);
    const tracksArray = [];

    for (const docSnapshot of querySnapshot.docs) {
      const track = docSnapshot.data();
      const trackId = docSnapshot.id;

      const userRef = doc(db, 'user', track.artist);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        track.artistName = userData.name;
      } else {
        console.log(`Artist not found for track ID: ${trackId}`);
        track.artistName = "Unknown Artist";
      }

      tracksArray.push({ id: trackId, ...track });
    }

    return tracksArray;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }
};

// Function to get users based on criteria
const getUsers = async (field, sortOrder = 'asc', type, limitCount) => {
  try {
    const usersCollection = collection(db, 'user');
    let q;

    if (type === 'artist') {
      q = query(usersCollection, where('artist', '==', true));
    } else if (type === 'user') {
      q = query(usersCollection, where('artist', '==', false));
    } else {
      q = query(usersCollection);
    }

    const querySnapshot = await getDocs(q);
    let usersArray = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const value = data[field];
      usersArray.push({ id: doc.id, value });
    });

    usersArray.sort((a, b) => {
      const aVal = Array.isArray(a.value) ? a.value.length : a.value;
      const bVal = Array.isArray(b.value) ? b.value.length : b.value;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    if (limitCount) {
      usersArray = usersArray.slice(0, limitCount);
    }

    return usersArray.map(item => item.id);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userData } = useContext(UserContext);
  const [topHits, setTopHits] = useState([]);
  const [topLiked, setTopLiked] = useState([]);
  const [boosted, setBoosted] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [boostedTrackId, setBoostedTrackId] = useState(null);  // State to store boosted track ID
  const [refreshing, setRefreshing] = useState(false);  // State to track refreshing status

  // Fetch tracks when the component is loaded
  const fetchTracks = async () => {
    const topHitsTracks = await getTracks('views', 'desc', 5);
    console.log("Fetched top hits:", topHitsTracks);
    setTopHits(topHitsTracks);

    const topLikedTracks = await getTracks('liked', 'desc', 5);
    console.log("Fetched top liked:", topLikedTracks);
    setTopLiked(topLikedTracks);

    const boostedTracks = await getTracks('boost', 'desc', 5);
    console.log("Fetched boosted tracks:", boostedTracks);
    setBoosted(boostedTracks);

    const topArtist = await getUsers('followers', 'desc', 50);
    console.log("Fetched top artists:", topArtist);
    setTopArtists(topArtist);

    // Set a random boosted track ID to display in the banner
    const trackId = await getRandomBoostedTrackId();
    console.log("Fetched boosted track ID:", trackId);
    setBoostedTrackId(trackId);
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTracks();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  return (
    <View>
      <Header title="LUCIDII"/>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Banner now uses the state holding the boosted track ID */}
        {boostedTrackId && <Banner trackId={boostedTrackId} />}

        {/* Liked Songs */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 }}>
          <TouchableNativeFeedback
            onPress={() => navigation.navigate("Playlist", { isLiked: true, myLiked: userData?.liked })}
          >
            <View style={styles.cardWrapper}>
              <View style={styles.iconWrapper}>
                <Text><AntDesign name="heart" size={28} color="#e3e3e3" /></Text>
              </View>
              <Text style={styles.cardText}>Liked Songs</Text>
            </View>
          </TouchableNativeFeedback>

          {/* My Tracks */}
          {userData?.artist ? (
            <TouchableNativeFeedback
             onPress={() => navigation.navigate("Playlist", { isLiked: false, trackList: userData?.tracks, title:"Your Tracks" })}
            >
              <View style={styles.cardWrapper}>
                <View style={styles.iconWrapper}>
                  <Text><MaterialCommunityIcons name="bookshelf" size={28} color="#e3e3e3" /></Text>
                </View>
                <Text style={styles.cardText}>My Tracks</Text>
              </View>
            </TouchableNativeFeedback>
          ) : null}
        </View>

        <Text style={styles.label}>Top Hits</Text>
        <FlatList
          horizontal
          contentContainerStyle={styles.cardContainer}
          data={topHits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HomeCard trackId={item.id} playList={topHits} />}
        />

        <Text style={styles.label}>Top Liked</Text>
        <FlatList
          horizontal
          contentContainerStyle={styles.cardContainer}
          data={topLiked}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HomeCard trackId={item.id} playList={topLiked} />}
        />

        <Text style={styles.label}>Boosted Tracks</Text>
        <FlatList
          horizontal
          contentContainerStyle={styles.cardContainer}
          data={boosted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HomeCard trackId={item.id} playList={boosted} />}
        />

        <View style={{ height: 175, width: "100%" }}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    padding: 10,
    paddingBottom: 500,
  },
  label: {
    color: "#e3e3e3",
    textAlign: "left",
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 10,
  },
  cardContainer: {
    flexDirection: "row",
  },
  cardWrapper: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: "#202020",
    borderRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    color: "#e3e3e3",
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default HomeScreen;
