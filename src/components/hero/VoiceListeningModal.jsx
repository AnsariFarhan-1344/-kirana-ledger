import React, { useState, useEffect } from "react";
import { Mic, X, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { audioService } from "../../services/audioService";
import { useLedger } from "../../context/LedgerContext";
import { sampleVoicePhrases } from "../../data/seedData";

export function VoiceListeningModal({ isOpen, onClose }) {
  const { interpretInput, showToast } = useLedger();
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("listening"); // 'listening' | 'processing' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      audioService.stopListening();
      setTranscript("");
      setStatus("listening");
      setErrorMessage("");
      return;
    }

    setStatus("listening");
    setTranscript("");
    setErrorMessage("");

    // Start Web Speech recognition
    audioService.startListening({
      onInterim: (text) => {
        setTranscript(text);
      },
      onFinal: (text) => {
        setTranscript(text);
        setStatus("processing");
        setTimeout(() => {
          interpretInput(text, "voice");
          onClose();
        }, 500);
      },
      onError: (err) => {
        console.warn("Speech recognition error:", err);
        if (err === "not-allowed") {
          setErrorMessage("Microphone access denied. You can click any sample voice below to test instantly!");
        } else {
          setErrorMessage("Could not capture audio. Try one of our instant sample voice phrases below.");
        }
        setStatus("error");
      },
      onEnd: () => {
        // Recognition ended
      },
    });

    return () => {
      audioService.stopListening();
    };
  }, [isOpen]);

  const handleSimulateVoice = (phraseText) => {
    setStatus("listening");
    setTranscript("");
    setErrorMessage("");

    // Simulate real-time word by word speech dictation
    const words = phraseText.split(" ");
    let current = "";
    words.forEach((word, index) => {
      setTimeout(() => {
        current += (index > 0 ? " " : "") + word;
        setTranscript(current);

        if (index === words.length - 1) {
          setTimeout(() => {
            setStatus("processing");
            setTimeout(() => {
              interpretInput(phraseText, "voice");
              onClose();
            }, 600);
          }, 400);
        }
      }, (index + 1) * 220);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] overflow-hidden p-6 sm:p-8 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Listening Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Voice Assistant Active</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900">
            {status === "listening" && "Listening to shopkeeper..."}
            {status === "processing" && "AI processing transaction..."}
            {status === "error" && "Voice Input Ready"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Speak naturally in Hinglish, Hindi, or English (e.g. "Ramesh ne 500 ka maal liya")
          </p>
        </div>

        {/* Microphone Animated Waveform Visualizer */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings */}
            {status === "listening" && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-red-500/10 animate-ping duration-1000" />
                <div className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-pulse" />
              </>
            )}

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                status === "listening"
                  ? "bg-[#991B1B] text-white scale-105"
                  : status === "processing"
                  ? "bg-amber-600 text-white animate-spin"
                  : "bg-slate-700 text-white"
              }`}
            >
              {status === "processing" ? (
                <Sparkles className="w-8 h-8" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </div>
          </div>

          {/* Animated sound bars */}
          {status === "listening" && (
            <div className="flex items-center justify-center space-x-1.5 mt-6 h-8">
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-1" />
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-2" />
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-3" />
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-4" />
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-5" />
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-2" />
              <span className="w-1.5 bg-[#991B1B] rounded-full animate-wave-4" />
            </div>
          )}
        </div>

        {/* Live Transcript Display */}
        <div className="min-h-[64px] bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl p-3.5 mb-6 flex items-center justify-center">
          {transcript ? (
            <p className="text-slate-800 font-semibold text-lg italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-slate-400 text-sm italic">
              Speak now... voice words will appear here in real-time
            </p>
          )}
        </div>

        {/* Fallback / Error Help */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Instant Voice Test Buttons (Ensures 100% demoability anywhere) */}
        <div className="pt-4 border-t border-[#F1ECE1]">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Or click a voice sample to simulate:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {sampleVoicePhrases.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateVoice(p.text)}
                className="p-2 rounded-lg bg-white border border-[#DACFBF] hover:border-[#991B1B] hover:bg-red-50/50 text-xs font-medium text-slate-700 transition-all flex items-center space-x-2 active:scale-98"
              >
                <Mic className="w-3 h-3 text-[#991B1B] shrink-0" />
                <span className="truncate">{p.text}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
