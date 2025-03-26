import React, { useContext } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { UserContext } from "../UserContext";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";
import GoBackArrow from "./GoBackArrow ";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const Header = ({ isGoBack, isProEle = true, isMail = true, title, extraEle }) => {
  const { userData } = useContext(UserContext);
  const navigation = useNavigation();

  // Convert inboxMails to an array if it exists, then check if there are any unread mails (seen === false)
  const mailsArray = userData?.inboxMails ? Object.values(userData.inboxMails) : [];
  const hasNewMails = mailsArray.some(mail => mail.seen === false);

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {isGoBack ? <GoBackArrow /> : null}

        {/* This View will center the 'title' text */}
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}>{title}</Text>
        </View>
      </View>

      <View style={styles.rightTextContainer}>
        {/* Render extraEle regardless of isProEle */}
        {extraEle && (
          <View style={styles.extraElementContainer}>
            {extraEle}
          </View>
        )}

        {/* Only show these if isProEle is true */}
        {isProEle && (
          <>
            {userData?.isPro ? (
              <MaterialCommunityIcons name="chess-knight" size={24} color="#e3e3e3" />
            ) : (
              <Pressable style={styles.proContainer}>
                <Text style={[styles.rightText, { color: "#f7b1b1" }]}>Get PRO</Text>
                <Ionicons name="diamond-outline" size={24} color="#bbb1f7" />
              </Pressable>
            )}

            <Pressable style={styles.creditsContainer} onPress={() => navigation.navigate("MailBox", { isMy: true })}>
              <Text style={styles.creditsText}>{userData.credits}</Text>
              <FontAwesome5 name="coins" size={20} color="#e3e3e3" />
            </Pressable>

            {isMail && (
              <Pressable 
              style={styles.mailContainer}
              onPress={() => navigation.navigate("MailBox", { isMy: true })}
            >
              <AntDesign name="mail" size={24} color="#e3e3e3" />
              {hasNewMails && (
                <View style={styles.redDot} />
              )}
            </Pressable>
            ) 
            }
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingTop: 40, // Adjust for status bar
    paddingBottom: 10,
    backgroundColor: "#171717", // Dark background for the header
    flexDirection: "row", // Arrange children in a row
    alignItems: "center", // Vertically align content in the center
    justifyContent: "space-between", // Space out the elements
    top: 0, // Align at the top
    zIndex: 1, // Ensure it's above other components
    paddingHorizontal: 20, // Horizontal padding
  },
  titleContainer: {
    justifyContent: 'center', // Center title vertically
    alignItems: 'center', // Center title horizontally
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // White text for contrast
    letterSpacing: 2, // Add some space between the letters
    textAlign: "center", // Center the text horizontally within its container
  },
  rightTextContainer: {
    flexDirection: "row", // Align 'Get PRO' and icons in a row
    alignItems: "center", // Vertically center items
    gap: 20, // Space between the elements
  },
  extraElementContainer: {
    flexDirection: "row", // Keep the extra element in a row
    alignItems: "center", // Vertically align elements
    gap: 10, // Adjust gap between elements if needed
  },
  proContainer: {
    flexDirection: "row", // Arrange the text and icon in a row
    alignItems: "center", // Vertically center the text and icon
    gap: 5, // Space between the text and icon
  },
  rightText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right", // Align text to the right
    marginRight: 5, // Space between the text and icon
  },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  creditsText: {
    color: '#e3e3e3',
    fontSize: 20,
  },
  mailContainer: {
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "#171717",
  },
});

export default Header;
