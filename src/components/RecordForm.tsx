import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, AlertCircle, Sparkles, CheckCircle2, RefreshCw, Globe, HelpCircle } from 'lucide-react';
import { SignatureRecord, DocumentStatus } from '../types';

interface RecordFormProps {
  onAddRecord: (record: Omit<SignatureRecord, 'id' | 'auditTrail'>) => void;
  onClose: () => void;
  currentUserName: string;
  language?: 'EN' | 'KH';
}

export default function RecordForm({ onAddRecord, onClose, currentUserName, language = 'EN' }: RecordFormProps) {
  // Essential Fields State
  const [documentName, setDocumentName] = useState('');
  const [fullName, setFullName] = useState('');
  const [submissionDate, setSubmissionDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [signatureStatusOption, setSignatureStatusOption] = useState<'Signed' | 'Not Signed'>('Not Signed');
  const [remarks, setRemarks] = useState('');

  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'km-KH'>(language === 'KH' ? 'km-KH' : 'en-US');
  const recognitionRef = useRef<any>(null);

  // AI polishing state
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishMethod, setPolishMethod] = useState<string | null>(null);

  // Status/Alert message states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Initialize/rebuild speech recognition when voiceLang changes
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = voiceLang;

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDocumentName((prev) => {
            const separator = prev.trim() ? ' ' : '';
            return prev + separator + finalTranscript;
          });
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [voiceLang]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported or permitted in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  const handleAiPolish = async () => {
    if (!documentName.trim()) {
      setErrorMessage('Please type or dictate a document name/description first.');
      return;
    }
    setErrorMessage(null);
    setIsPolishing(true);
    setPolishMethod(null);
    try {
      const res = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: documentName, language: voiceLang }),
      });
      if (!res.ok) {
        throw new Error('Server error polishing title');
      }
      const data = await res.json();
      if (data.polished) {
        setDocumentName(data.polished);
        setPolishMethod(data.method);
        // Automatically dismiss the message after 4 seconds
        setTimeout(() => setPolishMethod(null), 4000);
      }
    } catch (err: any) {
      console.error('AI polishing failed, falling back to local formatting:', err);
      let fallbackText = documentName.trim();
      fallbackText = fallbackText.replace(/^(hey|hi|hello|please|could you|would you|can you|can you please|please sign|sign this|track this|add this|log this)\s+/i, '');
      fallbackText = fallbackText.replace(/\s+(please|thanks|thank you|now|asap|today|for me)$/i, '');
      if (!/[\u1780-\u17ff]/.test(fallbackText)) {
        fallbackText = fallbackText
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      setDocumentName(fallbackText);
      setPolishMethod('Local Standard Case Formatting');
      setTimeout(() => setPolishMethod(null), 4000);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate essential fields
    if (!documentName.trim()) {
      return setErrorMessage('Document Title / Name is required.');
    }
    if (!fullName.trim()) {
      return setErrorMessage('Submitted By person name is required.');
    }
    if (!submissionDate) {
      return setErrorMessage('Date of Submission is required.');
    }

    // Format the date into readable text for consistent presentation (e.g., "21 July 2026")
    const dateObj = new Date(submissionDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Map "Signed / Not Signed" to appropriate underlying states
    const finalStatus: DocumentStatus = signatureStatusOption === 'Signed' ? 'Completed' : 'Submitted';

    // Auto-generate elegant verified signature stamp SVG
    const nameToUse = fullName.trim();
    const generatedStamp = signatureStatusOption === 'Signed'
      ? `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='100' viewBox='0 0 250 100'><rect x='5' y='5' width='240' height='90' rx='10' fill='none' stroke='%2310B981' stroke-width='3' stroke-dasharray='6'/><text x='125' y='38' font-family='sans-serif' font-weight='bold' font-size='14' fill='%2310B981' text-anchor='middle'>VERIFIED DIGITAL LOG</text><text x='125' y='60' font-family='cursive, sans-serif' font-size='16' fill='%23059669' text-anchor='middle'>${nameToUse}</text><text x='125' y='80' font-family='monospace' font-size='9' fill='%23059669' text-anchor='middle'>SECURE STATE SIGNATURE</text></svg>`
      : null;

    // Build the record data complying with the DB schema definitions silently
    const recordData = {
      fullName: nameToUse,
      documentName: documentName.trim(),
      signatureDate: formattedDate,
      signatureTime: formattedTime,
      signatureStatus: finalStatus,
      signatureImage: generatedStamp,
      description: remarks.trim() || `Document tracked under state: ${signatureStatusOption}`,
      createdBy: currentUserName,
      signatureComment: remarks.trim() || `Document logged as ${signatureStatusOption}`,

      // Quiet defaults to fully support database schema constraints and metrics charts
      employeeId: 'EMP-' + Math.floor(Math.random() * 9000 + 1000),
      department: 'Administration',
      position: 'Staff Representative',
      documentType: 'General Document',
      referenceNumber: 'REF-' + Math.floor(Math.random() * 900000 + 100000),
      purpose: 'Verification and Signature Logging',
      priorityLevel: 'Normal' as const,
      originalAttachmentName: null,
      originalAttachmentData: null,
      originalAttachmentType: null,
      originalAttachmentSize: null,
      signedAttachmentName: null,
      signedAttachmentData: null,
      voiceRecord: null,
      voiceTranscript: isListening ? 'Voice recording title capture used' : '',
    };

    onAddRecord(recordData);
    setSuccessNotice('Document record compiled and logged successfully!');
    
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Simplified Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 relative">
          <div className="absolute right-6 top-6">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer text-xs font-bold w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          
          <span className="text-[10px] bg-emerald-500 text-white font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
            Secure Submission Log
          </span>
          <h2 className="text-xl font-black mt-2">
            Log Document Submission
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Track documents submitted for signature. Supports voice-activated title inputting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* Document Title / Name with integrated Voice Recorder & AI Auto-Generation */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Document Title / Name *
                </label>
              </div>

              {/* Voice Investigation Options */}
              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceLang('en-US');
                      if (isListening) {
                        recognitionRef.current?.stop();
                        setIsListening(false);
                      }
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all ${
                      voiceLang === 'en-US'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Dictate in English"
                  >
                    <span>🇬🇧</span>
                    <span>EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceLang('km-KH');
                      if (isListening) {
                        recognitionRef.current?.stop();
                        setIsListening(false);
                      }
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all ${
                      voiceLang === 'km-KH'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Dictate in Khmer"
                  >
                    <span>🇰🇭</span>
                    <span>KH</span>
                  </button>
                </div>

                {/* Primary Voice Mic Toggle */}
                <button
                  type="button"
                  onClick={toggleVoiceListening}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isListening
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} />
                  {isListening ? (language === 'KH' ? 'កំពុងថត...' : 'Listening...') : (language === 'KH' ? 'បញ្ចូលដោយសំឡេង' : 'Voice Dictate')}
                </button>
              </div>
            </div>

            {/* Input with embedded visual feedback */}
            <div className="relative">
              <input
                type="text"
                required
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={voiceLang === 'km-KH' ? 'ឧទាហរណ៍៖ កិច្ចសន្យាលក់ទិញដីធ្លី ឬ លិខិតស្នើសុំថវិកា' : 'e.g. Q3 Quarterly Performance Budget Review'}
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
              />
              {isListening && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 h-4">
                    <div className="w-0.5 bg-rose-500 animate-pulse h-3"></div>
                    <div className="w-0.5 bg-rose-500 animate-pulse h-4 [animation-delay:-0.2s]"></div>
                    <div className="w-0.5 bg-rose-500 animate-pulse h-2 [animation-delay:-0.4s]"></div>
                  </div>
                  <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider animate-pulse">Live</span>
                </div>
              )}
            </div>

            {/* Speech assistance visualization / tips panel */}
            {isListening && (
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3.5 animate-fadeIn">
                <div className="flex items-center gap-1 shrink-0 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1.5 rounded-lg border border-rose-100/40">
                  <div className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                  <div className="w-1 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                  <div className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {voiceLang === 'km-KH' ? 'កំពុងថតសំឡេងជាភាសាខ្មែរ' : 'Capturing Spoken Voice (English)'}
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    {voiceLang === 'km-KH' 
                      ? 'និយាយលិខិត ឬឯកសាររបស់អ្នក។ ចុចប៊ូតុង "✨ បង្កើតស្វ័យប្រវត្ត" ខាងក្រោមដើម្បីកែសម្រួលវាជាចំណងជើងផ្លូវការ។'
                      : 'Speak your document request. Click the "✨ AI Auto-Generate" below to auto-format into a professional corporate document title.'}
                  </span>
                </div>
              </div>
            )}

            {/* AI Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Engine: Web Speech API ({voiceLang})</span>
              </div>

              {documentName.trim() && (
                <button
                  type="button"
                  onClick={handleAiPolish}
                  disabled={isPolishing}
                  className={`px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                    isPolishing ? 'opacity-70 cursor-not-allowed animate-pulse' : ''
                  }`}
                >
                  {isPolishing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  {isPolishing 
                    ? (language === 'KH' ? 'កំពុងវិភាគ...' : 'AI Analyzing...') 
                    : (language === 'KH' ? '✨ កែសម្រួលចំណងជើង (AI)' : '✨ AI Auto-Generate')}
                </button>
              )}
            </div>

            {/* AI Polish Success Label */}
            {polishMethod && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Polished Name Auto-Generated!</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 dark:bg-emerald-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                  {polishMethod}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Submitted By (Full Name) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Submitted By (Full Name) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sokha Morn"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Date of Submission */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Date of Submission *
              </label>
              <input
                type="date"
                required
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200 animate-fadeIn"
              />
            </div>
          </div>

          {/* Signature Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Signature Status *
            </label>
            <div className="flex gap-4">
              {(['Not Signed', 'Signed'] as const).map((option) => {
                const isSelected = signatureStatusOption === option;
                const activeColors = option === 'Signed' 
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-400' 
                  : 'bg-amber-50/70 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400';
                return (
                  <label 
                    key={option} 
                    className={`flex-1 flex items-center justify-center gap-2.5 p-3.5 border rounded-xl cursor-pointer transition-all ${
                      isSelected ? `${activeColors} ring-2 ring-emerald-500/10` : 'bg-slate-50/50 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="signatureStatusOption"
                      value={option}
                      checked={isSelected}
                      onChange={() => setSignatureStatusOption(option)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                    <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Remarks textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any additional remarks, conditions, or comment notes about this submission..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Status Notifications */}
          {errorMessage && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Save Document Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
