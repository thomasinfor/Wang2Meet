"use client"
import React from "react";
import { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, getAuth, signInWithPopup, signInWithRedirect, signOut, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStatus } from "@/context/Status";

const firebaseConfig = {
  apiKey: "AIzaSyBemPvV-6idk0CPddSa1kS0M6jXVtcH380",
  authDomain: process.env.NODE_ENV === 'development' ? "when2meet-11dfe.firebaseapp.com" : "w2m.wang.works",
  projectId: "when2meet-11dfe",
  storageBucket: "when2meet-11dfe.appspot.com",
  messagingSenderId: "344365803313",
  appId: "1:344365803313:web:d7741bb61260898ef37210",
  measurementId: "G-0P4MSW3QPS"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext({ user: null });
function STORAGE_KEY(x) { return "Wang2Meet_" + x; }

export const AuthContextProvider = ({ children }) => {
  const { message } = useStatus();
  const [user, setUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => { unsubscribe(); };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    if (window.confirm(`
Please **DON'T** sign in with in-app browser like Instagram, Facebook or LINE browser. Google Oauth blocks access from insecure browsers.
On mobile devices, use Chrome or Safari instead.

請**勿**使用應用程式內建瀏覽器登入，如 IG、FB 或 LINE。Google Oauth 拒絕來自不安全瀏覽器的連線。
若為行動裝置，請在 Chrome 或 Safari 上登入。

Login link: https://w2m.wang.works/sign-in
    `.trim())) {
      // const useragent = navigator.userAgent || navigator.vendor || window.opera;
      // const isInAppBrowser = /\Wwv\W/.test(useragent);
      // if (isInAppBrowser) {
      //     window.alert(
      //       "Google Sign-In may not work in this in-app browser.\n" +
      //       "Try opening https://w2m.wang.works in your default browser (e.g., Chrome, Safari)."
      //     );
      // }
      if (process.env.NODE_ENV === 'development')
        await signInWithPopup(auth, provider);
      else
        await signInWithRedirect(auth, provider);
      window.location.reload();
    } else {
      navigator.clipboard.writeText(window.location.origin + "/sign-in");
      message("Sign-in link copied", { variant: "success" });
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const request = useCallback(async (method, url, {
    auth=true,
    json=true,
    newToken=false,
    ...x
  } = {}) => {
    // console.log(`request to ${url}`);
    try {
      const headers = {};
      if (json) headers['Content-Type'] = 'application/json';
      if (user && auth) headers['Authorization'] = `Bearer ${await user.getIdToken(newToken)}`;
      const res = await fetch(url, {
        ...x,
        headers: { ...headers, ...(x.headers || {}) },
        body: x.body && json ? JSON.stringify(x.body) : x.body,
        method,
      });
      return res;
    } catch(e) {
      console.error(e);
      return { ok: false };
    }
  }, [user]);

  const updateUser = async profile => {
    const res = await updateProfile(auth.currentUser, profile);
    if ("displayName" in profile) {
      let res = await request('GET', "/api/me", { newToken: true });
      if (!res.ok) {
        console.log(await res.text());
      }
    }
    window.location.reload();
    return res;
  }

  const [history, setHistory] = useState(null);
  useEffect(() => {
    try {
      setHistory(JSON.parse(window.localStorage.getItem(STORAGE_KEY`history`)) || []);
    } catch(e) {
      console.error(e);
      window.localStorage.removeItem(STORAGE_KEY`history`);
      setHistory([]);
    }
  }, [setHistory]);
  useEffect(() => {
    if (history !== null){
      window.localStorage.setItem(STORAGE_KEY`history`, JSON.stringify(history));
    }
  }, [history]);
  const addHistory = useCallback(config => {
    setHistory(h => [].concat([{ ...config, collection: undefined }], h.filter(e => e.id !== config.id)).slice(0, 10));
  }, [setHistory]);
  const delHistory = useCallback(id => {
    setHistory(h => h.filter(e => e.id !== id));
  }, [setHistory]);

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{
        user,
        request,
        signIn,
        logOut,
        updateUser,
        history: history || [],
        addHistory,
        delHistory,
    }}>
       {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
