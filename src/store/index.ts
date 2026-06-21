// Redux store setup with redux-persist
// redux-persist saves the auth slice to localStorage so the user stays
// logged in when they refresh the page

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import authReducer  from "./authSlice";
import modalReducer from "./modalSlice";

// localStorage doesn't exist on the server (Next.js runs server-side too)
// so we need a fake storage that does nothing when we're on the server
const createNoopStorage = () => ({
  getItem()                             { return Promise.resolve(null);  },
  setItem(_key: string, value: unknown) { return Promise.resolve(value); },
  removeItem()                          { return Promise.resolve();      },
});

// use real localStorage in the browser, fake one on the server
const storage =
  typeof window !== "undefined"
    ? require("redux-persist/lib/storage").default
    : createNoopStorage();

// only save auth to localStorage, not modal state
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth:  authReducer,  // user info, loading state, subscription
  modal: modalReducer, // modal open/close, font size
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist uses some non-serializable actions internally, ignore them
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store); // needed for PersistGate in _app.tsx

export type RootState   = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
