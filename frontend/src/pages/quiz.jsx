// src/pages/quiz.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import uploadbg from "../background/uploadbg.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseName } = location.state || {};
  const persisted = localStorage.getItem("selectedCourse");
  const activeCourse = courseName || persisted;

  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const auth = getAuth();

  // Persist course name for refreshes
  if (activeCourse) localStorage.setItem("selectedCourse", activeCourse);

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
        if (!response.ok) throw new Error("Failed fetch");
        const result = await response.json();
        const courseObj = result.subjects.find(
          (s) => Object.keys(s)[0] === activeCourse
        );
        if (courseObj && courseObj[activeCourse].quiz) {
          setQuizData({ questions: courseObj[activeCourse].quiz.quiz });
        } else {
          setQuizData({ questions: [] });
        }
      } catch (e) {
        console.error(e);
      }
    });
    return () => unsubscribe();
  }, [activeCourse, auth]);

  const handleSelect = (qIdx, optIdx) => {
    setAnswers({ ...answers, [qIdx]: optIdx });
  };

  const submitQuiz = () => {
  if (!quizData) return;
  let correct = 0;
  quizData.questions.forEach((q, idx) => {
    const selectedOption = q.options[answers[idx]];
    if (selectedOption === q.answer) correct++;
  });
  setScore({ correct, total: quizData.questions.length });
};

  if (!activeCourse) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">⚠️ No course selected. Go back to the course page.</p>
        <Link to="/coursepage" className="ml-4 text-blue-600 underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: `url(${uploadbg})` }}>
      <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
        <Link to="/" className="text-2xl font-bold">BugME!</Link>
        <Link to="/login" className="hover:text-green-300">Log Out</Link>
      </nav>
      <div className="flex flex-1 items-center justify-center bg-black/30 p-6">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-3xl">
          <h1 className="text-3xl font-extrabold mb-6 text-center">Quiz – {activeCourse}</h1>
          {quizData && quizData.questions.length > 0 ? (
            <div>
              {quizData.questions.map((q, qIdx) => (
                <div key={qIdx} className="mb-4">
                  <p className="font-medium">{qIdx + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className={`p-2 border rounded transition ${answers[qIdx] === optIdx ? "bg-yellow-200" : "bg-gray-100"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={submitQuiz} className="mt-4 w-full bg-sky-300 text-white py-2 rounded hover:bg-sky-400 transition">
                Submit Quiz
              </button>
              {score && (
                <p className="mt-4 text-xl font-bold text-center">
                  Score: {score.correct} / {score.total}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center">No quiz data available for this course.</p>
          )}
          <div className="mt-6 flex justify-between">
            <Link to="/coursepage" className="text-blue-600 underline">← Back to Course</Link>
            <Link to="/landing" className="text-blue-600 underline">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
