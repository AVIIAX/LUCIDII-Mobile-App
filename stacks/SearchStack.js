import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchScreen from "../tabs/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen"; // This will act as ArtistProfile

const Stack = createNativeStackNavigator();

const SearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ArtistProfile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default SearchStack;
