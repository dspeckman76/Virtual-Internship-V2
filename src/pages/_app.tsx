// _app.tsx - wraps every page in the app
// Sets up Redux, listens for Firebase auth changes, and shows the auth modal
// Also resets subscription to "basic" on every login/logout so persisted state doesn't carry over

import type { AppProps } from "next/app";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, persistor, RootState } from "@/store";
import { setUser, setSubscription } from "@/store/authSlice";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthModal from "@/components/AuthModal";
import Layout from "@/components/Layout";
import { PersistGate } from "redux-persist/integration/react";
import "@/styles/globals.css";

// AppContent is a separate component so it can use Redux hooks
// (hooks need to be inside the Provider)
function AppContent({ Component, pageProps }: AppProps) {
  const dispatch    = useDispatch();
  const isModalOpen = useSelector((state: RootState) => state.modal.isOpen);

  // listen for login/logout events from Firebase and sync to Redux
  // resets subscription to "basic" every time so a previous session's
  // persisted plan doesn't bleed into a new login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email }));
        dispatch(setSubscription("basic")); // always start fresh on login
      } else {
        dispatch(setUser(null));
        dispatch(setSubscription("basic")); // also reset on logout
      }
    });
    return () => unsubscribe(); // stop listening when component unmounts
  }, [dispatch]);

  return (
    <Layout>
      <Component {...pageProps} />
      {/* auth modal is global - any page can trigger it via Redux */}
      {isModalOpen && <AuthModal />}
    </Layout>
  );
}

// PersistGate waits for localStorage to load before rendering
// so the user doesn't see a flash of logged-out state
export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent {...props} />
      </PersistGate>
    </Provider>
  );
}