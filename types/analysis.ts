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
