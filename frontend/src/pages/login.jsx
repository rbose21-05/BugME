import { initializeApp } from "firebase/app";
import sunnyBg from "../background/sunnybg.jpg";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
} from "firebase/auth";
import { useEffect } from "react";

const firebaseConfig = {
    apiKey: "AIzaSyBXvbqpmHNT4AwqF24fkZBTnS81XKTAUAA",
    authDomain: "bugme-ed29d.firebaseapp.com",
    projectId: "bugme-ed29d",
    storageBucket: "bugme-ed29d.firebasestorage.app",
    messagingSenderId: "869694226988",
    appId: "1:869694226988:web:d5b9024a22964cdba28789",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function LoginPage() {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("✅ User is already logged in:", user);
                window.location.href = "/landing"; // redirect
            }
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            console.log("✅ User signed in:", user);
            console.log("🔑 Token:", token);

            // Optionally redirect here as well
            window.location.href = "/landing";
        } catch (error) {
            console.error("❌ Login error:", error.message);
        }
    };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${sunnyBg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </a>
            </nav>

            {/* Main content */}
            <div className="flex flex-1 items-center justify-center bg-black/30">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Log In
                    </h2>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-3 bg-red-500 text-green-400 font-bold rounded-xl shadow-md hover:bg-red-600 transition"
                    >
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
