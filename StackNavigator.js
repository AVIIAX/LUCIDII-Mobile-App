import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./tabs/LoginScreen";
import BottomTabs from "./BottomTabs";
import { UserContext } from "./UserContext";
import CreateScreen from "./screens/CreateScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { userData } = useContext(UserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userData ? (
     <>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Create" component={CreateScreen} />
      </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
