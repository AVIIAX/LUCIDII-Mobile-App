// screens/LoginScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      Alert.alert("Login Error", error.message);
    });
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          <Text style={styles.title}>LUCIDII Login</Text>
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1,
   },
  safeArea: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  innerContainer: { alignItems: "center" },
  title: { fontSize: 32, color: "white", marginBottom: 40, fontWeight: "bold" },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "white",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#3d3d3d",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 18 },
});
