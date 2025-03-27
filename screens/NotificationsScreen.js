import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableNativeFeedback,
  Modal,
  TextInput,
  Button,
  RefreshControl,
  Pressable
} from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Header from '../components/Header';
import { UserContext } from '../UserContext';
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen = () => {
  const { userData } = useContext(UserContext);
  const navigation = useNavigation();

  // Convert inboxMails to an array that includes the key.
  const initialMails = userData.inboxMails
    ? Object.entries(userData.inboxMails)
      .map(([key, mail]) => ({ key, ...mail }))
      // Sort by time descending (newest first)
      .sort((a, b) => {
        const aTime = a.time?.toDate ? a.time.toDate() : new Date(a.time);
        const bTime = b.time?.toDate ? b.time.toDate() : new Date(b.time);
        return bTime - aTime;
      })
    : [];

  // Local state for mails (so we can refresh independently)
  const [mails, setMails] = useState(initialMails);
  const [expandedMail, setExpandedMail] = useState(null);
  const [senders, setSenders] = useState({}); // Store senders' data

  // Modal-related state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState(null); // 'accept' or 'reject'
  const [selectedMail, setSelectedMail] = useState(null); // Holds the mail object (including key) and its index

  // Processing state to disable multiple clicks
  const [isProcessing, setIsProcessing] = useState(false);
  // Refresh control state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch the inbox mails from Firestore
  const refreshInboxMails = async () => {
    setRefreshing(true);
    try {
      const userDocRef = doc(db, "user", userData.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const inboxMails = userDocSnap.data().inboxMails || {};
        // Map the object into an array that includes the Firestore key and sort by date descending.
        const mailsArray = Object.entries(inboxMails)
          .map(([key, mail]) => ({ key, ...mail }))
          .sort((a, b) => {
            const aTime = a.time?.toDate ? a.time.toDate() : new Date(a.time);
            const bTime = b.time?.toDate ? b.time.toDate() : new Date(b.time);
            return bTime - aTime;
          });
        setMails(mailsArray);
      }
    } catch (error) {
      console.error("Error refreshing inbox mails:", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    // Refresh senders when mails update.
    const fetchSenders = async () => {
      const senderDatas = {};
      const senderIds = new Set();
      mails.forEach(mail => {
        if (mail.from) senderIds.add(mail.from);
        if (mail.type === 'follower' && mail.follower) senderIds.add(mail.follower);
      });
      for (let senderId of senderIds) {
        const userDocRef = doc(db, "user", senderId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          senderDatas[senderId] = userDocSnap.data();
        }
      }
      setSenders(senderDatas);
    };

    fetchSenders();
  }, [mails]);

  // Helper function to mark a mail as seen.
  const markMailAsSeen = async (mailKey) => {
    try {
      const userDocRef = doc(db, "user", userData.uid);
      await updateDoc(userDocRef, {
        [`inboxMails.${mailKey}.seen`]: true
      });
      // Update local state.
      setMails(prevMails => prevMails.map(mail => mail.key === mailKey ? { ...mail, seen: true } : mail));
    } catch (error) {
      console.error("Error marking mail as seen: ", error);
    }
  };

  // Toggle the expansion of a mail.
  const toggleMessageVisibility = async (index) => {
    const selectedMail = mails[index];
    if (expandedMail === index) {
      setExpandedMail(null);
    } else {
      // If the mail hasn't been seen, mark it as seen.
      if (!selectedMail.seen) {
        await markMailAsSeen(selectedMail.key);
      }
      setExpandedMail(index);
    }
  };

  // Format time ago from timestamp.
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Open modal for the selected action and mail details.
  const handleActionPress = (action, mail, index) => {
    setSelectedAction(action);
    setSelectedMail({ mail, index });
    setModalMessage('');
    setModalVisible(true);
  };

  const renderMail = ({ item, index }) => {
    const isExpanded = expandedMail === index;
    const senderId = item.type === 'follower' ? item.follower : item.from;
    const senderData = senders[senderId] || {};
    const senderName = senderData.name || "Unknown User";
    const senderAvatar = senderData.avatar || 'https://i.postimg.cc/52N67F8R/image.png';
    const timeAgo = formatTimeAgo(item.time);

    return (
      <View style={styles.mailContainer}>
        <TouchableNativeFeedback onPress={() => toggleMessageVisibility(index)}>
          <View>
            {item.type === 'follower' ? (

              <Pressable style={styles.mailContent}
                onPress={() => {
                  navigation.navigate("SearchTab", {
                    screen: "ArtistProfile",
                    params: { userId: item?.follower }
                  })
                }}
              >
                <Image source={{ uri: senderAvatar }} style={styles.senderImage} />
                <Text style={styles.mailSubject}>
                  {senderName} Started Following You!
                </Text>
              </Pressable>

            ) 
            :
             item.type === 'system' && item.status === 'accepted' ? (
              <Pressable 
              onPress={() => {
                navigation.navigate("SearchTab", {
                    screen: "ArtistProfile",
                    params: { userId: item?.from }
                  })
              }}
               style={styles.mailContent}>
                <Image source={{ uri: senderAvatar }} style={styles.senderImage} />
                <Text style={[styles.mailSubject, { color: '#5ec57b' }]}>
                  {senderName} Accepted Your Request!
                </Text>
              </Pressable>
            ) 
            : 
            item.type === 'system' && item.status === 'rejected' ? (
              <Pressable 
              onPress={() => {
                navigation.navigate("SearchTab", {
                    screen: "ArtistProfile",
                    params: { userId: item?.from }
                  })
              }}
               style={styles.mailContent}>
                <Image source={{ uri: senderAvatar }} style={styles.senderImage} />
                <Text style={[styles.mailSubject, { color: '#c55e5e' }]}>
                  {senderName} Rejected Your Request!
                </Text>
              </Pressable>
            )
             : 
             item.type === 'collab' && item.status === 'waiting' ? (
              <Pressable 
              onPress={() => {
                navigation.navigate("SearchTab", {
                    screen: "ArtistProfile",
                    params: { userId: item?.from }
                  })
              }}
               style={styles.mailContent}>
                <Image source={{ uri: senderAvatar }} style={styles.senderImage} />
                <Text style={[styles.mailSubject, { color: '#5e85c5' }]}>
                  {senderName} Sent You A Collab Request!
                </Text>
              </Pressable>
            ) : null}

            <Text style={styles.mailBody}>
              {isExpanded ? item.message : `${item.message?.slice(0, 100)}...`}
            </Text>

            {item.type === 'collab' && item.status === 'waiting' ? (
              <View style={styles.buttonContainer}>
                <TouchableNativeFeedback onPress={() => handleActionPress('accept', item, index)}>
                  <View style={[styles.button, { backgroundColor: '#358d4e' }]}>
                    <Text style={styles.buttonText}>Accept</Text>
                  </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={() => handleActionPress('reject', item, index)}>
                  <View style={[styles.button, { backgroundColor: '#8d3535' }]}>
                    <Text style={styles.buttonText}>Reject</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            ) : null}

            <Text style={styles.mailDate}>{timeAgo}</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  };

  // Accept function with processing disabled during execution.
  const accept = async (target, thisUser, mailFirestoreKey, message) => {
    try {
      const targetDocRef = doc(db, "user", target);
      const userDocRef = doc(db, "user", thisUser);
      const mailKey = Date.now().toString() + Math.random().toString(36).substring(2, 15);
      const newMail = {
        type: "system",
        from: thisUser,
        message: message,
        collabID: mailFirestoreKey,
        status: 'accepted',
        time: new Date(),
        seen: false,
      };
      await updateDoc(targetDocRef, {
        [`inboxMails.${mailKey}`]: newMail,
      });
      await updateDoc(userDocRef, {
        [`inboxMails.${mailFirestoreKey}.status`]: "accepted",
        [`inboxMails.${mailFirestoreKey}.collabID`]: mailKey
      });
    } catch (error) {
      console.error('Error in accept collab request:', error);
    }
  };

  // Reject function with processing disabled during execution.
  const reject = async (target, thisUser, mailFirestoreKey, message) => {
    try {
      const targetDocRef = doc(db, "user", target);
      const userDocRef = doc(db, "user", thisUser);
      const mailKey = Date.now().toString() + Math.random().toString(36).substring(2, 15);
      const newMail = {
        type: "system",
        from: thisUser,
        message: message,
        collabID: mailFirestoreKey,
        status: 'rejected',
        time: new Date(),
        seen: false,
      };
      await updateDoc(targetDocRef, {
        [`inboxMails.${mailKey}`]: newMail,
      });
      await updateDoc(userDocRef, {
        [`inboxMails.${mailFirestoreKey}.status`]: "rejected",
        [`inboxMails.${mailFirestoreKey}.collabID`]: mailKey
      });
    } catch (error) {
      console.error('Error in reject collab request:', error);
    }
  };

  // Handler for when Send button in modal is pressed.
  const handleSend = async () => {
    if (!selectedMail || isProcessing) return;
    setIsProcessing(true);
    const { mail } = selectedMail;
    const target = mail.from;
    const thisUser = userData.uid;
    const mailFirestoreKey = mail.key; // Use the actual Firestore key
    if (selectedAction === 'accept') {
      await accept(target, thisUser, mailFirestoreKey, modalMessage);
    } else if (selectedAction === 'reject') {
      await reject(target, thisUser, mailFirestoreKey, modalMessage);
    }
    setIsProcessing(false);
    setModalVisible(false);
    // Refresh inbox after completing the action.
    refreshInboxMails();
  };

  return (
    <View style={styles.container}>
      <Header isGoBack={true} title={"Inbox"} isProEle={false} />
      <FlatList
        style={styles.mainContainer}
        contentContainerStyle={styles.cardContainer}
        data={mails}
        keyExtractor={(item) => item.key}
        renderItem={renderMail}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshInboxMails} />
        }
        ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
        ListFooterComponent={<View style={{ height: 200 }} />}
      />

      {/* Modal for Accept/Reject message */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {selectedAction === 'accept' ? "Accept Request" : "Reject Request"}
            </Text>
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
                title="Cancel"
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

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    height: '100%',
  },
  mainContainer: {
    padding: 20,
  },
  cardContainer: {
    flexGrow: 1,
  },
  mailContainer: {
    marginBottom: 15,
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 8,
  },
  mailContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#3d3d3da3',
    borderRadius: 100,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  senderImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  mailSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    flexShrink: 1,
    maxWidth: '80%',
  },
  mailDate: {
    fontSize: 16,
    color: '#707070',
    marginTop: 5,
  },
  mailBody: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    gap: 10,
  },
  button: {
    backgroundColor: '#5e85c5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2E2E2E',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  noResults: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});
