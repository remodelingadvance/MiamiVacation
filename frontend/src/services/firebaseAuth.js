import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseClientAuth } from '../config/firebase';

const createProvider = (providerName) => {
  if (providerName === 'google') {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  }

  if (providerName === 'apple') {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    return provider;
  }

  throw new Error('Unsupported authentication provider');
};

export const signInWithFirebaseProvider = async (providerName) => {
  const auth = getFirebaseClientAuth();
  const provider = createProvider(providerName);
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  const providerId = result.providerId || provider.providerId;

  return {
    idToken,
    provider: providerId,
    profile: {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      phone: result.user.phoneNumber,
      photoURL: result.user.photoURL,
      provider: providerId,
    },
  };
};
