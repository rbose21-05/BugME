from flask import Flask, request, jsonify
from flask_cors import CORS
from PDFreader import extract_text_from_pdf
from AIStudyGuideCalendar import generate_study_guide
from AIStudyGuideCalendar import generate_quiz
from AIStudyGuideCalendar import generate_quiz_deadlines
from AIStudyGuideCalendar import generate_teach
import os
import time
import json
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
    courseName = (request.values.get("courseName") or "").strip()
    # Make sure at least one file was uploaded
    if "notes" not in request.files and "syllabus" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    final = request.values.get("finalExam")
    midterms = request.values.get("midterms")


    responses = {}
    study_guide = {}
    quiz = {}
    quiz_calendar = {}
    teach = {}

    # Handle Notes PDF
    if "notes" in request.files:
        notes_file = request.files["notes"]
        if notes_file.filename.endswith(".pdf"):
            notes_path = os.path.join(UPLOAD_FOLDER, notes_file.filename)
            notes_file.save(notes_path)

            # Process notes PDF
            
            text = extract_text_from_pdf(notes_path, ocr=True)
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
                study_guide_text = (
                    study_guide.get("study_guide", "")
                    if isinstance(study_guide, dict)
                    else str(study_guide)
                )
                quiz_text = (
                    json.dumps(quiz.get("quiz", []), indent=2)
                    if isinstance(quiz, dict) and quiz.get("quiz")
                    else str(quiz)
                )
                quiz_calendar = generate_quiz_deadlines(
                    study_guide_text, quiz_text, exam_dates
                )
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

    updated = False
    for subj in subjects:
        if courseName and courseName in subj:
            if study_guide and "error" not in study_guide:
                subj[courseName]["study_guide"] = study_guide
            if quiz and "error" not in quiz:
                subj[courseName]["quiz"] = quiz
            if quiz_calendar and "error" not in quiz_calendar:
                subj[courseName]["quiz_calendar"] = quiz_calendar
            if teach and "error" not in teach:
                subj[courseName]["teach"] = teach
            updated = True

    if not updated:
        print(f"Warning: course '{courseName}' not found in Firestore subjects")
    else:
        doc_ref.set({"subjects": subjects}, merge=True)

    ai_ok = study_guide and "error" not in study_guide
    return jsonify({
        "message": "✅ Upload successful" if ai_ok else "⚠️ PDF saved but AI generation failed — check backend logs",
        "ai_generated": ai_ok,
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

@app.route("/save-calendar-sync", methods=["POST"])
def save_calendar_sync():
    id_token = request.headers.get("Authorization")
    decoded_token = auth.verify_id_token(id_token)
    email = decoded_token["email"]

    body = request.json or {}
    course_name = (body.get("courseName") or "").strip()
    event_ids = body.get("eventIds", [])

    if not course_name:
        return jsonify({"error": "Missing courseName"}), 400
    if not isinstance(event_ids, list):
        return jsonify({"error": "eventIds must be a list"}), 400

    doc_ref = db.collection("users").document(email)
    snap = doc_ref.get()
    if not snap.exists:
        return jsonify({"error": "User not found"}), 404

    data = snap.to_dict()
    subjects = data.get("subjects", [])
    updated = False

    for subj in subjects:
        if course_name in subj:
            subj[course_name]["calendar_event_ids"] = event_ids
            subj[course_name]["calendar_synced_at"] = time.time()
            updated = True
            break

    if not updated:
        return jsonify({"error": f"Course '{course_name}' not found"}), 404

    doc_ref.set({"subjects": subjects}, merge=True)
    return jsonify({"message": "Calendar sync saved", "eventIds": event_ids}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
