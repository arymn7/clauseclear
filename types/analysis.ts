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
