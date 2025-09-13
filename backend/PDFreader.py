import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os

def extract_text_from_pdf(filepath, ocr=False):
    text = ""
    try:
        pdf = fitz.open(filepath)

        for page_num, page in enumerate(pdf, start=1):
            # Try normal text extraction
            page_text = page.get_text()
            
            if not page_text.strip() and ocr:  # if no text found, fallback to OCR
                # Render page as image
                pix = page.get_pixmap(dpi=300)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                page_text = pytesseract.image_to_string(img)
            
            text += f"\n\n--- Page {page_num} ---\n\n{page_text}"

        pdf.close()

        with open("study_guide.txt", "w", encoding="utf-8") as f:
            f.write(text)
    except:
        print("An error occurred while processing the PDF.")
    finally:
        os.remove(filepath)

    return text


if __name__ == "__main__":
    print("This module is intended to be imported and used in other files.")
