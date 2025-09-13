from flask import Flask, request, jsonify
from flask_cors import CORS
from PDFreader import extract_text_from_pdf
# from AIStudyGuideCalendar import generate_study_guide_and_calendar
import os

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

# Define upload folder inside backend/
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".pdf"):
        return jsonify({"error": "Only PDF files allowed"}), 400

    # Save with the same filename inside backend/uploads
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    
    text = extract_text_from_pdf(filepath, ocr=True)
    # study_guide_and_calendar = generate_study_guide_and_calendar(text)

    return jsonify({
        "message": "✅ PDF uploaded successfully",
        "text": text,
        # "study_guide_and_calendar": study_guide_and_calendar
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
