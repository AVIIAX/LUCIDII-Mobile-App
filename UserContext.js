import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // Use onSnapshot instead of getDoc

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Listen for real-time changes to the user's document
        const userDocRef = doc(db, "user", user.uid);
        const unsubscribeUserData = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ uid: user.uid, ...docSnap.data() });
          } else {
            setUserData({ uid: user.uid });
          }
        });

        // Cleanup the real-time listener when the component is unmounted or user logs out
        return () => unsubscribeUserData();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup the auth state listener when the component unmounts
    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, loading, uid: userData?.uid }}>
      {children}
    </UserContext.Provider>
  );
};
