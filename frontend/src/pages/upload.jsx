import { useState } from "react";

export default function UploadPDF() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("❌ Please select a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
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
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen mx-auto bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    Upload PDF
                </h1>
                <form
                    onSubmit={handleUpload}
                    className="flex flex-col space-y-4"
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="border rounded-lg p-2"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Upload
                    </button>
                </form>
                {message && (
                    <p className="mt-4 text-center text-gray-700 font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
