import sunnyBg from "../background/sunnybg.jpg"; // same style as homepage
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function AboutPage() {
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
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                <div className="flex space-x-6">
                    <a href="/">
                        <button className="!text-black hover:text-green-300 transition">
                            Home
                        </button>
                    </a>
                    <a href="/about">
                        <button className="!text-black hover:text-green-300 transition">
                            About
                        </button>
                    </a>
                </div>
                <div className="flex space-x-6">
                    {!user ? (
                        <a href="/login">
                            <button className="!text-black hover:text-green-300 transition">
                                Log In
                            </button>
                        </a>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="!text-black hover:text-red-300 transition"
                        >
                            Log Out
                        </button>
                    )}
                </div>
            </nav>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center flex-1 relative overflow-y-auto p-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-3xl w-full space-y-8">
                    {/* Page title */}
                    <h1 className="text-5xl font-bold text-center silly-font text-gray-800">
                        About Us
                    </h1>

                    {/* About Meow */}
                    <section className="space-y-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Meet Meow 🐾
                        </h2>
                        <p className="text-gray-700">
                            Meow is our co-developer, a mischievous but
                            incredibly cute and curious Doll-faced Persian cat.
                            who inspires creativity daily. Meow motivates us to
                            focus. Meow is the purr-fect team member.
                        </p>
                    </section>

                    {/* Why we built this */}
                    <section className="space-y-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Why We Built BugME!
                        </h2>
                        <p className="text-gray-700">
                            We needed a way to focus and stay productive, but
                            honestly, traditional tools were either boring or
                            too static. So we built BugME! with a slightly
                            annoying and visually “alive” interface to keep
                            ourselves on our toes, nudging us to work and stay
                            engaged while still having fun.
                        </p>
                    </section>

                    {/* About the Developers */}
                    <section className="space-y-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            About the Developers
                        </h2>
                        <p className="text-gray-700">
                            We are a trio of passionate coders dedicated to
                            creating smart tools for better studying and
                            productivity. Together with Meow’s supervision, we
                            crafted this AI-powered companion to make learning
                            efficient and fun.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
