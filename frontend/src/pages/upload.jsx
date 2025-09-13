import { useState } from "react";
import uploadbg from "../background/uploadbg.jpg";

export default function UploadPDF() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("❌ Please select a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                console.log("Data:", data);
            } else {
                setMessage("❌ " + data.error);
            }
        } catch (error) {
            setMessage("❌ Upload failed");
        }
    };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg.jpg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                {/* Left side */}
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </a>

                {/* Right side */}
                <a href="/signup">
                    <button className="hover:text-green-300 transition">
                        Sign Up
                    </button>
                </a>
            </nav>

            {/* Main content */}
            <div className="flex flex-1 items-center justify-center bg-black/30">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Upload PDF
                    </h2>

                    <form
                        onSubmit={handleUpload}
                        className="flex flex-col space-y-4"
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
                        >
                            Upload
                        </button>
                    </form>

                    {message && (
                        <p className="mt-4 text-center text-gray-700 font-medium">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
