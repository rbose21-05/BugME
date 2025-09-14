import { useState } from "react";
import uploadbg from "../background/uploadbg.png";
import sticker from "../cats/studycat.png";
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom";

export default function UploadPDF() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [midterms, setMidterms] = useState([]);
    const [finalExam, setFinalExam] = useState("");
    const [syllabus, setSyllabus] = useState(null);
    const location = useLocation();
    const { courseName } = location.state || {};

    const handleUpload = async (e) => {
        e.preventDefault();
        const user = getAuth().currentUser;
        if (!user) {
            setMessage("❌ Not logged in");
            return;
        }

        if (!courseName) {
            setMessage("❌ Course name not provided");
            return;
        }

        if (!file && !syllabus) {
            setMessage("❌ Please upload at least one PDF (notes or syllabus)");
            return;
        }

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const formData = new FormData();
            if (file) formData.append("notes", file);
            if (syllabus) formData.append("syllabus", syllabus);
            formData.append("courseName", courseName);
            formData.append("midterms", JSON.stringify(midterms));
            formData.append("finalExam", finalExam);
            try {
                const response = await fetch("http://127.0.0.1:5000/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `${token}`, // Firebase token in Authorization header
                    },
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

            setMessage("✅ Course info updated for " + courseName);
        } catch (error) {
            console.error(error);
            setMessage("❌ Upload failed");
        }
    };

    const addMidterm = () => {
        setMidterms([...midterms, ""]);
    };

    const updateMidterm = (index, value) => {
        const updated = [...midterms];
        updated[index] = value;
        setMidterms(updated);
    };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </a>
                <a href="/landing">
                    <button className="hover:text-green-300 transition">
                        Back To Home
                    </button>
                </a>
            </nav>

            {/* Main content */}
            <div className="flex flex-1 items-center justify-center bg-black/30">
                <img
                    src={sticker}
                    alt="cat"
                    className="absolute bottom-0 right-0 w-500 h-200"
                />
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Upload Course Info for {courseName}
                    </h2>

                    <form
                        onSubmit={handleUpload}
                        className="flex flex-col space-y-4"
                    >
                        {/* Course Name */}
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700 mb-1">
                                Course Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter course name"
                                value={courseName}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none readonly"
                                required
                            />
                        </div>

                        {/* Notes Upload */}
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700 mb-1">
                                Upload Notes PDF
                            </label>
                            <label className="cursor-pointer bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition text-center">
                                {file ? file.name : "Upload Notes"}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Syllabus Upload */}
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700 mb-1">
                                Upload Syllabus PDF
                            </label>
                            <label className="cursor-pointer bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition text-center">
                                {syllabus ? syllabus.name : "Upload Syllabus"}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) =>
                                        setSyllabus(e.target.files[0])
                                    }
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Midterms */}
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700">
                                Midterm Exams
                            </label>
                            {midterms.map((date, index) => (
                                <input
                                    key={index}
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        updateMidterm(index, e.target.value)
                                    }
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                                />
                            ))}
                            <button
                                type="button"
                                onClick={addMidterm}
                                className="py-2 px-4 bg-sky-300 text-black rounded-lg hover:bg-sky-500 transition"
                            >
                                + Add Midterm
                            </button>
                        </div>

                        {/* Final Exam */}
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700">
                                Final Exam
                            </label>
                            <input
                                type="date"
                                value={finalExam}
                                onChange={(e) => setFinalExam(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
                        >
                            Save
                        </button>

                        <a
                            href="/coursePage"
                            className="w-full py-3 bg-yellow-400 text-white font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition text-lg no-underline text-center"
                        >
                            Back to Course
                        </a>
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
