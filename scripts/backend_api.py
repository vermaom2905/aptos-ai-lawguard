from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from ai_nlp import analyze_contract
from risk_scoring import get_risk_category
from fastapi.middleware.cors import CORSMiddleware
import pdfminer.high_level
import docx  # Import python-docx library
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContractInput(BaseModel):
    contract: str

def extract_text_from_pdf(pdf_bytes):
    try:
        text = pdfminer.high_level.extract_text(io.BytesIO(pdf_bytes))
        return text.strip() if text else "No text found in PDF."
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text: {str(e)}")

def extract_text_from_docx(docx_bytes):
    try:
        doc = docx.Document(io.BytesIO(docx_bytes))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text])
        return text.strip() if text else "No text found in DOCX."
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from DOCX: {str(e)}")

@app.post("/analyze")
def analyze_contract_endpoint(input_data: ContractInput):
    try:
        risk_score = analyze_contract(input_data.contract)
        risk_category = get_risk_category(risk_score)
        return {"riskScore": risk_score, "riskCategory": risk_category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing contract: {str(e)}")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()
    file_bytes = await file.read()

    if file_extension == "pdf":
        extracted_text = extract_text_from_pdf(file_bytes)
    elif file_extension == "docx":
        extracted_text = extract_text_from_docx(file_bytes)
    else:
        return {"error": "Unsupported file format. Please upload a PDF or DOCX."}

    return {"text": extracted_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)