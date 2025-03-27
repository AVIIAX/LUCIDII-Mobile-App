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
import * as DocumentPicker from 'expo-document-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import { db, storage } from '../firebase'; // adjust to your firebase config file
import {
  doc,
  getDoc,
  collection,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import Header from '../components/Header';
import { UserContext } from '../UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ToastAndroid } from 'react-native';

const CreateScreen = () => {
  const { userData, uid } = useContext(UserContext);
  const navigation = useNavigation()

  // State variables for artwork image
  const [artwork, setArtwork] = useState(null);
  const [artworkBlob, setArtworkBlob] = useState(null);

  // Text inputs
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [genre, setGenre] = useState('');
  const [genresList, setGenresList] = useState([]);
  const [description, setDescription] = useState('');

  // Audio file state
  const [audioFile, setAudioFile] = useState(null);

  // Submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Credits error state
  const [creditsError, setCreditsError] = useState('');

  // Fetch genres from Firestore (from misc/system document)
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const systemDocRef = doc(db, 'misc', 'system');
        const systemDocSnap = await getDoc(systemDocRef);
        if (systemDocSnap.exists()) {
          const data = systemDocSnap.data();
          setGenresList(data.genres || []);
        } else {
          console.error('System document does not exist!');
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Image picker and crop function
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        // Access the first asset from the assets array
        const asset = result.assets[0];
        const { uri, width, height } = asset;
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
        setArtwork(manipResult.uri);
        const response = await fetch(manipResult.uri);
        const blob = await response.blob();
        setArtworkBlob(blob);
      }
    } catch (error) {
      console.error('Error picking/cropping image:', error);
    }
  };


  // Audio file picker (only audio types allowed)
  const pickAudio = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.type === 'success') {
        setAudioFile(result);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
    }
  };

  // Validate title on change
  const handleTitleChange = (text) => {
    setTitle(text);
    if (!text.trim() || text.length > 100) {
      setTitleError('Title is required and must be under 100 characters.');
    } else {
      setTitleError('');
    }
  };

  // Save track to Firestore and Firebase Storage
  const handleSave = async () => {
    if (isSubmitting) return;

    // Validate required fields
    if (!title.trim() || title.length > 100) {
      setTitleError('Title is required and must be under 100 characters.');
      return;
    }
    if (!genre) {
      Alert.alert('Error', 'Please select a genre.');
      return;
    }
    if (description.length > 1000) {
      Alert.alert('Error', 'Description cannot exceed 1000 characters.');
      return;
    }
    if (!artworkBlob) {
      Alert.alert('Error', 'Artwork image is required.');
      return;
    }
    if (!audioFile) {
      Alert.alert('Error', 'Audio file is required.');
      return;
    }

    // Check if user has enough credits (must have at least 5)
    if (userData.credits < 5) {
      setCreditsError('Not enough credits');
      return;
    } else {
      setCreditsError('');
    }

    setIsSubmitting(true);
    try {
      // Create a new track document reference (so we can use its ID for Storage paths)
      const trackDocRef = doc(collection(db, 'track'));
      const trackId = trackDocRef.id;

      // Transaction to create track document and update user doc (e.g., add track ID)
      const userRef = doc(db, 'user', uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User document does not exist!');
        }
        const currentCredits = userDoc.data().credits || 0;
        if (currentCredits < 5) {
          throw new Error('Not enough credits');
        }
        const newCredits = currentCredits - 5;

        // Prepare track data
        const trackData = {
          artist: uid,
          name: title,
          genre: genre,
          description: description,
          image: '', // to be updated after artwork upload
          url: '', // to be updated after audio upload
          id: trackId,
          createdAt: new Date(),
          // Additional fields can be added here
        };

        transaction.set(trackDocRef, trackData);
        // Update user's tracks array and deduct credits
        transaction.update(userRef, {
          tracks: [...(userDoc.data().tracks || []), trackId],
          credits: newCredits,
        });
      });

      // Upload artwork to Firebase Storage
      const artworkRef = storageRef(
        storage,
        `users/${uid}/tracks/${trackId}/artwork.png`
      );
      await uploadBytes(artworkRef, artworkBlob, { contentType: 'image/png' });
      const artworkUrl = await getDownloadURL(artworkRef);

      // Upload audio file to Firebase Storage
      const audioResponse = await fetch(audioFile.uri);
      const audioBlob = await audioResponse.blob();
      const fileExtension = audioFile.name.substring(
        audioFile.name.lastIndexOf('.')
      );
      const audioRef = storageRef(
        storage,
        `users/${uid}/tracks/${trackId}/audio${fileExtension}`
      );
      await uploadBytes(audioRef, audioBlob, {
        contentType: audioFile.mimeType || 'audio/mpeg',
      });
      const audioUrl = await getDownloadURL(audioRef);

      // Update track document with artwork and audio URLs
      await updateDoc(trackDocRef, {
        image: artworkUrl,
        url: audioUrl,
      });

      navigation.goBack()
      ToastAndroid.show('Track Uploaded!', ToastAndroid.SHORT);
      // Clear fields
      setArtwork(null);
      setArtworkBlob(null);
      setTitle('');
      setGenre('');
      setDescription('');
      setAudioFile(null);
    } catch (error) {
      console.error(error);
      ToastAndroid.show('Something Went Wrong. Try Again', ToastAndroid.SHORT);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        isGoBack={true}
        isProEle={false}
        title="Create"
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

        {/* Display credits error if user doesn't have enough credits */}
        {userData.credits < 5 && (
          <Text style={styles.creditsError}>Not enough credits</Text>
        )}

        {/* Artwork Uploader */}
        <TouchableOpacity style={styles.artworkContainer} onPress={pickImage}>
          {artwork ? (
            <Image source={{ uri: artwork }} style={styles.artworkImage} />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <MaterialCommunityIcons
                name="camera"
                size={40}
                color="#aaa"
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              titleError ? styles.inputError : null,
            ]}
            placeholder="Track Title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={handleTitleChange}
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}
        </View>

        {/* Genre Selector */}
        <View style={styles.inputContainer}>
          <Picker
            selectedValue={genre}
            style={styles.picker}
            dropdownIconColor="#888"
            onValueChange={(itemValue) => setGenre(itemValue)}
          >
            <Picker.Item style={styles.pickerItem} label="Select Genre" value="" />
            {genresList.map((g, index) => (
              <Picker.Item key={index} label={g} value={g} />
            ))}
          </Picker>
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {description.length} / 1000
          </Text>
        </View>

        {/* Audio Uploader */}
        <TouchableOpacity style={styles.audioUploader} onPress={pickAudio}>
          <Text style={styles.audioUploaderText}>
            {audioFile ? audioFile.name : 'Upload Audio File'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateScreen;

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
  artworkContainer: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
  pickerItem: {
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
  audioUploader: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#8a8a8a',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  audioUploaderText: {
    color: '#e3e3e3',
    fontSize: 16,
  },
  creditsError: {
    color: '#ff4d4d',
    fontSize: 16,
    marginBottom: 10,
  },
});
