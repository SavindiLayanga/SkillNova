import { Bot, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useCVAnalysis from "../../hooks/useCVAnalysis.js";
import { chatWithAI } from "../../services/aiService.js";
import clsx from "../../utils/clsx.js";
import Loader from "./Loader.jsx";

export default function Chatbot({ isOpen, onClose }) {
  const cvContext = useCVAnalysis();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI Career Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const responseText = await chatWithAI(newMessages, null, cvContext);
      setMessages((prev) => [...prev, { role: "ai", text: responseText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `**Error:** ${err.message}` }
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-ink-900/30 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl transition-transform sm:max-w-md",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Bot className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-900">SkillNova AI</h2>
              <p className="text-xs text-ink-500">Career Assistant</p>
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat History */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-4 bg-white"
          ref={scrollRef}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={clsx(
                "flex max-w-[85%] flex-col rounded-2xl px-4 py-3 text-sm",
                msg.role === "ai"
                  ? "self-start rounded-tl-sm bg-ink-50 text-ink-800 border border-ink-100"
                  : "self-end rounded-tr-sm bg-primary-500 text-white shadow-sm ml-auto"
              )}
            >
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="self-start max-w-[85%]">
              <Loader size="sm" text="AI is typing..." />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-ink-100 p-4 bg-ink-50">
          <form
            className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white p-1 pl-4 shadow-sm focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400"
            onSubmit={handleSend}
          >
            <input
              className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
              placeholder="Ask for career advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm transition hover:bg-primary-600 disabled:opacity-50"
              disabled={!input.trim() || isTyping}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
