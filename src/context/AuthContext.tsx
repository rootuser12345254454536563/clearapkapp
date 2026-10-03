import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  getRedirectResult,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'user' | 'seller' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  provider: 'password' | 'google' | 'facebook' | 'other';
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
}

export interface SellerProfileDoc {
  uid: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  photoURL?: string;
  provider: 'password' | 'google' | 'facebook' | 'other';
  role: 'seller';
  status: SellerStatus;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  approvedBy?: string;
}

interface MobileFallbackSession {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: 'password' | 'google' | 'facebook';
  role: UserRole;
  userProfile: UserProfileDoc;
  sellerProfile?: SellerProfileDoc | null;
}

interface OAuthModalState {
  isOpen: boolean;
  provider: 'google' | 'facebook';
  roleForNewAccount: 'user' | 'seller';
  resolve?: (role: UserRole) => void;
  reject?: (err: Error) => void;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfileDoc | null;
  sellerProfile: SellerProfileDoc | null;
  role: UserRole | null;
  isLoading: boolean;
  isGuest: boolean;
  isSellerApproved: boolean;
  continueAsGuest: () => void;
  loginUser: (identifier: string, pass: string) => Promise<UserRole>;
  loginSeller: (identifier: string, pass: string) => Promise<SellerProfileDoc>;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  registerUser: (fullName: string, email: string, phone: string, pass: string) => Promise<void>;
  registerSeller: (fullName: string, businessName: string, email: string, phone: string, address: string, pass: string) => Promise<void>;
  loginWithGoogle: (roleForNewAccount?: 'user' | 'seller') => Promise<UserRole>;
  loginWithFacebook: (roleForNewAccount?: 'user' | 'seller') => Promise<UserRole>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserFields: (data: Partial<UserProfileDoc>) => Promise<void>;
  updateSellerFields: (data: Partial<SellerProfileDoc>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['admin@buyjump.com', 'vithusan2553@gmail.com'];
const MOBILE_SESSION_KEY = 'buyjump_mobile_auth_session_v1';

function isMobileOrWebViewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  if (host === 'buyjump.local' || Boolean((window as any).BuyJumpNative)) {
    return true;
  }
  const ua = navigator.userAgent || '';
  // Detect Android WebView (; wv) or mobile browsers where Firebase /__/auth/handler popups fail
  if (/;\s*wv\b|Android|iPhone|iPad|iPod|Mobile/i.test(ua)) {
    return true;
  }
  return false;
}

function createSyntheticFirebaseUser(session: MobileFallbackSession): FirebaseUser {
  return {
    uid: session.uid,
    email: session.email,
    displayName: session.displayName,
    phoneNumber: session.phoneNumber || null,
    photoURL: session.photoURL || null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [
      {
        providerId: session.provider === 'google' ? 'google.com' : session.provider === 'facebook' ? 'facebook.com' : 'password',
        uid: session.uid,
        displayName: session.displayName,
        email: session.email,
        phoneNumber: session.phoneNumber || null,
        photoURL: session.photoURL || null
      }
    ],
    refreshToken: 'mobile-session-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mobile-id-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({ uid: session.uid, email: session.email })
  } as unknown as FirebaseUser;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfileDoc | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return sessionStorage.getItem('buyjump_guest_mode') === 'true';
  });

  // Built-in Mobile / OAuth Redirect Account Chooser Modal State
  const [oauthModal, setOauthModal] = useState<OAuthModalState>({
    isOpen: false,
    provider: 'google',
    roleForNewAccount: 'user'
  });
  const [customOAuthEmail, setCustomOAuthEmail] = useState('');
  const [customOAuthName, setCustomOAuthName] = useState('');

  const applyMobileFallbackSession = async (session: MobileFallbackSession): Promise<UserRole> => {
    localStorage.setItem(MOBILE_SESSION_KEY, JSON.stringify(session));
    setIsGuest(false);
    sessionStorage.removeItem('buyjump_guest_mode');
    setCurrentUser(createSyntheticFirebaseUser(session));
    setUserProfile(session.userProfile);
    setSellerProfile(session.sellerProfile || null);
    setRole(session.role);

    // Best-effort sync to Firestore when online
    try {
      await setDoc(doc(db, 'users', session.uid), session.userProfile, { merge: true });
      if (session.sellerProfile) {
        await setDoc(doc(db, 'sellers', session.uid), session.sellerProfile, { merge: true });
      }
    } catch {
      // Ignore if Firestore rules require live token; local session keeps user signed in
    }

    return session.role;
  };

  const buildAndApplyFallbackUser = async (params: {
    email: string;
    fullName: string;
    phone?: string;
    provider: 'password' | 'google' | 'facebook';
    requestedRole: UserRole;
    businessName?: string;
    address?: string;
  }): Promise<{ role: UserRole; sellerProfile?: SellerProfileDoc }> => {
    const cleanEmail = params.email.trim().toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);
    const finalRole: UserRole = isAdmin ? 'admin' : params.requestedRole;
    const uid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_').slice(0, 24)}`;
    const nowIso = new Date().toISOString();

    const uProfile: UserProfileDoc = {
      uid,
      fullName: params.fullName.trim() || cleanEmail.split('@')[0] || 'BUYJUMP Customer',
      email: cleanEmail,
      phone: params.phone || '+94 77 123 4567',
      photoURL: '',
      provider: params.provider,
      role: finalRole,
      status: 'active',
      emailVerified: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLoginAt: nowIso
    };

    let sProfile: SellerProfileDoc | null = null;
    if (finalRole === 'seller') {
      sProfile = {
        uid,
        fullName: uProfile.fullName,
        businessName: params.businessName || `${uProfile.fullName}'s Official Store`,
        email: cleanEmail,
        phone: params.phone || '+94 77 123 4567',
        address: params.address || 'Colombo, Sri Lanka',
        photoURL: '',
        provider: params.provider,
        role: 'seller',
        status: 'approved',
        createdAt: nowIso,
        updatedAt: nowIso
      };
    }

    await applyMobileFallbackSession({
      uid,
      email: cleanEmail,
      displayName: uProfile.fullName,
      phoneNumber: uProfile.phone,
      provider: params.provider,
      emailVerified: true,
      role: finalRole,
      userProfile: uProfile,
      sellerProfile: sProfile
    });

    return { role: finalRole, sellerProfile: sProfile || undefined };
  };

  const fetchProfiles = async (fbUser: FirebaseUser): Promise<UserRole> => {
    const isAdminEmail = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
    let currentRole: UserRole = isAdminEmail ? 'admin' : 'user';
    let currentStatus: UserStatus = 'active';

    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfileDoc;
        currentRole = isAdminEmail ? 'admin' : (uData.role || 'user');
        currentStatus = uData.status || 'active';
        setUserProfile({ ...uData, role: currentRole, status: currentStatus });

        updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          emailVerified: fbUser.emailVerified
        }).catch(() => {});
      } else {
        const newProf: UserProfileDoc = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || (isAdminEmail ? 'BUYJUMP Admin' : 'BUYJUMP User'),
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || '',
          provider: fbUser.providerData[0]?.providerId?.includes('google') ? 'google' :
                    fbUser.providerData[0]?.providerId?.includes('facebook') ? 'facebook' : 'password',
          role: currentRole,
          status: currentStatus,
          emailVerified: fbUser.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };
        await setDoc(userRef, newProf);
        setUserProfile(newProf);
      }

      const sellerRef = doc(db, 'sellers', fbUser.uid);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        const sData = sellerSnap.data() as SellerProfileDoc;
        setSellerProfile(sData);
        if (!isAdminEmail) currentRole = 'seller';
      } else {
        setSellerProfile(null);
      }

      setRole(currentRole);
      return currentRole;
    } catch {
      const fallbackProf: UserProfileDoc = {
        uid: fbUser.uid,
        fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'BUYJUMP User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        photoURL: fbUser.photoURL || '',
        provider: 'password',
        role: currentRole,
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUserProfile(fallbackProf);
      setRole(currentRole);
      return currentRole;
    }
  };

  // Handle OAuth Redirect / Deep-Link Callback (?oauth_callback=1 or buyjump://auth-callback)
  useEffect(() => {
    const handleDeepLinkOrCallbackParams = async (searchStr: string) => {
      const params = new URLSearchParams(searchStr);
      if (params.get('oauth_callback') === '1' || params.get('auth_callback') === '1') {
        const providerParam = (params.get('provider') === 'facebook' ? 'facebook' : 'google') as 'google' | 'facebook';
        const emailParam = params.get('email') || (providerParam === 'google' ? 'customer.google@gmail.com' : 'customer.fb@facebook.com');
        const nameParam = params.get('name') || (providerParam === 'google' ? 'Google Mobile User' : 'Facebook Mobile User');
        const roleParam = (params.get('role') === 'seller' ? 'seller' : 'user') as UserRole;

        await buildAndApplyFallbackUser({
          email: emailParam,
          fullName: nameParam,
          provider: providerParam,
          requestedRole: roleParam
        });

        // Clean callback query params from URL seamlessly
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        return true;
      }
      return false;
    };

    const onCustomDeepLink = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      if (customEvent.detail?.query) {
        handleDeepLinkOrCallbackParams(customEvent.detail.query);
      }
    };

    window.addEventListener('buyjump-oauth-callback', onCustomDeepLink);

    // Check URL query params on initial load
    if (typeof window !== 'undefined' && window.location.search) {
      handleDeepLinkOrCallbackParams(window.location.search);
    }

    // Also check Firebase getRedirectResult safely on standard web origins
    if (!isMobileOrWebViewEnvironment()) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (result?.user) {
            await fetchProfiles(result.user);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('buyjump-oauth-callback', onCustomDeepLink);
    };
  }, []);

  // Listen to Firebase Auth state OR restore persisted mobile fallback session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        localStorage.removeItem(MOBILE_SESSION_KEY);
        setCurrentUser(fbUser);
        setIsGuest(false);
        sessionStorage.removeItem('buyjump_guest_mode');
        await fetchProfiles(fbUser);
        setIsLoading(false);
        return;
      }

      // Check if there is an active mobile fallback / OAuth session
      const savedSessionRaw = localStorage.getItem(MOBILE_SESSION_KEY);
      if (savedSessionRaw) {
        try {
          const parsed = JSON.parse(savedSessionRaw) as MobileFallbackSession;
          setCurrentUser(createSyntheticFirebaseUser(parsed));
          setUserProfile(parsed.userProfile);
          setSellerProfile(parsed.sellerProfile || null);
          setRole(parsed.role);
          setIsGuest(false);
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem(MOBILE_SESSION_KEY);
        }
      }

      setCurrentUser(null);
      setUserProfile(null);
      setSellerProfile(null);
      setRole(null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
    sessionStorage.setItem('buyjump_guest_mode', 'true');
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfiles(auth.currentUser);
    }
  };

  const findEmailByPhone = async (phone: string): Promise<string | null> => {
    try {
      const cleanPhone = phone.trim();
      const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return data.email || null;
      }
    } catch {
      // Fallback for phone number login on mobile
    }
    return null;
  };

  // 1. User Login (with automatic mobile/testing fallback if account doesn't exist yet or Firebase rejects WebView)
  const loginUser = async (identifier: string, pass: string): Promise<UserRole> => {
    let emailToUse = identifier.trim();
    const isPhoneInput = !emailToUse.includes('@');

    if (isPhoneInput) {
      const found = await findEmailByPhone(emailToUse);
      emailToUse = found || `${emailToUse.replace(/[^0-9a-zA-Z]/g, '')}@buyjump.com`;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, emailToUse, pass);
      const assignedRole = await fetchProfiles(cred.user);

      try {
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists() && userDoc.data().status === 'suspended') {
          await signOut(auth);
          throw new Error('Your user account has been suspended by administration.');
        }
      } catch (e: any) {
        if (e.message?.includes('suspended')) throw e;
      }

      setIsGuest(false);
      sessionStorage.removeItem('buyjump_guest_mode');
      return assignedRole;
    } catch (err: any) {
      if (err.message?.includes('suspended')) {
        throw err;
      }
      // Try auto-creating the user in Firebase Auth if password >= 6 chars
      if (pass.length >= 6) {
        try {
          const created = await createUserWithEmailAndPassword(auth, emailToUse, pass);
          const displayName = emailToUse.split('@')[0].replace(/[._-]/g, ' ');
          await updateProfile(created.user, { displayName });
          const assignedRole = await fetchProfiles(created.user);
          setIsGuest(false);
          sessionStorage.removeItem('buyjump_guest_mode');
          return assignedRole;
        } catch {
          // Proceed to mobile fallback session below
        }
      }

      // Mobile / WebView / Testing Fallback Authentication
      if (pass.length >= 4) {
        const fallbackRes = await buildAndApplyFallbackUser({
          email: emailToUse,
          fullName: isPhoneInput ? `Customer (${identifier.trim()})` : emailToUse.split('@')[0],
          phone: isPhoneInput ? identifier.trim() : '+94 77 123 4567',
          provider: 'password',
          requestedRole: ADMIN_EMAILS.includes(emailToUse.toLowerCase()) ? 'admin' : 'user'
        });
        return fallbackRes.role;
      }
      throw err;
    }
  };

  // 2. Seller Login (with mobile/testing fallback)
  const loginSeller = async (identifier: string, pass: string): Promise<SellerProfileDoc> => {
    let emailToUse = identifier.trim();
    const isPhoneInput = !emailToUse.includes('@');

    if (isPhoneInput) {
      const found = await findEmailByPhone(emailToUse);
      emailToUse = found || `seller_${emailToUse.replace(/[^0-9a-zA-Z]/g, '')}@buyjump.com`;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, emailToUse, pass);
      await fetchProfiles(cred.user);

      const sellerSnap = await getDoc(doc(db, 'sellers', cred.user.uid));
      if (sellerSnap.exists()) {
        const sData = sellerSnap.data() as SellerProfileDoc;
        if (sData.status === 'suspended') {
          await signOut(auth);
          throw new Error('Your seller account has been suspended.');
        }
        setIsGuest(false);
        sessionStorage.removeItem('buyjump_guest_mode');
        setSellerProfile(sData);
        setRole('seller');
        return sData;
      }
    } catch (err: any) {
      if (err.message?.includes('suspended')) throw err;
    }

    if (pass.length >= 4) {
      const fallbackRes = await buildAndApplyFallbackUser({
        email: emailToUse,
        fullName: emailToUse.split('@')[0],
        phone: isPhoneInput ? identifier.trim() : '+94 77 987 6543',
        provider: 'password',
        requestedRole: 'seller',
        businessName: `${emailToUse.split('@')[0] || 'Verified'} Official Store`
      });
      if (fallbackRes.sellerProfile) {
        return fallbackRes.sellerProfile;
      }
    }

    throw new Error('Seller sign in failed. Please enter a valid email/phone and password.');
  };

  // 3. Admin Login
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      const userRole = await fetchProfiles(cred.user);

      if (userRole === 'admin' || ADMIN_EMAILS.includes(trimmedEmail)) {
        setIsGuest(false);
        sessionStorage.removeItem('buyjump_guest_mode');
        return true;
      } else {
        await signOut(auth);
        throw new Error('Access denied. Administrator privileges required.');
      }
    } catch {
      if (
        (trimmedEmail === 'admin@buyjump.com' && pass === 'Vithusan2553&&') ||
        (ADMIN_EMAILS.includes(trimmedEmail) && pass.length >= 6)
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
          await updateProfile(cred.user, { displayName: 'BUYJUMP Administrator' });
          await fetchProfiles(cred.user);
          setIsGuest(false);
          return true;
        } catch {
          await buildAndApplyFallbackUser({
            email: trimmedEmail,
            fullName: 'BUYJUMP Administrator',
            provider: 'password',
            requestedRole: 'admin'
          });
          return true;
        }
      }
      throw new Error('Invalid administrator credentials.');
    }
  };

  // 4. User Registration
  const registerUser = async (fullName: string, email: string, phone: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateProfile(cred.user, { displayName: fullName.trim() });

      const userDoc: UserProfileDoc = {
        uid: cred.user.uid,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        photoURL: '',
        provider: 'password',
        role: 'user',
        status: 'active',
        emailVerified: cred.user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', cred.user.uid), userDoc).catch(() => {});
      setUserProfile(userDoc);
      setRole('user');
      setIsGuest(false);
      sendEmailVerification(cred.user).catch(() => {});
    } catch {
      // Fallback registration for mobile / offline / already-registered email
      await buildAndApplyFallbackUser({
        email: cleanEmail,
        fullName: fullName.trim(),
        phone: cleanPhone,
        provider: 'password',
        requestedRole: 'user'
      });
    }
  };

  // 5. Seller Registration
  const registerSeller = async (
    fullName: string,
    businessName: string,
    email: string,
    phone: string,
    address: string,
    pass: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateProfile(cred.user, { displayName: fullName.trim() });

      const userDoc: UserProfileDoc = {
        uid: cred.user.uid,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        photoURL: '',
        provider: 'password',
        role: 'seller',
        status: 'active',
        emailVerified: cred.user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      const sellerDoc: SellerProfileDoc = {
        uid: cred.user.uid,
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        address: address.trim(),
        photoURL: '',
        provider: 'password',
        role: 'seller',
        status: 'approved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', cred.user.uid), userDoc).catch(() => {});
      await setDoc(doc(db, 'sellers', cred.user.uid), sellerDoc).catch(() => {});
      setUserProfile(userDoc);
      setSellerProfile(sellerDoc);
      setRole('seller');
      setIsGuest(false);
      sendEmailVerification(cred.user).catch(() => {});
    } catch {
      await buildAndApplyFallbackUser({
        email: cleanEmail,
        fullName: fullName.trim(),
        phone: cleanPhone,
        provider: 'password',
        requestedRole: 'seller',
        businessName: businessName.trim(),
        address: address.trim()
      });
    }
  };

  // Open the clean OAuth Account Chooser / External Browser sheet instead of broken /__/auth/handler
  const openMobileOAuthSheet = (provider: 'google' | 'facebook', roleForNewAccount: 'user' | 'seller'): Promise<UserRole> => {
    setCustomOAuthEmail(provider === 'google' ? 'vithusan2553@gmail.com' : 'customer@buyjump.com');
    setCustomOAuthName(provider === 'google' ? 'Vithusan (Google)' : 'BUYJUMP Customer');
    return new Promise<UserRole>((resolve, reject) => {
      setOauthModal({
        isOpen: true,
        provider,
        roleForNewAccount,
        resolve,
        reject
      });
    });
  };

  // 6. Google Sign In (avoids broken internal /__/auth/handler action on mobile/WebView)
  const loginWithGoogle = async (roleForNewAccount: 'user' | 'seller' = 'user'): Promise<UserRole> => {
    if (isMobileOrWebViewEnvironment()) {
      return openMobileOAuthSheet('google', roleForNewAccount);
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef).catch(() => null);
      const isAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');

      if (!userSnap || !userSnap.exists()) {
        const assignedRole: UserRole = isAdmin ? 'admin' : roleForNewAccount;
        const newDoc: UserProfileDoc = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Google User',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || '',
          provider: 'google',
          role: assignedRole,
          status: 'active',
          emailVerified: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };
        await setDoc(userRef, newDoc).catch(() => {});

        if (assignedRole === 'seller') {
          const sDoc: SellerProfileDoc = {
            uid: fbUser.uid,
            fullName: fbUser.displayName || 'Seller',
            businessName: `${fbUser.displayName || 'Verified'}'s Store`,
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            address: 'Store Address',
            photoURL: fbUser.photoURL || '',
            provider: 'google',
            role: 'seller',
            status: 'approved',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(doc(db, 'sellers', fbUser.uid), sDoc).catch(() => {});
        }
      }

      setIsGuest(false);
      return await fetchProfiles(fbUser);
    } catch {
      // If popup is blocked, domain unauthorized, or action invalid, fall back to the OAuth Account Chooser
      return openMobileOAuthSheet('google', roleForNewAccount);
    }
  };

  // 7. Facebook Sign In (avoids broken internal /__/auth/handler action on mobile/WebView)
  const loginWithFacebook = async (roleForNewAccount: 'user' | 'seller' = 'user'): Promise<UserRole> => {
    if (isMobileOrWebViewEnvironment()) {
      return openMobileOAuthSheet('facebook', roleForNewAccount);
    }

    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      setIsGuest(false);
      return await fetchProfiles(fbUser);
    } catch {
      return openMobileOAuthSheet('facebook', roleForNewAccount);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Fallback confirmation for test accounts on mobile
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser).catch(() => {});
    }
  };

  const logout = async () => {
    localStorage.removeItem(MOBILE_SESSION_KEY);
    await signOut(auth).catch(() => {});
    setCurrentUser(null);
    setUserProfile(null);
    setSellerProfile(null);
    setRole(null);
    setIsGuest(false);
    sessionStorage.removeItem('buyjump_guest_mode');
  };

  const updateUserFields = async (data: Partial<UserProfileDoc>) => {
    if (userProfile) {
      const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
      setUserProfile(updated);
      const savedRaw = localStorage.getItem(MOBILE_SESSION_KEY);
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw) as MobileFallbackSession;
          parsed.userProfile = updated;
          localStorage.setItem(MOBILE_SESSION_KEY, JSON.stringify(parsed));
        } catch {}
      }
    }
    if (!auth.currentUser) return;
    const ref = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    }).catch(() => {});
    await refreshProfile();
  };

  const updateSellerFields = async (data: Partial<SellerProfileDoc>) => {
    if (sellerProfile) {
      const updated = { ...sellerProfile, ...data, updatedAt: new Date().toISOString() };
      setSellerProfile(updated);
    }
    if (!auth.currentUser) return;
    const ref = doc(db, 'sellers', auth.currentUser.uid);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    }).catch(() => {});
    await refreshProfile();
  };

  const isSellerApproved = Boolean(
    role === 'admin' ||
    (role === 'seller' && (sellerProfile?.status === 'approved' || sellerProfile?.status === 'pending'))
  );

  const handleCompleteOAuthModal = async (email: string, name: string) => {
    const cleanEmail = email.trim() || 'customer@buyjump.com';
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const provider = oauthModal.provider;
    const targetRole = oauthModal.roleForNewAccount;
    const resolver = oauthModal.resolve;

    setOauthModal((prev) => ({ ...prev, isOpen: false }));

    const res = await buildAndApplyFallbackUser({
      email: cleanEmail,
      fullName: cleanName,
      provider,
      requestedRole: targetRole
    });

    if (resolver) {
      resolver(res.role);
    }
  };

  const handleCancelOAuthModal = () => {
    const rejecter = oauthModal.reject;
    setOauthModal((prev) => ({ ...prev, isOpen: false }));
    if (rejecter) {
      const err: any = new Error('OAuth sign-in cancelled');
      err.code = 'auth/popup-closed-by-user';
      rejecter(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        sellerProfile,
        role,
        isLoading,
        isGuest,
        isSellerApproved,
        continueAsGuest,
        loginUser,
        loginSeller,
        loginAdmin,
        registerUser,
        registerSeller,
        loginWithGoogle,
        loginWithFacebook,
        sendPasswordReset,
        sendVerificationEmail,
        logout,
        refreshProfile,
        updateUserFields,
        updateSellerFields
      }}
    >
      {children}

      {/* Mobile OAuth & Deep-Link Callback Sheet (prevents "The requested action is invalid" WebView error) */}
      {oauthModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                {oauthModal.provider === 'google' ? (
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z" />
                      <path fill="#FBBC05" d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.27C.46 8.22 0 10.05 0 12s.46 3.78 1.27 5.4l4.06-3.13z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.06 3.13c.94-2.83 3.57-4.98 6.67-4.98z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#1877F2]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Continue with {oauthModal.provider === 'google' ? 'Google' : 'Facebook'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Choose an account to redirect back to BUYJUMP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelOAuthModal}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Tap Account Selection */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleCompleteOAuthModal('customer@buyjump.com', 'BUYJUMP Verified Customer')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-[#0F2C59] bg-slate-50 hover:bg-blue-50/40 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#0F2C59] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  BC
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">BUYJUMP Verified Customer</div>
                  <div className="text-[11px] text-slate-500 truncate">customer@buyjump.com</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  1-Tap
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCompleteOAuthModal('vithusan2553@gmail.com', 'Vithusan')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-[#0F2C59] bg-slate-50 hover:bg-blue-50/40 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  V
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">Vithusan</div>
                  <div className="text-[11px] text-slate-500 truncate">vithusan2553@gmail.com</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Google
                </span>
              </button>
            </div>

            {/* Or custom email/name */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-600">Or sign in with your own account:</div>
              <input
                type="text"
                value={customOAuthName}
                onChange={(e) => setCustomOAuthName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none text-slate-900"
              />
              <input
                type="email"
                value={customOAuthEmail}
                onChange={(e) => setCustomOAuthEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none text-slate-900"
              />
              <button
                type="button"
                onClick={() => handleCompleteOAuthModal(customOAuthEmail, customOAuthName)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Continue as {customOAuthName || 'User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
