import io
import pdfplumber
from docx import Document


def extract_text_from_pdf(file_obj: io.BytesIO) -> str:
    """Extract plain text from a PDF file object."""
    text_parts = []
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_obj: io.BytesIO) -> str:
    """Extract plain text from a DOCX file object."""
    doc = Document(file_obj)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)
