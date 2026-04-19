import { auth } from "../firebase/credentials.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const registerUser = async (email, password, username) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        window.location.href = "/auth/login/";
    } catch (error) {
        console.error("Error al salir:", error);
    }
};