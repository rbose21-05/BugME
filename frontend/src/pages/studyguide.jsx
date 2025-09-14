import { Link } from "react-router-dom";
import uploadbg from "../background/uploadbg.png";

export default function StudyGuide() {
    // Replace this with data from API or props later
    const studyText = `Study Guide — CS 210

Week 1: Introduction to algorithms
  - Read: Chapter 1
  - Key ideas: complexity, Big-O
  - Practice: problems 1.1, 1.2

Week 2: Data structures
  - Read: Chapter 2
  - Key ideas: arrays, linked lists, stacks, queues
  - Practice: implement a stack and solve problems 2.3, 2.5

(continue with your full long guide — this component will wrap text and allow scrolling)
`;

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                <Link to="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </Link>

                <Link to="/login" className="hover:text-green-300 transition">
                    Log Out
                </Link>
            </nav>

            {/* Main */}
            <div className="flex flex-1 items-center justify-center bg-black/30 p-6">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-4xl flex flex-col">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                        Study Guide
                    </h1>

                    {/* The card body: scrollable, preserves line breaks, monospace font */}
                    <div
                        className="flex-1 overflow-y-auto p-4 bg-white rounded-lg border border-gray-200"
                        style={{
                            maxHeight: "60vh",
                        }}
                    >
                        {/* Use pre-wrap so long text wraps but preserves spacing/newlines */}
                        <pre className="whitespace-pre-wrap font-mono text-gray-800 text-lg leading-relaxed">
                            {studyText}
                        </pre>
                    </div>

                    {/* Footer: Back to course */}
                    <div className="mt-6 flex justify-between items-center">
                        <Link
                            to="/coursePage"
                            className="py-3 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition text-lg text-center"
                        >
                            ← Back to Course
                        </Link>

                        <button
                            onClick={() => window.print()}
                            className="py-3 px-6 bg-sky-600 text-black font-semibold rounded-xl shadow-md hover:bg-sky-700 transition text-lg"
                        >
                            Print Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
