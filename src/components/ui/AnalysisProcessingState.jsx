import { LoaderCircle } from "lucide-react";
import Card from "./Card.jsx";

export default function AnalysisProcessingState({ status }) {
  return (
    <Card className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary-500" />
      <h2 className="mt-5 text-2xl font-bold text-ink-900">
        {status === "uploading" ? "Uploading your CV" : "Analyzing your CV"}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500">
        SkillNova is preparing your career insights. Analysis metrics, charts,
        and recommendations will appear when this step is complete.
      </p>
    </Card>
  );
}
