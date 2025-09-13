import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homepage";
import SignupPage from "./pages/signup";
import UploadPDF from "./pages/upload";
import LoginPage from "./pages/login";
export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/upload" element={<UploadPDF />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}
