import React, { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { UserProvider, UserContext } from "./UserContext";
import StackNavigator from "./StackNavigator";
import Header from "./components/Header";      
import { AudioPlayerProvider } from "./AudioPlayer";
import MusicPlayer from "./components/MusicPlayer";

export default function App() {
  return (
    <UserProvider>
      <AudioPlayerProvider>
        <NavigationContainer>
          <View style={{ flex: 1, backgroundColor: '#e3e3e3' }}>
            <Root />
            {/* 
              Position MusicPlayer above the BottomTabs.
              Adjust bottom value if needed (e.g., height of your tab bar).
            */}
            <MusicPlayer style={{ position: "absolute", bottom: 60, left: 0, right: 0 }} />
          </View>
        </NavigationContainer>
      </AudioPlayerProvider>
    </UserProvider>
  );
}

const Root = () => {
  const { loading, userData } = useContext(UserContext);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#121212",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 60,
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StackNavigator />
    </View>
  );
};
