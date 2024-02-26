"use client"
import { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, getAuth, signInWithPopup, signOut, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import ErrorBoundary from '@/components/ErrorBoundary';

const firebaseConfig = {
  apiKey: "AIzaSyBemPvV-6idk0CPddSa1kS0M6jXVtcH380",
  authDomain: "when2meet-11dfe.firebaseapp.com",
  projectId: "when2meet-11dfe",
  storageBucket: "when2meet-11dfe.appspot.com",
  messagingSenderId: "344365803313",
  appId: "1:344365803313:web:d7741bb61260898ef37210",
  measurementId: "G-0P4MSW3QPS"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext({ user: null });

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => { unsubscribe(); };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const updateUser = async profile => {
    const res = await updateProfile(auth.currentUser, profile);
    if ("displayName" in profile) {
      let res = await fetch("/api/update-name", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: auth.currentUser.displayName,
          email: auth.currentUser.email,
        })
      });
      if (!res.ok) {
        console.log(await res.text());
      }
    }
    window.location.reload();
    return res;
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, signIn, logOut, updateUser }}>
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
