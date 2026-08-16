import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithCustomToken,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from './core';

export { auth };

export const setupRecaptcha = (containerId: string | HTMLElement) => {
  // 1. Clear previous recaptcha instance if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      // Ignore clear error if instance wasn't rendered yet
    }
    (window as any).recaptchaVerifier = null;
  }
  
  // 2. Locate container element
  let targetContainer: HTMLElement | null = null;
  if (typeof containerId === 'string') {
    targetContainer = document.getElementById(containerId);
  } else {
    targetContainer = containerId;
  }

  if (!targetContainer) {
    throw new Error('reCAPTCHA container element not found');
  }

  // 3. Clean up container content
  targetContainer.innerHTML = '';

  // 4. Instantiate new RecaptchaVerifier safely
  try {
    const verifier = new RecaptchaVerifier(auth, targetContainer, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // reCAPTCHA expired
      }
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (error: any) {
    console.error('RecaptchaVerifier creation error:', error);
    throw error;
  }
};

export const signInWithPhone = async (phoneNumber: string, appVerifier: any): Promise<ConfirmationResult> => {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error) {
    console.error('Error signing in with phone:', error);
    throw error;
  }
};

export const signInWithAirtelCustomToken = async (customToken: string) => {
  return signInWithCustomToken(auth, customToken);
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
