import React, { useContext } from "react";
import { Pressable, StyleSheet} from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo, Ionicons, AntDesign } from "@expo/vector-icons";
import HomeStack from "./stacks/HomeStack"; // Using the nested HomeStack
import SearchStack from "./stacks/SearchStack";
import LibraryScreen from "./tabs/LibraryScreen";
import UserProfileScreen from "./tabs/UserProfileScreen";
import SearchScreen from "./tabs/SearchScreen";
import { UserContext } from "./UserContext";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const { uid } = useContext(UserContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#000000e0",
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 0,
          alignSelf: "center",
          padding: 5,
          shadowOpacity: 4,
          shadowRadius: 4,
          elevation: 4,
          shadowOffset: { width: 0, height: -4 },
          borderTopWidth: 0,
          height: 50,
          paddingTop: 10
        },
        headerShown: false,
        tabBarLabel: () => null,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack} // Nesting the HomeStack
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="white" />
            ) : (
              <AntDesign name="home" size={24} color="white" />
            ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="search" size={24} color="white" />
            ) : (
              <Ionicons name="search-outline" size={24} color="white" />
            ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={LibraryScreen} // Replace with your intended component if needed
        options={{
          tabBarButton: () => (
            <Pressable style={styles.createBtn}>
              <AntDesign name="plus" size={35} color="white" />
            </Pressable>
          )
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="library" size={24} color="white" />
            ) : (
              <Ionicons name="library-outline" size={24} color="white" />
            ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={UserProfileScreen}
        initialParams={{ userId: uid }}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" size={24} color="white" />
            ) : (
              <Ionicons name="person-outline" size={24} color="white" />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  createBtn: {
    justifyContent: "center",
    alignItems: "center", // Ensures the icon is centered
    width: "100%", // Makes sure it takes full width of tab button

  },
});
