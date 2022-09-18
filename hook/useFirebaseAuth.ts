import { useRecoilState } from 'recoil';
import authAtom from '../atom/authAtom';
import { useCallback, useEffect } from 'react';
import {
	getAuth,
	signInWithEmailAndPassword as firebaseSignIn,
	signOut as firebaseSignOut,
	User
} from 'firebase/auth';
import nookies from 'nookies';
import { createFirebaseApp } from '../firebase/clientApp';

const useFirebaseAuth = () => {
	const [authState, setAuthState] = useRecoilState(authAtom);

	const signInWithEmailAndPassword = useCallback((email: string, password: string) => {
		const app = createFirebaseApp();
		return firebaseSignIn(getAuth(app), email, password);
	}, []);

	const signOut = useCallback(
		() =>
			firebaseSignOut(getAuth(createFirebaseApp())).then(() => {
				setAuthState({
					authUser: null,
					loading: false
				});
				window.location.href = '/';
			}),
		[setAuthState]
	);

	const authStateChanged = useCallback(
		async (authState: User | null) => {
			if (!authState) {
				setAuthState({
					authUser: null,
					loading: false
				});
				nookies.set(undefined, 'token', '', { path: '/' });
				return;
			}
			setAuthState(old => ({
				...old,
				loading: true
			}));
			const token = await authState.getIdToken();
			nookies.set(undefined, 'token', token, { path: '/' });
			setAuthState({
				authUser: {
					uid: authState.uid,
					email: authState.email
				},
				loading: false
			});
		},
		[setAuthState]
	);

	useEffect(() => {
		const app = createFirebaseApp();
		const unsubscribe = getAuth(app).onIdTokenChanged(authStateChanged);
		return () => unsubscribe();
	}, [authStateChanged]);

	// force refresh the token every 10 minutes
	useEffect(() => {
		const handle = setInterval(async () => {
			const app = createFirebaseApp();
			const user = getAuth().currentUser;
			if (user) await user.getIdToken(true);
		}, 10 * 60 * 1000);

		// clean up setInterval
		return () => clearInterval(handle);
	}, []);

	return {
		authState,
		signInWithEmailAndPassword,
		signOut
	};
};

export default useFirebaseAuth;
