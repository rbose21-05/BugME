import sunnyBg from "../background/sunnybg.jpg";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

export default function LoginPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("Checking sign-in status...");

    useEffect(() => {
        let handledRedirect = false;

        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    handledRedirect = true;
                    navigate("/landing", { replace: true });
                }
            })
            .catch((error) => {
                console.error("Redirect sign-in error:", error.message);
                setStatus("Sign-in failed. Try again.");
            });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !handledRedirect) {
                navigate("/landing", { replace: true });
            } else if (!user) {
                setStatus("");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleGoogleLogin = async () => {
        try {
            setStatus("Redirecting to Google...");
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Login error:", error.message);
            setStatus("Sign-in failed. Try again.");
        }
    };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${sunnyBg})` }}
        >
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </a>
            </nav>

            <div className="flex flex-1 items-center justify-center bg-black/30">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Log In
                    </h2>

                    {status ? (
                        <p className="text-gray-600 mb-4">{status}</p>
                    ) : null}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={!!status && status !== "Sign-in failed. Try again."}
                        className="w-full py-3 bg-red-500 text-green-400 font-bold rounded-xl shadow-md hover:bg-red-600 transition disabled:opacity-60"
                    >
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
