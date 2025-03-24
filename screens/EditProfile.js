import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Header from '../components/Header';
import { UserContext } from '../UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const EditProfile = () => {
  const { userData, uid } = useContext(UserContext);
  const navigation = useNavigation()
  
  // Initialize form state with current values from userData
  const [name, setName] = useState(userData?.name || '');
  const [customUsername, setCustomUsername] = useState(userData?.customID || '');
  const [genre, setGenre] = useState(userData?.genre || '');
  const [location, setLocation] = useState(userData?.location || '');
  const [about, setAbout] = useState(userData?.about || '');
  const [avatar, setAvatar] = useState(userData?.avatar || null);
  const [avatarBlob, setAvatarBlob] = useState(null);

  // Error state
  const [nameError, setNameError] = useState('');

  // System lists for dropdowns (from misc/system document)
  const [genresList, setGenresList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);

  // Submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch genres and locations from Firestore on mount
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const systemDocRef = doc(db, 'misc', 'system');
        const systemDocSnap = await getDoc(systemDocRef);
        if (systemDocSnap.exists()) {
          const data = systemDocSnap.data();
          setGenresList(data.genres || []);
          setLocationsList(data.locations || []);
        } else {
          console.error('System document does not exist!');
        }
      } catch (error) {
        console.error('Error fetching system data:', error);
      }
    };
    fetchSystemData();
  }, []);

  // Function to pick and crop avatar image
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const { uri, width, height } = asset;
        // Crop image to a square
        const cropSize = Math.min(width, height);
        const manipResult = await manipulateAsync(
          uri,
          [
            {
              crop: {
                originX: (width - cropSize) / 2,
                originY: (height - cropSize) / 2,
                width: cropSize,
                height: cropSize,
              },
            },
          ],
          { compress: 1, format: SaveFormat.PNG }
        );
        setAvatar(manipResult.uri);
        const response = await fetch(manipResult.uri);
        const blob = await response.blob();
        setAvatarBlob(blob);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Validate name input
  const handleNameChange = (text) => {
    setName(text);
    if (!text.trim() || text.length > 100) {
      setNameError('Name is required and must be under 100 characters.');
    } else {
      setNameError('');
    }
  };

  // Save updated profile data to Firebase
  const handleSave = async () => {
    if (isSubmitting) return;

    if (!name.trim() || name.length > 100) {
      setNameError('Name is required and must be under 100 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'user', uid);
      const updateData = {
        name,
        customID: customUsername,
        genre,
        location,
        about,
      };

      // If a new avatar has been selected, upload it to Firebase Storage
      if (avatarBlob) {
        const avatarRef = storageRef(storage, `users/${uid}/avatar.png`);
        await uploadBytes(avatarRef, avatarBlob, { contentType: 'image/png' });
        const avatarUrl = await getDownloadURL(avatarRef);
        updateData.avatar = avatarUrl;
      }

      await updateDoc(userRef, updateData);
      navigation.goBack()
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Profile update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        isGoBack={true}
        isProEle={false}
        title="Edit Profile"
        extraEle={
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            {isSubmitting ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Uploader */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="camera" size={40} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={handleNameChange}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        {/* Custom Username (only for Pro users) */}
        {userData.isPro && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Custom Username"
              placeholderTextColor="#888"
              value={customUsername}
              onChangeText={setCustomUsername}
            />
          </View>
        )}

        {/* Genre Picker */}
        <View style={styles.inputContainer}>
          <Picker
            selectedValue={genre}
            style={styles.picker}
            dropdownIconColor="#888"
            onValueChange={(itemValue) => setGenre(itemValue)}
          >
            <Picker.Item label="Select Genre" value="" />
            {genresList.map((g, index) => (
              <Picker.Item key={index} label={g} value={g} />
            ))}
          </Picker>
        </View>

        {/* Location Picker */}
        <View style={styles.inputContainer}>
          <Picker
            selectedValue={location}
            style={styles.picker}
            dropdownIconColor="#888"
            onValueChange={(itemValue) => setLocation(itemValue)}
          >
            <Picker.Item label="Select Location" value="" />
            {locationsList.map((loc, index) => (
              <Picker.Item key={index} label={loc} value={loc} />
            ))}
          </Picker>
        </View>

        {/* About Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="About (optional)"
            placeholderTextColor="#888"
            value={about}
            onChangeText={setAbout}
            multiline
            maxLength={1000}
          />
          <Text style={styles.charCount}>{about.length} / 1000</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#e3e3e3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  saveBtnText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    color: '#e3e3e3',
    fontSize: 16,
    paddingVertical: 5,
  },
  inputError: {
    borderBottomColor: '#ff4d4d',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 12,
    marginTop: 5,
  },
  picker: {
    color: '#e3e3e3',
    backgroundColor: 'transparent',
  },
  multilineInput: {
    height: 75,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#888',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
});
