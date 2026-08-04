import { CheckCircle2, FileText, RotateCcw, UploadCloud, Sparkles, Type, Trash2, Download } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import Loader from "../components/ui/Loader.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import clsx from "../utils/clsx.js";
import { archiveActiveAnalysis, updateAnalysis } from "../services/cvAnalysisService.js";
import CVVerificationForm from "../components/CVVerificationForm.jsx";
import useAuth from "../hooks/useAuth.js";

const checklist = [
  "Personal information detected",
  "Education section completed",
  "Three project entries found",
  "Missing quantified achievements",
];

export default function CVUpload() {
  const fileInputRef = useRef(null);
  const { getToken } = useAuth();
  const { analysis, fileName, fileUrl, hasAnalysis, resetAnalysis, startAnalysis, startManualAnalysis, updateLocalAnalysis, status, error } =
    useCVAnalysis();
  
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'manual'
  const [manualName, setManualName] = useState("");
  const [manualTargetRole, setManualTargetRole] = useState("");
  const [manualSkills, setManualSkills] = useState("");
  const [manualExperience, setManualExperience] = useState("");
  const [manualEducation, setManualEducation] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  // Set showVerificationForm when analysis becomes available
  useEffect(() => {
    if (hasAnalysis) {
      setShowVerificationForm(true);
    }
  }, [hasAnalysis]);

  const isProcessing = status === "uploading" || status === "analyzing";

  async function handleReplaceCV() {
    try {
      const token = await getToken();
      if (token) {
        await archiveActiveAnalysis(token);
      }
      resetAnalysis();
      setShowConfirmModal(false);
      setToastMessage("CV archived successfully. Ready for a new upload.");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Failed to archive analysis:", err);
      setToastMessage("Error archiving analysis, but you can still upload a new one.");
      resetAnalysis();
      setShowConfirmModal(false);
      setTimeout(() => setToastMessage(""), 3000);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      startAnalysis(file);
    }

    event.target.value = "";
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualTargetRole.trim() || !manualSkills.trim() || !manualName.trim()) {
      alert("Please enter Name, Target Role, and Skills at a minimum.");
      return;
    }
    startManualAnalysis(
      manualName.trim(), 
      manualSkills.trim(), 
      manualTargetRole.trim(),
      manualExperience.trim(),
      manualEducation.trim()
    );
  }

  const handleSaveVerifiedData = async (verifiedData) => {
    try {
      const token = await getToken();
      if (!token) {
        setToastMessage("You must be logged in to save.");
        return;
      }
      if (!analysis || !analysis._id) {
        setToastMessage("No active analysis found to update.");
        return;
      }

      await updateAnalysis(analysis._id, verifiedData, token);
      updateLocalAnalysis(verifiedData);
      
      setToastMessage("CV profile updated successfully!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update analysis:", err);
      setToastMessage("Failed to save changes. Please try again.");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Provide your skills to preview how SkillNova builds your learning roadmap and job matches."
        eyebrow="Profile Setup"
        title="Analyze your skills"
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="flex flex-col relative overflow-hidden">
          {/* Tabs */}
          {!hasAnalysis && !isProcessing && (
            <div className="flex w-full mb-6 border-b border-ink-100">
              <button
                className={clsx(
                  "flex-1 pb-3 text-sm font-bold border-b-2 transition-colors",
                  activeTab === "upload" 
                    ? "border-primary-500 text-primary-600" 
                    : "border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-200"
                )}
                onClick={() => setActiveTab("upload")}
              >
                Upload CV
              </button>
              <button
                className={clsx(
                  "flex-1 pb-3 text-sm font-bold border-b-2 transition-colors",
                  activeTab === "manual" 
                    ? "border-primary-500 text-primary-600" 
                    : "border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-200"
                )}
                onClick={() => setActiveTab("manual")}
              >
                Manual Entry
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center border-dashed border-2 hover:border-primary-400 transition-colors bg-white/40 text-center relative p-8 group min-h-[360px] rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {hasAnalysis || isProcessing ? (
              // Processing or Completed State
              <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[600px] overflow-hidden rounded-xl border border-primary-200 shadow-inner bg-white">
                
                {/* Background CV Preview */}
                {!isProcessing && fileUrl && (
                  <div className="absolute inset-0 w-full h-full z-0">
                    <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-full border-none opacity-40" title="CV Preview" />
                  </div>
                )}
                
                {/* Overlay Content */}
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none w-full h-full">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-sm transition-transform duration-300">
                    {isProcessing ? (
                      <Loader variant="glass" size="md" />
                    ) : (
                      <UploadCloud className="h-8 w-8" />
                    )}
                  </div>
                  {!isProcessing && (
                    <h2 className="mt-5 text-2xl font-extrabold text-ink-900 bg-white/60 px-5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                      Skill analysis completed
                    </h2>
                  )}
                  {error && <p className="mt-2 text-sm text-rose-600 font-medium bg-white/80 px-2 py-1 rounded">{error}</p>}
                  
                  {!isProcessing && !fileUrl && fileName && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary-100 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm">
                      <FileText className="h-5 w-5 text-primary-600" />
                      <p className="text-sm font-semibold text-primary-800">{fileName}</p>
                    </div>
                  )}

                  {isProcessing ? (
                    <div className="mt-6 w-full max-w-md">
                      <Loader 
                        text={status === "uploading" ? "Uploading your CV..." : "Analyzing your CV with AI..."}
                        secondaryText="This may take a few seconds."
                      />
                      <div className="mt-8 flex justify-center">
                        <Button 
                          icon={Trash2} 
                          onClick={() => setShowConfirmModal(true)} 
                          variant="secondary" 
                          disabled={isProcessing}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white shadow-sm disabled:opacity-50"
                        >
                          Remove CV
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row pointer-events-auto">
                      <Button 
                        icon={RotateCcw} 
                        onClick={() => setShowConfirmModal(true)} 
                        variant="secondary" 
                        className="text-primary-700 border-primary-200 hover:bg-primary-50 bg-white/90 backdrop-blur-sm shadow-sm"
                      >
                        Replace Current CV
                      </Button>
                    </div>
                  )}
                </div>

                {/* Download Button floating at top right */}
                {!isProcessing && fileUrl && (
                  <a 
                    href={fileUrl} 
                    download={fileName || "CV.pdf"}
                    className="absolute top-4 right-4 z-20 pointer-events-auto bg-white border border-primary-200 text-primary-700 p-2.5 rounded-xl shadow-md hover:bg-primary-50 hover:text-primary-800 transition flex items-center gap-2 font-semibold text-sm backdrop-blur-sm"
                    title="Download CV"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>
            ) : (
              // Input Forms
              <div className="w-full max-w-md flex flex-col items-center">
                {error && (
                  <div className="w-full mb-4 rounded-lg bg-rose-50 p-4 border border-rose-200 text-left">
                    <p className="text-sm font-bold text-rose-800">Analysis Failed</p>
                    <p className="mt-1 text-sm text-rose-600">{error}</p>
                  </div>
                )}
                {activeTab === "upload" ? (
                  <>
                    <input
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      type="file"
                    />
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-ink-900">Upload a CV to start</h2>
                    <p className="mt-2 text-sm leading-6 text-ink-500 mb-8">
                      Supports PDF and DOCX files up to 5 MB.
                    </p>
                  </>
                ) : (
                  <div className="w-full text-left">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-sm mx-auto mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Type className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-ink-900 text-center mb-6">Enter Skills Manually</h2>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto px-2">
                      <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-1">Target Role</label>
                        <input
                          type="text"
                          value={manualTargetRole}
                          onChange={(e) => setManualTargetRole(e.target.value)}
                          placeholder="e.g. Frontend Developer"
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-1">Current Skills (comma separated)</label>
                        <textarea
                          value={manualSkills}
                          onChange={(e) => setManualSkills(e.target.value)}
                          placeholder="e.g. HTML, CSS, JavaScript, React"
                          rows={2}
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-1">Experience Summary</label>
                        <textarea
                          value={manualExperience}
                          onChange={(e) => setManualExperience(e.target.value)}
                          placeholder="e.g. 3 years working as a junior web developer building React apps."
                          rows={2}
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-1">Education / Certifications</label>
                        <textarea
                          value={manualEducation}
                          onChange={(e) => setManualEducation(e.target.value)}
                          placeholder="e.g. BSc in Computer Science, AWS Certified Cloud Practitioner"
                          rows={2}
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 w-full">
                  {activeTab === "upload" ? (
                    <Button
                      className="w-full justify-center"
                      icon={UploadCloud}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose file
                    </Button>
                  ) : (
                    <Button
                      className="w-full justify-center"
                      icon={Sparkles}
                      onClick={handleManualSubmit}
                      disabled={!manualSkills || !manualTargetRole || !manualName}
                    >
                      Generate Analysis
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold bg-gradient-to-r from-ink-900 to-ink-600 bg-clip-text text-transparent">CV insights</h2>
          <p className="mt-1 text-sm text-ink-500">
            Generated insights appear after the simulated analysis completes.
          </p>
          {hasAnalysis ? (
            <>
              <div className="mt-6 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 shadow-sm border border-primary-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="h-24 w-24 text-primary-600" />
                </div>
                <p className="text-sm font-semibold text-primary-700 relative z-10">
                  Skill Match Score
                </p>
                <p className="mt-2 text-5xl font-extrabold tracking-tight text-primary-700 relative z-10">
                  {analysis.skillMatchScore || analysis.cvScore || 0}%
                </p>
                <p className="mt-3 text-sm leading-6 text-primary-800 relative z-10 max-w-sm">
                  {analysis.aiInsights || "Strong project experience, but achievements need clearer metrics."}
                </p>
              </div>
              <div className="mt-6 space-y-4">
                {checklist.map((item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <CheckCircle2 className="h-5 w-5 text-primary-500" />
                    <span className="text-sm font-medium text-ink-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-lg bg-ink-50 p-5 text-sm leading-6 text-ink-500">
              Upload your CV or enter skills manually to begin. Metrics, course matches,
              job recommendations, and learning progress are intentionally hidden
              until the analysis is complete.
            </div>
          )}
        </Card>
      </section>

      {hasAnalysis && showVerificationForm && (
        <section className="mt-8">
          <CVVerificationForm 
            initialData={analysis} 
            onSave={handleSaveVerifiedData}
            onCancel={() => setShowVerificationForm(false)}
          />
        </section>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Replace Current CV?</h3>
            <p className="mt-2 text-sm text-ink-500">
              Uploading a new CV will replace your current analysis, skill gap analysis, learning path, dashboard progress, and job recommendations. Previous analyses will be archived in your history.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setShowConfirmModal(false)} variant="secondary">
                Cancel
              </Button>
              <Button 
                onClick={handleReplaceCV} 
                className="bg-primary-600 text-white hover:bg-primary-700 border-transparent"
              >
                Replace CV
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] rounded-2xl bg-white border border-emerald-100 p-6 shadow-2xl flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300 min-w-[300px] text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-ink-900">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
