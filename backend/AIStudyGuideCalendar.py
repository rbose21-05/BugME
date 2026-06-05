from dotenv import load_dotenv
import os
from google import genai
import json

# Load environment variables
load_dotenv()

# The client gets the API key from the environment variable `GOOGLE_API_KEY`.
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
client = genai.Client(api_key=GEMINI_API_KEY)

def _parse_json_response(raw: str) -> dict:
    """Extract JSON from model output (handles markdown code fences)."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:] if lines[0].startswith("```") else lines
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    start = text.index("{")
    end = text.rindex("}") + 1
    return json.loads(text[start:end])


def promptAI(prompt: str):
    """
    Sends a prompt to the Gemini model and returns the response object.
    """
    return client.models.generate_content(model=GEMINI_MODEL, contents=prompt)


def save_json(data: dict, output_file: str) -> None:
    """
    Saves a dictionary as a JSON file with pretty formatting.
    """
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def generate_study_guide(text: str, output_file: str = "study_guide.json") -> dict:
    """
    Generates a study guide from lecture content and syllabus.

    Args:
        text (str): Lecture content.
        output_file (str): Path to save the JSON file.

    Returns:
        dict: A dictionary with one key, "study_guide".
    """
    if not text.strip():
        return {"error": "Lecture content is empty."}

    prompt = f"""
You are an academic assistant. Read the following lecture content and produce structured output.

Requirements:
- Create a "study_guide" section.
- It should be a concise, clear summary of the key concepts.
- Written in plain text (string format).

Return ONLY valid JSON in the format:
{{
  "study_guide": "text here..."
}}

Lecture content:
{text}
"""

    try:
        response = promptAI(prompt)
        print("API response received")
        data = _parse_json_response(response.text)
        save_json(data, output_file)
        return data
    except json.JSONDecodeError:
        print("Error: API response is not valid JSON.")
        return {"error": "Invalid JSON from API."}
    except Exception as e:
        print(f"API response error: {e}")
        return {"error": "Could not generate study guide."}


def generate_teach(pdf_text: str, output_file: str = None) -> dict:
    """
    Generates a teaching module from uploaded PDF notes.

    Args:
        pdf_text (str): Extracted text from the PDF notes.
        output_file (str, optional): File to save JSON. Default is None.

    Returns:
        dict: JSON with one key "teaching_module", containing a list of facts.
    """
    if not pdf_text.strip():
        return {"error": "PDF text is empty."}

    prompt = f"""
You are a skilled teaching assistant. 
Based on the following PDF notes text, generate a JSON object with one field:

1. "teaching_module": A list of the most important facts and key points from the notes.
   - Focus only on the core facts (no long paragraphs).
   - Present each fact as a short, clear bullet point.
   - Keep it student-friendly and concise.

PDF Notes Text:
{pdf_text}

Return only valid JSON, nothing else.
"""

    try:
        response = promptAI(prompt)
        print("API response received.")
        # print("response.text:", response.text)
        data = _parse_json_response(response.text)
        if output_file:
            save_json(data, output_file)
        return data
    except json.JSONDecodeError:
        print("Error: API response is not valid JSON.")
        return {"error": "Invalid JSON from API."}
    except Exception as e:
        print(f"API response error: {e}")
        return {"error": "Could not generate teaching content."}


def generate_quiz(source_text: str, num_questions: int = 5, output_file: str = None) -> dict:
    """
    Generates a quiz with a specified number of questions.

    Args:
        source_text (str): Content to base the quiz on.
        num_questions (int): Number of questions.
        output_file (str, optional): File to save JSON. Default is None.

    Returns:
        dict: JSON with a "quiz" list containing questions, options, and answers.
    """
    if not source_text.strip():
        return {"error": "Source text is empty."}

    prompt = f"""
You are a skilled teaching assistant. 
Based on the following content, generate a JSON object with one field:

1. "quiz": A list of {num_questions} multiple-choice questions (MCQs).
   - Each question should have:
     - "question": the question text
     - "options": a list of 4 possible answers
     - "answer": the correct option (must exactly match one from options)
   - Ensure the questions are clear, factual, and test key concepts.
   - Keep the language simple and student-friendly.

Content:
{source_text}

Return only valid JSON, nothing else.
"""

    try:
        response = promptAI(prompt)
        print("API response received.")
        data = _parse_json_response(response.text)
        if output_file:
            save_json(data, output_file)
        return data
    except json.JSONDecodeError:
        print("Error: API response is not valid JSON.")
        return {"error": "Invalid JSON from API."}
    except Exception as e:
        print(f"API response error: {e}")
        return {"error": "Could not generate quiz."}


def generate_quiz_deadlines(
    study_guide: str,
    quizzes: str,
    exam_dates: str,
    output_file: str = None
) -> dict:
    """
    Generates a topic-by-topic study schedule with deadlines before exams.

    Args:
        study_guide (str): Text from the study guide.
        quizzes (str): Quiz questions/topics JSON or text.
        exam_dates (str): Exam date information.
        output_file (str, optional): File to save JSON. Default is None.

    Returns:
        dict: JSON with a "schedule" list of study milestones and reminders.
    """
    from datetime import date

    today = date.today().isoformat()

    prompt = f"""
You are an academic assistant and study planner.
Given the following details, build a realistic study calendar.

- Study Guide: {study_guide}
- Quizzes: {quizzes}
- Exam Dates: {exam_dates}
- Today's date: {today}

Create a JSON object with one field:

1. "schedule": A list of 6-12 items ordered by deadline (earliest first).
   Each item must include:
   - "topic": the specific topic or milestone (e.g., "Complete Chapter 3: Cell Division")
   - "type": one of "study", "quiz", or "exam"
   - "deadline": target completion date in YYYY-MM-DD format (must be today or later)
   - "notes": 1-2 sentences on what to do that day (review, practice, take quiz, etc.)
   - "reminder_days_before": integer (usually 1; use 2 for exams)

Guidelines:
- Break the study guide into logical topic chunks with spaced deadlines leading up to each exam.
- Schedule quiz review days before midterms/finals.
- Include exam days themselves as type "exam" on the actual exam dates when provided.
- Leave at least 1-2 days between major topics when possible.
- All deadlines must be on or after {today}.
- If no exam dates are provided, spread topics across the next 3-4 weeks from {today}.

Return only valid JSON, nothing else.
"""

    try:
        response = promptAI(prompt)
        print("API response received.")
        data = _parse_json_response(response.text)
        if output_file:
            save_json(data, output_file)
        return data
    except json.JSONDecodeError:
        print("Error: API response is not valid JSON.")
        return {"error": "Invalid JSON from API."}
    except Exception as e:
        print(f"API response error: {e}")
        return {"error": "Could not generate quiz deadlines."}
