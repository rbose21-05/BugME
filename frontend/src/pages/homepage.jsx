import sunnyBg from "../background/sunnybg.jpg";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import sticker from "../cats/maincat.png"; // fixed relative path
import "./HomePage.css";

export default function HomePage() {
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            console.log("User state changed:", currentUser);
        });

        return () => unsubscribe();
    }, [auth]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col relative"
            style={{ backgroundImage: `url(${sunnyBg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black !text-black">
                <div className="flex space-x-6">
                    <a href="/">
                        <button className="text-black hover:text-green-300 transition">
                            Home
                        </button>
                    </a>
                    <a href="/about">
                        <button className="text-black hover:text-green-300 transition">
                            About
                        </button>
                    </a>
                </div>
                <div className="flex space-x-6">
                    {!user ? (
                        <a href="/login">
                            <button className="text-black hover:text-green-300 transition">
                                Log In
                            </button>
                        </a>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="hover:text-red-300 transition"
                        >
                            Log Out
                        </button>
                    )}
                </div>
            </nav>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center flex-1 text-white bg-black/30 relative">
                <img
                    src={sticker}
                    alt="sticker"
                    className="w-50 h-50 absolute bottom-8 right-8 levitate"
                />

                <h1 className="text-9xl mb-12 drop-shadow-lg silly-font">
                    BugME!
                </h1>
                <p className="text-lg max-w-2xl text-center mb-6 drop-shadow-md">
                    Your AI-powered companion for smarter studying, quizzes, and
                    deadlines.
                </p>
                <button
                    onClick={() => (window.location.href = "/login")}
                    className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
