import { ResultsView } from "./resultsView";

export default function ResultsPage({
  params,
}: {
  params: { analysisId: string };
}) {
  const { analysisId } = params;
  return <ResultsView analysisId={analysisId} />;
}

