import { StyleSheet, Text, View, TouchableNativeFeedback, Modal, TextInput, Button } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from "../UserContext";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const CollabButton = ({ target }) => {
  const { userData } = useContext(UserContext);
  const [isFollowed, setIsFollowed] = useState(false);

  // Modal-related state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if the target user is in the current user's following array
  useEffect(() => {
    if (userData && userData.following) {
      setIsFollowed(userData.following.includes(target));
    }
  }, [userData, target]);

  // Function to open the modal
  const collabUser = () => {
    setModalVisible(true);
  };

  // Request function that sends the collab request using Firestore update
  const request = async (target, message) => {
    try {
      setIsProcessing(true);
      const userDocRef = doc(db, "user", target);
      // Generate a unique mail key
      const mailKey =
        Date.now().toString() + Math.random().toString(36).substring(2, 15);
      // Build a new mail object
      const newMail = {
        type: "collab",
        from: userData.uid,
        message: message || "Hey, let's collab!",
        status: 'waiting',
        time: new Date(),
        seen: false,
      };

      // Update the target user's document with the new mail
      await updateDoc(userDocRef, {
        [`inboxMails.${mailKey}`]: newMail,
      });
    } catch (error) {
      console.error("Error sending collab request:", error);
    } finally {
      setIsProcessing(false);
      setModalVisible(false);
      setModalMessage('');
    }
  };

  // Handler for the Send button inside the modal
  const handleSend = () => {
    request(target, modalMessage);
  };

  return (
    <View style={styles.collabBtnContainer}>
      {isFollowed && (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple("#5e5e5e", true)}
          useForeground={true}
          onPress={collabUser}
        >
          <View style={styles.collabBtn}>
            <Text style={styles.collabBtnText}>Collab Bro?</Text>
          </View>
        </TouchableNativeFeedback>
      )}

      {/* Modal for entering a collab message */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Send Collab Request</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your message"
              placeholderTextColor="#aaa"
              value={modalMessage}
              onChangeText={setModalMessage}
            />
            <View style={styles.modalButtonContainer}>
              <Button
                title="Send"
                color="#358d71"
                onPress={handleSend}
                disabled={isProcessing}
              />
              <Button
                title="Close"
                color="#8d3535"
                onPress={() => setModalVisible(false)}
                disabled={isProcessing}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CollabButton;

const styles = StyleSheet.create({
  collabBtnContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-start",
  },
  collabBtn: {
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e3e3e3",
    overflow: "hidden",
    paddingHorizontal: 10,
  },
  collabBtnText: {
    color: "#e3e3e3",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: '80%',
    backgroundColor: "#13141b",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: '#e3e3e3'
  },
  modalInput: {
    height: 40,
    borderColor: "#e3e3e3",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
