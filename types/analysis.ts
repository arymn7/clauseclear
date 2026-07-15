export type SectionSummary = {
  section: string;
  summary: string;
};

export type AnalysisResult = {
  summary: string;
  risks: string[];
  obligations: string[];
  red_flags: string[];
  section_summaries: SectionSummary[];
};

export type AnalyzeResponse = {
  analysis: AnalysisResult;
  file_name: string;
};

export type AnalysisHistoryItem = {
  id: string;
  user_id: string;
  file_name: string;
  analysis: AnalysisResult;
  created_at: string;
};

export type AnalysisRecordRow = {
  id: string;
  user_id: string;
  file_name: string;
  contract_text: string;
  analysis_json: AnalysisResult;
  created_at: string;
};
