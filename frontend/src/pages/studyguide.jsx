import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import uploadbg from "../background/uploadbg.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function StudyGuide() {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseName } = location.state || {};
    const persisted = localStorage.getItem("selectedCourse");
    const activeCourse = courseName || persisted;
    const [studyText, setStudyText] = useState("Loading study guide...");
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch("http://127.0.0.1:5000/getsubjects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`,
                    },
                });
                if (!response.ok) {
                    setStudyText("Failed to fetch data.");
                    return;
                }
                const result = await response.json();
                console.log("result", result);
console.log("activeCourse", activeCourse);
                const courseData = result.subjects.find(subj => Object.keys(subj)[0] === activeCourse   );
                if (courseData && courseData[activeCourse].study_guide && courseData[activeCourse].study_guide.study_guide) {
                    setStudyText(courseData[activeCourse].study_guide.study_guide);
                } else {
                    setStudyText("No study guide found for this course. Upload a PDF first!");
                }
            } catch (error) {
                console.error("Error fetching study guide:", error);
                setStudyText("Error loading study guide.");
            }
        });
        return () => unsubscribe();
    }, [activeCourse]);

    return (
        <div className="h-screen w-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: `url(${uploadbg})` }}>
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                <Link to="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </Link>
                <Link to="/login" className="hover:text-green-300 transition">Log Out</Link>
            </nav>
            {/* Main */}
            <div className="flex flex-1 items-center justify-center bg-black/30 p-6">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-4xl flex flex-col">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Study Guide</h1>
                    <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg border border-gray-200" style={{ maxHeight: "60vh" }}>
                        <pre className="whitespace-pre-wrap font-mono text-gray-800 text-lg leading-relaxed">{studyText}</pre>
                    </div>
                    {/* Footer */}
                    <div className="mt-6 flex justify-between items-center">
                        <Link to="/coursepage" className="py-3 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition text-lg text-center">
                            ← Back to Course
                        </Link>
                        <button onClick={() => window.print()} className="py-3 px-6 bg-sky-600 text-black font-semibold rounded-xl shadow-md hover:bg-sky-700 transition text-lg">
                            Print Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
