import { collection, doc, getDocs, setDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export const getUserFavorites = async (uid) => {
  const favsRef = collection(db, 'users', uid, 'favorites');
  const snap = await getDocs(favsRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addFavorite = async (uid, song) => {
  const favsRef = doc(db, 'users', uid, 'favorites', song.id);
  await setDoc(favsRef, song);
};

export const getUserDanceHistory = async (uid) => {
  const historyRef = collection(db, 'users', uid, 'danceHistory');
  const q = query(historyRef, orderBy('lastPlayedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDanceProgress = async (uid, danceData) => {
  const historyRef = collection(db, 'users', uid, 'danceHistory');
  await addDoc(historyRef, {
    ...danceData,
    lastPlayedAt: new Date()
  });
};
