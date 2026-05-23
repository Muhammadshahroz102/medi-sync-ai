"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInput((prev) => prev + finalTranscript);
      };
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported or permitted in this browser. Try Google Chrome.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-2xl font-black text-blue-500">⚕️ Medi-Sync AI</span>
          </div>
          <nav className="space-y-2">
            <a href="#" className="block p-3 rounded bg-slate-800 text-white font-medium">Dashboard</a>
            <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Patient Records</a>
            <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Settings</a>
          </nav>
        </div>
        <div className="text-xs text-slate-500">v1.0.0 Pro Tier</div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Upper Dashboard Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-700">AI Clinical Scribe Studio</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Dr. Malik Hamza, BasketBall waly</span>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500">
                Source Conversation / Audio Stream
              </label>
              {isRecording && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div> 
            <textarea
              className="flex-1 w-full border border-slate-200 rounded-lg p-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Click 'Start Listening' and begin speaking into your mic to simulate a messy patient interaction..."
            /> 
            <div className="mt-4 flex gap-3">
              <button
                onClick={toggleRecording}
                className={`py-3 px-6 rounded-lg font-semibold transition shadow-sm ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {isRecording ? "🛑 Stop Listening" : "🎙️ Start Listening"}
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !input}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition shadow-sm flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Analyzing Conversation Stream...</span>
                ) : (
                  <span>Compile Structured Record</span>
                )}
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto flex flex-col">
            <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Generated Structured Electronic Health Record (EHR)
            </label> 
            {!result && !isLoading && (
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <span className="text-4xl mb-2">📋</span>
                <p>Waiting for data. Speak on the left side to compile clinical records.</p>
              </div>
            )}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-medium">Mistral is standardizing terminology and creating JSON schemas...</p>
              </div>
            )}
            {result && !isLoading && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 text-sm flex items-center space-x-2">
                  <span>✓ Record Compiled and Committed to PostgreSQL Storage.</span>
                </div> 
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                  <h4 className="font-bold text-slate-700 border-b pb-2 mb-2">Chief Symptoms</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {result.patient_concerns?.map((concern: string, index: number) => (
                      <li key={index}>{concern}</li>
                    )) || <li>No symptoms identified</li>}
                  </ul>
                </div>
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                  <h4 className="font-bold text-slate-700 border-b pb-2 mb-2">Clinical Diagnosis Estimate</h4>
                  <p className="text-slate-600 font-medium">{result.diagnosis_guess || "N/A"}</p>
                </div>
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                  <h4 className="font-bold text-slate-700 border-b pb-2 mb-2">Prescriptions & Dosing Matrix</h4>
                  <div className="space-y-2">
                    {result.prescriptions?.map((rx: any, index: number) => (
                      <div key={index} className="flex justify-between border-b border-slate-200/60 pb-1 text-sm">
                        <span className="font-semibold text-slate-700">{rx.name}</span>
                        <span className="text-slate-500">{rx.dosage}</span>
                      </div>
                    )) || <p className="text-slate-500 text-sm">No therapeutics prescribed.</p>}
                  </div>
                </div>
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                  <h4 className="font-bold text-slate-700 border-b pb-2 mb-2">Follow-up Protocol</h4>
                  <p className="text-slate-600 text-sm">{result.follow_up || "None required."}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}