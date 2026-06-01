import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homepage";
import SignupPage from "./pages/signup";
import UploadPDF from "./pages/upload";
import LoginPage from "./pages/login";
import LandingPage from "./pages/landing";
import CoursePage from "./pages/coursepage";
import ProtectedRoute from "./ProtectedRoute"; // make sure path is correct
import AboutMe from "./pages/aboutme";
import Calendar from "./pages/calendar";
import StudyGuide from "./pages/studyguide";
import Quiz from "./pages/quiz";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutMe />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/studyguide" element={<StudyGuide />} />
                <Route path="/quiz" element={<Quiz />} />
                {/* Protected Routes */}
                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <UploadPDF />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/landing"
                    element={
                        <ProtectedRoute>
                            <LandingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/coursepage"
                    element={
                        <ProtectedRoute>
                            <CoursePage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}
