// screens/RegisterScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Ensure firebase is correctly configured
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

  // Function to handle registration with email/password
  const register = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create a Firestore document with the user's UID as the document ID
      const userRef = doc(db, "user", user.uid);
      await setDoc(userRef, {
        artist: false,
        credits: "15",
        name: name,
        email: email,
        artwork: "https://i.postimg.cc/wxrwGs5t/a331a8d0a8ff50827c6cb3437f336a30.jpg",
      });
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Registration Error", error.message);
    }
  };

  // Function to handle registration with Google
  const signInWithGoogle = async () => {
    const authInstance = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(authInstance, provider);
      const user = result.user;
      const username = user.displayName;
      const avatarUrl = user.photoURL;
      
      // Create or update user data in Firestore
      const firestore = getFirestore();
      const userRef = doc(firestore, "user", user.uid);
      await setDoc(userRef, {
        name: username,
        email: user.email,
        avatar: avatarUrl,
        artist: false,
        credits: "15",
      });
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Google Sign-Up Error", error.message);
    }
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          {/* Optional: Add logo to match LoginScreen */}
          <Image
            style={styles.logo}
            source={require("../assets/logo.png")} // Ensure your logo file exists in assets folder
            resizeMode="contain"
          />
          <Text style={styles.title}>Register</Text>
          <TextInput
            placeholder="Name"
            placeholderTextColor="#888"
            style={styles.input}
            onChangeText={setName}
            value={name}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            style={styles.input}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
            <Text style={styles.googleButtonText}>Sign Up with Google</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <SafeAreaView style={styles.switchAuthContainer}>
          <Text style={styles.switchAuthText}>Already Have An Account?</Text>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.switchAuthButton}
          >
            <Text style={styles.switchAuthButtonText}>Login</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  innerContainer: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: "white",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "white",
    marginBottom: 15,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  googleButton: {
    width: "100%",
    height: 50,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  googleButtonText: {
    color: "white",
    fontSize: 18,
  },
  switchAuthContainer: {
    marginTop: 15,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  switchAuthText: {
    color: "#e3e3e3",
    fontSize: 18,
    textAlign: "center",
  },
  switchAuthButton: {},
  switchAuthButtonText: {
    color: "#63ab69",
    fontSize: 18,
    marginLeft: 5,
    textAlign: "center",
  },
});
