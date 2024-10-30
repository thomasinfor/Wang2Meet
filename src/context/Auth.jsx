"use client"
import React from "react";
import { useContext, createContext, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLocalStorageState } from '@toolpad/core';
import { useDialogs } from '@toolpad/core/useDialogs';
import { onAuthStateChanged, getAuth, signInWithPopup, signInWithRedirect, signOut, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { STORAGE_KEY } from '@/utils';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinkIcon from '@mui/icons-material/Link';
import CheckIcon from '@mui/icons-material/Check';
import Typography from "@mui/material/Typography";
import InAppBrowsersImage from "@assets/in-app-browsers.png";

const firebaseConfig = {
  apiKey: "AIzaSyBemPvV-6idk0CPddSa1kS0M6jXVtcH380",
  authDomain: process.env.NODE_ENV === 'development' ? "when2meet-11dfe.firebaseapp.com" : "w2m.wang.works",
  projectId: "when2meet-11dfe",
  storageBucket: "when2meet-11dfe.appspot.com",
  messagingSenderId: "344365803313",
  appId: "1:344365803313:web:d7741bb61260898ef37210",
  measurementId: "G-0P4MSW3QPS"
};
const vapidKey = "BEp8Kz7HnEAnOruo3SEBcYJ50ziygXvI8A2eeHXxlW-P60PEx9kK9WCUfr7MSsLBXczx37fj8YSvOBBq87oombI";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext({ user: null });

function SignInAlert({ open, onClose }) {
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (showCopied) {
      const id = setTimeout(() => setShowCopied(false), 1000);
      return () => clearTimeout(id);
    }
  }, [showCopied, setShowCopied]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(false)}>
      <DialogTitle>In-App browser warning</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ mb: 1 }}>
          Please <b>DON&apos;T</b> sign in with in-app browser like Instagram, Facebook or LINE browser. Google Oauth blocks access from insecure browsers.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          On mobile devices, use Chrome or Safari instead.
        </Typography>
        <Typography sx={{ mb: 1 }}>
          請 <b>勿</b> 使用應用程式內建瀏覽器登入，如 IG、FB 或 LINE。Google Oauth 拒絕來自不安全瀏覽器的連線。
        </Typography>
        <Typography sx={{ mb: 1 }}>
          若為行動裝置，請在 Chrome 或 Safari 上登入。
        </Typography>
        <Image alt="in-app-browsers.png" src={InAppBrowsersImage} style={{ width: "100%", height: "auto" }}/>
      </DialogContent>
      <DialogActions sx={{ px: 2 }}>
        <Button
          startIcon={showCopied ? <CheckIcon/> : <LinkIcon/>}
          onClick={() => {
            navigator.clipboard.writeText(window.location.origin + "/sign-in");
            setShowCopied(true);
          }}
          sx={{ mr: 'auto' }}
        >{showCopied ? "Copied" : "Copy link"}</Button>
        <Button onClick={() => onClose(false)} color="error">Leave</Button>
        <Button onClick={() => onClose(true)} variant="contained">Sign me in</Button>
      </DialogActions>
    </Dialog>
  );
}

export const AuthContextProvider = ({ children }) => {
  const dialogs = useDialogs();
  const [user, setUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => { unsubscribe(); };
  }, []);

  const signIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    if (await dialogs.open(SignInAlert)) {
      if (process.env.NODE_ENV === 'development')
        await signInWithPopup(auth, provider);
      else
        await signInWithRedirect(auth, provider);
      window.location.reload();
    }
  }, [dialogs]);

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

  const sendFCMToken = async () => {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey });
    // const token = "TOKEN";
    console.log("Token generated : ", token);
    const res = await request("POST", "/api/me", {
      body: { FCMToken: token }
    });
    if (!res.ok) {
      window.alert("Request Failed.");
    }
  }


  const [history, setHistory] = useLocalStorageState(STORAGE_KEY`history`, null, {
    codec: {
      parse: v => {
        try {
          return JSON.parse(v);
        } catch(e) {
          console.log(e);
          return [];
        }
      },
      stringify: v => JSON.stringify(v)
    }
  });
  useEffect(() => console.log(history.map(e => e.id).join("\n")), [history]);
  useEffect(() => console.log("setHistory"), []);
  const addHistory = useCallback(config => {
    setHistory(h => [].concat([{ ...config, collection: undefined }], (h || []).filter(e => e.id !== config.id)).slice(0, 100));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const delHistory = useCallback(id => {
    setHistory(h => (h || []).filter(e => e.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{
      user,
      request,
      signIn,
      logOut,
      updateUser,
      sendFCMToken,
      history: history || [],
      addHistory,
      delHistory,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
