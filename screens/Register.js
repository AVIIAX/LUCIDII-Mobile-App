// screens/RegisterScreen.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Ensure firebase is correctly configured
import { useNavigation } from "@react-navigation/native";
import * as Google from "expo-auth-session/providers/google";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();
  const authInstance = getAuth();

  // Expo Google authentication request
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "YOUR_GOOGLE_CLIENT_ID", // Replace with your client ID
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(authInstance, credential)
        .then((result) => {
          const user = result.user;
          const userRef = doc(getFirestore(), "user", user.uid);
          setDoc(userRef, {
            name: user.displayName || name,
            email: user.email,
            avatar: user.photoURL || "",
            artist: false,
            credits: "15",
          }).catch((error) => {
            Alert.alert("Firestore Error", error.message);
          });
          navigation.navigate("Home");
        })
        .catch((error) => {
          Alert.alert("Google Sign-Up Error", error.message);
        });
    }
  }, [response]);

  // Registration with email/password
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
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
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

  // Trigger Google prompt
  const signInWithGoogle = () => {
    promptAsync();
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          <Image
            style={styles.logo}
            source={require("../assets/logo.png")}
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
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle} disabled={!request}>
            <Text style={styles.googleButtonText}>Sign Up with Google</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <View style={styles.switchAuthContainer}>
          <Text style={styles.switchAuthInfo}>Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.switchAuthAction}> Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  innerContainer: { alignItems: "center" },
  logo: { width: 200, height: 50, marginBottom: 20 },
  title: { fontSize: 32, color: "white", marginBottom: 30, fontWeight: "bold" },
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
  buttonText: { color: "white", fontSize: 18 },
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
  googleButtonText: { color: "white", fontSize: 18 },
  switchAuthContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  switchAuthInfo: { color: "#e3e3e3", fontSize: 18 },
  switchAuthAction: { color: "#63ab69", fontSize: 18 },
});
