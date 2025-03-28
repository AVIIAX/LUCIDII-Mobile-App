import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/Register";
import BottomTabs from "./BottomTabs";
import { UserContext } from "./UserContext";
import CreateScreen from "./screens/CreateScreen";
import EditProfile from "./screens/EditProfile";
import ShopScreen from "./screens/ShopScreen";
import BoostScreen from "./screens/BoostScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { userData } = useContext(UserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userData ? (
        <>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen name="Create" component={CreateScreen} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Boost" component={BoostScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
