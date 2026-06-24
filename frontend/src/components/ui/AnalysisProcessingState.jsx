import Card from "./Card.jsx";
import Loader from "./Loader.jsx";

export default function AnalysisProcessingState({ status }) {
  return (
    <Card className="flex flex-col items-center justify-center p-0 overflow-hidden min-h-[320px]">
      <Loader 
        text={status === "uploading" ? "Uploading your CV..." : "Analyzing your CV with AI..."}
        secondaryText="SkillNova is preparing your career insights. Analysis metrics, charts, and recommendations will appear when this step is complete."
      />
    </Card>
  );
}
