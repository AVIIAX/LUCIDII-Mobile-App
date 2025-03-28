// screens/LoginScreen.js
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
import { getAuth, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../firebase"; // Ensure firebase is correctly configured

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        .then(() => navigation.navigate("Home"))
        .catch((error) => {
          Alert.alert("Google Sign-In Error", error.message);
        });
    }
  }, [response]);

  // Email/Password login
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    signInWithEmailAndPassword(authInstance, email, password)
      .then(() => navigation.navigate("Home"))
      .catch((error) => {
        Alert.alert("Login Error", error.message);
      });
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
            source={require("../assets/logo.png")} // Ensure the logo exists in assets folder
            resizeMode="contain"
          />
          <Text style={styles.title}>Login</Text>
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
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle} disabled={!request}>
            <Text style={styles.googleButtonText}>Sign In with Google</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <View style={styles.switchAuthContainer}>
          <Text style={styles.switchAuthInfo}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.switchAuthAction}> Register</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

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
