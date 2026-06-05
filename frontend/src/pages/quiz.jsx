import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import uploadbg from "../background/uploadbg.png";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function extractQuestions(quizPayload) {
    if (!quizPayload || quizPayload.error) return null;
    if (Array.isArray(quizPayload.quiz)) return quizPayload.quiz;
    if (Array.isArray(quizPayload.questions)) return quizPayload.questions;
    if (Array.isArray(quizPayload)) return quizPayload;
    return null;
}

export default function Quiz() {
    const location = useLocation();
    const { courseName } = location.state || {};
    const persisted = localStorage.getItem("selectedCourse");
    const activeCourse = courseName || persisted;

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (activeCourse) {
            localStorage.setItem("selectedCourse", activeCourse);
        }
    }, [activeCourse]);

    useEffect(() => {
        if (!activeCourse) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError("Please log in to view the quiz.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const response = await fetch("http://127.0.0.1:5000/getsubjects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch course data.");
                }

                const result = await response.json();
                const courseObj = result.subjects?.find(
                    (s) => Object.keys(s)[0] === activeCourse
                );

                if (!courseObj) {
                    setError(`Course "${activeCourse}" not found.`);
                    setQuestions([]);
                    return;
                }

                const quizPayload = courseObj[activeCourse]?.quiz;
                const parsed = extractQuestions(quizPayload);

                if (!parsed?.length) {
                    setError(
                        quizPayload?.error
                            ? "Quiz generation failed. Upload notes again from the course page."
                            : "No quiz available yet. Upload a PDF first!"
                    );
                    setQuestions([]);
                    return;
                }

                setQuestions(parsed);
                setError("");
            } catch (e) {
                console.error(e);
                setError("Error loading quiz. Make sure the backend is running.");
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeCourse]);

    const handleSelect = (qIdx, optIdx) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    };

    const submitQuiz = () => {
        if (!questions.length) return;

        const unanswered = questions.findIndex((_, idx) => answers[idx] === undefined);
        if (unanswered !== -1) {
            alert(`Please answer question ${unanswered + 1} before submitting.`);
            return;
        }

        let correct = 0;
        questions.forEach((q, idx) => {
            const selectedOption = q.options[answers[idx]];
            if (selectedOption === q.answer) correct++;
        });

        setScore({ correct, total: questions.length });
        setSubmitted(true);
    };

    const resetQuiz = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(null);
    };

    if (!activeCourse) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg">No course selected. Go back to the course page.</p>
                <Link to="/landing" className="ml-4 text-blue-600 underline">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg})` }}
        >
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                <Link to="/" className="text-2xl font-bold">
                    BugME!
                </Link>
                <Link to="/landing" className="hover:text-green-300">
                    Home
                </Link>
            </nav>

            <div className="flex flex-1 items-center justify-center bg-black/30 p-6">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                    <h1 className="text-3xl font-extrabold mb-6 text-center">
                        Quiz – {activeCourse}
                    </h1>

                    {loading ? (
                        <p className="text-center text-gray-600">Loading quiz...</p>
                    ) : error ? (
                        <p className="text-center text-red-600">{error}</p>
                    ) : (
                        <div>
                            {questions.map((q, qIdx) => {
                                const selectedIdx = answers[qIdx];
                                const selectedOption =
                                    selectedIdx !== undefined ? q.options[selectedIdx] : null;
                                const isCorrect = submitted && selectedOption === q.answer;

                                return (
                                    <div key={qIdx} className="mb-6">
                                        <p className="font-medium">
                                            {qIdx + 1}. {q.question}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                            {q.options.map((opt, optIdx) => {
                                                let btnClass = "bg-gray-100";
                                                if (selectedIdx === optIdx) {
                                                    btnClass = submitted
                                                        ? isCorrect
                                                            ? "bg-green-200 border-green-500"
                                                            : "bg-red-200 border-red-500"
                                                        : "bg-yellow-200";
                                                } else if (
                                                    submitted &&
                                                    opt === q.answer
                                                ) {
                                                    btnClass = "bg-green-100 border-green-400";
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleSelect(qIdx, optIdx)}
                                                        disabled={submitted}
                                                        className={`p-2 border rounded transition text-left ${btnClass} disabled:cursor-default`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {submitted && selectedOption !== q.answer && (
                                            <p className="text-sm text-green-700 mt-1">
                                                Correct answer: {q.answer}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            {!submitted ? (
                                <button
                                    onClick={submitQuiz}
                                    className="mt-4 w-full bg-sky-400 text-white py-3 rounded-xl hover:bg-sky-500 transition font-semibold"
                                >
                                    Submit Quiz
                                </button>
                            ) : (
                                <div className="mt-4 text-center">
                                    <p className="text-2xl font-bold mb-4">
                                        Score: {score.correct} / {score.total}
                                    </p>
                                    <button
                                        onClick={resetQuiz}
                                        className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-xl hover:bg-yellow-500 transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex justify-between">
                        <Link
                            to="/coursepage"
                            state={{ courseName: activeCourse }}
                            className="text-blue-600 underline"
                        >
                            ← Back to Course
                        </Link>
                        <Link to="/landing" className="text-blue-600 underline">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
