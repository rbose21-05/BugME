import sunnyBg from "../background/sunnybg.jpg";
export default function HomePage() {
    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${sunnyBg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                {/* Left side */}
                <div className="flex space-x-6 ml-0">
                    <button className="hover:text-yellow-300 transition">
                        Home
                    </button>
                    <button className="hover:text-yellow-300 transition">
                        About
                    </button>
                </div>

                {/* Right side */}
                <div className="flex space-x-6 mr-0">
                    <a href="signup">
                        <button className="hover:text-green-300 transition">
                            Sign Up
                        </button>
                    </a>
                    <a href="login">
                        <button className="hover:text-green-300 transition">
                            Log In
                        </button>
                    </a>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center flex-1 text-white bg-black/30">
                <h1 className="text-9xl mb-12 drop-shadow-lg silly-font">
                    BugME!
                </h1>
                <p className="text-lg max-w-2xl text-center mb-6 drop-shadow-md">
                    Your AI-powered companion for smarter studying, quizzes, and
                    deadlines.
                </p>
                <button
                    onClick={() => (window.location.href = "/signup")}
                    className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
