import { atom } from 'recoil';

interface AuthInfo {
	authUser: any;
	loading: boolean;
}

const authAtom = atom<AuthInfo>({
	key: 'authAtom',
	default: {
		authUser: null,
		loading: true
	}
});

export default authAtom;
