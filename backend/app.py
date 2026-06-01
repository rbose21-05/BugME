from flask import Flask, request, jsonify
from flask_cors import CORS
from PDFreader import extract_text_from_pdf
from AIStudyGuideCalendar import generate_study_guide
from AIStudyGuideCalendar import generate_quiz
from AIStudyGuideCalendar import generate_quiz_deadlines
from AIStudyGuideCalendar import generate_teach
import os
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth

cred = credentials.Certificate("./firebase-admin-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

# Define upload folder inside backend/
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_file():
    id_token = request.headers.get("Authorization")
    print(id_token)
    decoded_token = auth.verify_id_token(id_token)
    email = decoded_token['email']
    print(request.values.get("midterms"))
    print(request.values.get("finalExam"))
    print(request.files)
    courseName = request.values.get("courseName")
    # Make sure at least one file was uploaded
    if "notes" not in request.files and "syllabus" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    final = request.values.get("finalExam")
    midterms = request.values.get("midterms")


    responses = {}

    # Handle Notes PDF
    if "notes" in request.files:
        notes_file = request.files["notes"]
        if notes_file.filename.endswith(".pdf"):
            notes_path = os.path.join(UPLOAD_FOLDER, notes_file.filename)
            notes_file.save(notes_path)

            # Process notes PDF
            
            text = extract_text_from_pdf(notes_path, ocr=True)
            quiz = {}
            quiz_calendar = {}
            teach = {}
            study_guide = generate_study_guide(text)
            if "error" in study_guide:
                quiz = {"error": "skipped"}
                quiz_calendar = {"error": "skipped"}
                teach = {"error": "skipped"}
            else:
                time.sleep(15)
                quiz = generate_quiz(text)
                time.sleep(15)
                exam_dates = f"Final: {final}, Midterms: {midterms}" if final or midterms else "No exam dates provided"
                quiz_calendar = generate_quiz_deadlines(study_guide, quiz, exam_dates)
                time.sleep(15)
                teach = generate_teach(text)

            responses["notes"] = {
                "filename": notes_file.filename,
                "text": text,
                "study_guide": study_guide
            }
        else:
            return jsonify({"error": "Notes must be a PDF"}), 400

    # Handle Syllabus PDF
    if "syllabus" in request.files:
        syllabus_file = request.files["syllabus"]
        if syllabus_file.filename.endswith(".pdf"):
            syllabus_path = os.path.join(UPLOAD_FOLDER, syllabus_file.filename)
            syllabus_file.save(syllabus_path)

            # (optional: parse syllabus later if needed)
            responses["syllabus"] = {
                "filename": syllabus_file.filename
            }
        else:
            return jsonify({"error": "Syllabus must be a PDF"}), 400

    doc_ref = db.collection("users").document(email)
    snap = doc_ref.get()
    data = snap.to_dict()

    subjects = data.get("subjects", [])

    for subj in subjects:
        if courseName in subj:
            subj[courseName]["study_guide"] = study_guide
            subj[courseName]["quiz"] = quiz
            subj[courseName]["quiz_calendar"] = quiz_calendar
            subj[courseName]["teach"] = teach

    doc_ref.set({"subjects": subjects}, merge=True)

    return jsonify({
        "message": "✅ Upload successful",
        "data": responses
    }), 200


@app.route("/pushcourses", methods=["POST"])
def add_course():
    print("Add course request received")
    print(request.json)
    data = request.json
    id_token = request.headers.get("Authorization")
    decoded_token = auth.verify_id_token(id_token)
    email = decoded_token['email']
    subjects = data

    if not all([email, subjects]):
        return jsonify({"error": "Missing required fields"}), 400

    doc_ref = db.collection("users").document(email)
    doc_ref.set({
        "subjects": subjects
    }, merge=True)

    return jsonify({"message": "Course added successfully"}), 200

@app.route("/getsubjects", methods=["POST"])
def get_courses():
    print("Get courses request received")
    id_token = request.headers.get("Authorization")
    print(id_token)
    decoded_token = auth.verify_id_token(id_token)
    email = decoded_token['email']
    print("email")

    if not email:
        return jsonify({"error": "Missing email"}), 400

    doc_ref = db.collection("users").document(email)
    doc = doc_ref.get()
    if doc.exists:
        user_data = doc.to_dict()
        print(user_data)
        subjects = user_data.get("subjects", [])
        print("subjects found")
        return jsonify({"subjects": subjects}), 200
    else:
        print("No subjects found")
        return jsonify({"subjects": []}), 200

if __name__ == "__main__":
    app.run(debug=True)
