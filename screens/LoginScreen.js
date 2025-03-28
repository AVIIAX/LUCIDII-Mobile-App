// screens/LoginScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
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
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase"; // Ensure firebase is correctly configured

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Email/Password login
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.navigate("Home");
      })
      .catch((error) => {
        Alert.alert("Login Error", error.message);
      });
  };

  // Google sign-in
  const signInWithGoogle = async () => {
    const authInstance = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(authInstance, provider);
      // Optional: update Firestore data if needed
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Google Sign-In Error", error.message);
    }
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../assets/logo.png")} // Ensure the logo is in the assets folder
              resizeMode="contain"
            />
          </View>
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
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
            <Text style={styles.googleButtonText}>Sign In with Google</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <View style={styles.switchAuth}>
          <Text style={styles.switchAuthText}>Don't Have An Account?</Text>
          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={styles.switchAuthButton}
          >
            <Text style={styles.switchAuthButtonText}>Register</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

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
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 50,
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
  switchAuth: {
    marginTop: 15,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    width: '100%',
  },
  switchAuthText: {
    color: "#e3e3e3",
    fontSize: 18,
    textAlign: 'center'
  },
  switchAuthButton: {},
  switchAuthButtonText: {
    color: "#63ab69",
    fontSize: 18,
    marginLeft: 5,
    textAlign: 'center'
  },
});
