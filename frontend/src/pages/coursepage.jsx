import { useState } from "react";
import uploadbg from "../background/uploadbg.png";
import { useLocation, useNavigate } from "react-router-dom";

export default function CoursePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseName } = location.state || {};

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </a>
                <a href="/login">
                    <button className="hover:text-green-300 transition">
                        Log Out
                    </button>
                </a>
            </nav>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center bg-black/30 p-6">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 w-full max-w-5xl flex flex-col items-center">
                    {/* Course Name */}
                    <h1 className="rock-salt-regular text-4xl font-extrabold text-gray-800 mb-12 text-center">
                        {courseName}
                    </h1>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full max-w-3xl">
                        <a
                            onClick={() =>
                                navigate("/upload", { state: { courseName } })
                            }
                            className="rock-salt-regular flex flex-col items-center justify-center bg-yellow-100 rounded-2xl shadow-lg p-10 hover:bg-yellow-200 transition font-bold text-2xl text-gray-700 tracking-tight"
                            style={{
                                color: "#4a4a4a", // graphite gray
                                textShadow: "0.5px 0.5px 0.5px rgba(0,0,0,0.3)", // faint pencil smudge
                            }}
                        >
                            Info
                        </a>
                        <a
                            className="rock-salt-regular flex flex-col items-center justify-center bg-yellow-100 rounded-2xl shadow-lg p-10 hover:bg-yellow-200 transition font-bold text-2xl text-gray-700 tracking-tight"
                            style={{
                                color: "#4a4a4a", // graphite gray
                                textShadow: "0.5px 0.5px 0.5px rgba(0,0,0,0.3)", // faint pencil smudge
                            }}
                        >
                            Calendar
                        </a>
                        <a
                            onClick={() => navigate("/studyguide")}
                            className="rock-salt-regular flex flex-col items-center justify-center bg-yellow-100 rounded-2xl shadow-lg p-10 hover:bg-yellow-200 transition font-bold text-2xl text-gray-700 tracking-tight"
                            style={{
                                color: "#4a4a4a", // graphite gray
                                textShadow: "0.5px 0.5px 0.5px rgba(0,0,0,0.3)", // faint pencil smudge
                            }}
                        >
                            Study Guide
                        </a>
                        <a
                            className="rock-salt-regular flex flex-col items-center justify-center bg-yellow-100 rounded-2xl shadow-lg p-10 hover:bg-yellow-200 transition font-bold text-2xl text-gray-700 tracking-tight"
                            style={{
                                color: "#4a4a4a", // graphite gray
                                textShadow: "0.5px 0.5px 0.5px rgba(0,0,0,0.3)", // faint pencil smudge
                            }}
                        >
                            Learn
                        </a>
                        <a
                            className="rock-salt-regular flex flex-col items-center justify-center bg-yellow-100 rounded-2xl shadow-lg p-10 hover:bg-yellow-200 transition font-bold text-2xl text-gray-700 tracking-tight"
                            style={{
                                color: "#4a4a4a", // graphite gray
                                textShadow: "0.5px 0.5px 0.5px rgba(0,0,0,0.3)", // faint pencil smudge
                            }}
                        >
                            Quiz
                        </a>
                    </div>
                    {/* Back to Home Button */}
                    <a
                        href="/landing"
                        className="mt-6 py-3 px-8 bg-sky-300 text-white !text-white font-semibold rounded-xl shadow-md hover:bg-sky-600 transition text-lg no-underline"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
