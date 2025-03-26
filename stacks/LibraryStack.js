import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LibraryScreen from "../tabs/LibraryScreen";
import LocalList from "../screens/LocalList";

const LibraryStackNavigator = createNativeStackNavigator();

const LibraryStack = () => {
  return (
    <LibraryStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStackNavigator.Screen name="Library" component={LibraryScreen} />
      <LibraryStackNavigator.Screen name="LocalList" component={LocalList} />
    </LibraryStackNavigator.Navigator>
  );
};

export default LibraryStack;
