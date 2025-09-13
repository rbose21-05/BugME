import sunnyBg from "../background/sunnybg.jpg";

export default function SignupPage() {
    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${sunnyBg})` }}
        >
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-black">
                {/* Left side */}
                <a href="/">
                    <div className="text-2xl silly-font text-white">BugME!</div>
                </a>

                {/* Right side */}
                <div>
                    <a href="login">
                        <button className="hover:text-green-300 transition">
                            Log In
                        </button>
                    </a>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex flex-1 items-center justify-center bg-black/30">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Sign Up
                    </h2>

                    <form className="flex flex-col space-y-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="University"
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
                        >
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
