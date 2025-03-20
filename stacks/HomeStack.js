import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../tabs/HomeScreen";
import PlaylistScreen from "../screens/PlaylistScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const HomeStackNavigator = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <HomeStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNavigator.Screen name="Home" component={HomeScreen} />
      <HomeStackNavigator.Screen name="Playlist" component={PlaylistScreen} />
      <HomeStackNavigator.Screen name="MailBox" component={NotificationsScreen} />
      <HomeStackNavigator.Screen name="ArtistProfile" component={ProfileScreen} />
    </HomeStackNavigator.Navigator>
  );
};

export default HomeStack;
