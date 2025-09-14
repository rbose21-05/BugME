import uploadbg from "../background/uploadbg.png"; // same style as homepage
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import sticker from "../cats/calendarcat.png"; // fixed relative path
import "./HomePage.css";

export default function Calendar() {
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth);
    };

    return (
        <>
            <div
                className="h-screen w-screen bg-cover bg-center flex flex-col"
                style={{ backgroundImage: `url(${uploadbg})` }}
            >
                <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                    <a href="/">
                        <div className="text-2xl silly-font text-white">
                            BugME!
                        </div>
                    </a>
                    <button
                        onClick={handleLogout}
                        className="hover:text-green-300 transition"
                    >
                        Log Out
                    </button>
                </nav>

                {/* Main Content */}
                <div className="flex flex-1 items-center justify-center bg-black/30 p-6">
                    <img
                        src={sticker}
                        alt="sticker"
                        className="w-75 h-75 absolute bottom-8 right-8 levitate"
                    />
                </div>
            </div>
        </>
    );
}
