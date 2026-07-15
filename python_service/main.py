from __future__ import annotations

import io
import json
import os
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from google.genai import Client
from google.genai import types as genai_types
from pydantic import BaseModel
from pypdf import PdfReader


class SectionSummary(BaseModel):
    section: str
    summary: str


class AnalysisResult(BaseModel):
    summary: str
    risks: list[str]
    obligations: list[str]
    red_flags: list[str]
    section_summaries: list[SectionSummary]


class AnalyzeResponse(BaseModel):
    contract_text: str
    analysis: AnalysisResult


class HealthResponse(BaseModel):
    status: Literal["ok"]


app = FastAPI(title="ClauseClear Analysis Service", version="0.1.0")


ANALYSIS_SCHEMA = genai_types.Schema(
    type=genai_types.Type.OBJECT,
    properties={
        "summary": genai_types.Schema(type=genai_types.Type.STRING),
        "risks": genai_types.Schema(
            type=genai_types.Type.ARRAY,
            items=genai_types.Schema(type=genai_types.Type.STRING),
        ),
        "obligations": genai_types.Schema(
            type=genai_types.Type.ARRAY,
            items=genai_types.Schema(type=genai_types.Type.STRING),
        ),
        "red_flags": genai_types.Schema(
            type=genai_types.Type.ARRAY,
            items=genai_types.Schema(type=genai_types.Type.STRING),
        ),
        "section_summaries": genai_types.Schema(
            type=genai_types.Type.ARRAY,
            items=genai_types.Schema(
                type=genai_types.Type.OBJECT,
                properties={
                    "section": genai_types.Schema(type=genai_types.Type.STRING),
                    "summary": genai_types.Schema(type=genai_types.Type.STRING),
                },
                required=["section", "summary"],
            ),
        ),
    },
    required=["summary", "risks", "obligations", "red_flags", "section_summaries"],
)


def get_gemini_client() -> Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY.")

    return Client(api_key=api_key)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    if not pdf_bytes:
        raise ValueError("Uploaded PDF is empty.")

    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    contract_text = "\n".join(pages).strip()

    if not contract_text:
        raise ValueError("Could not extract text from PDF.")

    return contract_text


def analyze_contract_text(contract_text: str) -> AnalysisResult:
    model = os.environ.get("GEMINI_MODEL", "gemini-1.5-pro")
    client = get_gemini_client()

    prompt = "\n".join(
        [
            "Analyze the following contract text.",
            "Return only valid JSON using this exact shape:",
            "{",
            '  "summary": "string",',
            '  "risks": ["string"],',
            '  "obligations": ["string"],',
            '  "red_flags": ["string"],',
            '  "section_summaries": [{"section": "string", "summary": "string"}]',
            "}",
            "Do not include markdown or extra keys.",
            "",
            "Contract:",
            contract_text,
        ]
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ANALYSIS_SCHEMA,
            temperature=0.1,
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    try:
        parsed = json.loads(response.text)
        return AnalysisResult.model_validate(parsed)
    except (json.JSONDecodeError, ValueError) as error:
        raise RuntimeError("Gemini returned invalid JSON.") from error


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
    file_name = file.filename or ""

    if file.content_type != "application/pdf" and not file_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        pdf_bytes = await file.read()
        contract_text = extract_text_from_pdf(pdf_bytes)
        analysis = analyze_contract_text(contract_text)
        return AnalyzeResponse(contract_text=contract_text, analysis=analysis)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
