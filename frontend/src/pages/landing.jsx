import { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import uploadbg from "../background/uploadbg.png";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import sticker from "../cats/maincat.png"; // fixed relative path

export default function UserPage() {
    // Courses state (start empty)
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);

    // Input states
    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseCredits, setNewCourseCredits] = useState("");
    const auth = getAuth();

    useEffect(() => {
        const fetchSubjects = async () => {
            const token = await auth.currentUser.getIdToken();
            if (!auth.currentUser) return;

            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/getsubjects",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `${token}`, // ✅ best practice
                        },
                    }
                );
                if (!response.ok) {
                    console.error("Failed to fetch subjects:", response.status);
                    return;
                }
                const result = await response.json();
                for (const subject of result.subjects) {
                    console.log("Subject in for:", subject);
                    // subjects.push(subject);
                    setSubjects(result.subjects);
                }
                console.log("Subjects:", subjects);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                return;
            }
        };

        fetchSubjects();
    }, []);

    const handleAddCourse = async () => {
        const token = await auth.currentUser.getIdToken();
        if (newCourseName.trim() === "" || newCourseCredits.trim() === "") {
            alert("Please enter both course name and credits");
            return;
        }

        const newCourse = {
            [newCourseName]: {
                credits: parseInt(newCourseCredits),
            },
        };

        // Add course to frontend state
        console.log([...subjects, newCourse]);
        subjects.push(newCourse);
        setSubjects([...subjects]);

        const response = await fetch("http://127.0.0.1:5000/pushcourses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`, // Firebase token in Authorization header
            },
            body: JSON.stringify(subjects),
        });

        // Clear input fields
        setNewCourseName("");
        setNewCourseCredits("");
    };

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
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
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
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-3xl flex flex-col items-center">
                    <img
                        className="w-24 h-24 mb-4 rounded-full object-cover"
                        src={auth.currentUser?.photoURL}
                        alt="Profile"
                    />

                    {/* Small heading */}
                    <h2 className="text-gray-800 text-lg mb-6">
                        Your Subjects
                    </h2>

                    {/* Subjects Grid */}
                    {subjects.length === 0 ? (
                        <p className="text-gray-500 italic mb-8">
                            No courses yet. Add one below!
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-xl mb-8">
                            {subjects.map((subject, index) => {
                                const [name, details] =
                                    Object.entries(subject)[0];
                                return (
                                    <a
                                        onClick={() =>
                                            navigate("/coursepage", {
                                                state: { courseName: name },
                                            })
                                        }
                                        key={index}
                                    >
                                        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-4 hover:bg-yellow-100 transition">
                                            <span className="font-semibold">
                                                {name}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                {details.credits} Credits
                                            </span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {/* Input Fields */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-4">
                        <input
                            type="text"
                            placeholder="Course Name"
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <input
                            type="number"
                            placeholder="Credits"
                            value={newCourseCredits}
                            onChange={(e) =>
                                setNewCourseCredits(e.target.value)
                            }
                            className="w-28 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    {/* Add Course Button */}
                    <button
                        onClick={handleAddCourse}
                        className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-yellow-500 transition"
                    >
                        + Add Course
                    </button>
                </div>
            </div>
        </div>
    );
}
