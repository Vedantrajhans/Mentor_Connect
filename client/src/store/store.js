import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userSlice';

// Persist configuration - only for auth
const persistConfig = {
  key: 'mentorconnect-auth',
  version: 1,
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Only persist these fields
};

// Create persisted reducer
const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Configure store
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);
