import type { AnalysisResult } from "../types/analysis";

type PythonAnalysisResponse = {
  contract_text: string;
  analysis: AnalysisResult;
};

type PythonAnalysisErrorResponse = {
  detail?: string;
  error?: string;
};

function isPythonAnalysisResponse(payload: unknown): payload is PythonAnalysisResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return typeof candidate.contract_text === "string" && typeof candidate.analysis === "object";
}

function getAnalysisServiceUrl() {
  const serviceUrl = process.env.ANALYSIS_SERVICE_URL;

  if (!serviceUrl) {
    throw new Error("Missing ANALYSIS_SERVICE_URL.");
  }

  return serviceUrl.replace(/\/$/, "");
}

export async function analyzeContractWithPython(file: File): Promise<PythonAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getAnalysisServiceUrl()}/analyze`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const payload = (await response.json()) as PythonAnalysisResponse | PythonAnalysisErrorResponse;

  if (!response.ok) {
    const errorPayload = payload as PythonAnalysisErrorResponse;
    const message =
      typeof errorPayload === "object" && errorPayload
        ? errorPayload.detail || errorPayload.error || "Python analysis service request failed."
        : "Python analysis service request failed.";

    throw new Error(message);
  }

  if (!isPythonAnalysisResponse(payload)) {
    throw new Error("Python analysis service returned an invalid response.");
  }

  return payload;
}
