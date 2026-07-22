import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initializer for Google GenAI to avoid crashing if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// Fallback regex-based parser when API Key is missing or fail
// Fallback regex-based parser when API Key is missing or fails
function fallbackParse(transcript: string) {
  const result = {
    employeeId: '',
    fullName: '',
    department: '',
    documentName: '',
    documentType: 'Approval',
    purpose: '',
    priorityLevel: 'Normal',
  };

  const cleanLower = transcript.toLowerCase();

  // 1. Employee ID
  const empMatch = transcript.match(/(?:employee|id|staff|code)\s*#?(\d+)/i) || transcript.match(/\b\d{4,6}\b/);
  if (empMatch) {
    result.employeeId = empMatch[1] || empMatch[0];
  } else {
    result.employeeId = '1025';
  }

  // 2. Department
  const depts = ['HR', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Engineering', 'Operations', 'Legal', 'Administration', 'IT'];
  let foundDept = '';
  for (const dept of depts) {
    if (cleanLower.includes(dept.toLowerCase())) {
      foundDept = dept;
      break;
    }
  }
  result.department = foundDept || 'Finance';

  // 3. Priority Level
  if (cleanLower.includes('urgent') || cleanLower.includes('asap')) {
    result.priorityLevel = 'Urgent';
  } else if (cleanLower.includes('high') || cleanLower.includes('important')) {
    result.priorityLevel = 'High';
  } else {
    result.priorityLevel = 'Normal';
  }

  // 4. Document Type
  const docTypes = ['Contract', 'Report', 'Request', 'Approval', 'Memo', 'Agreement', 'Form', 'Policy', 'NDA', 'Invoice', 'Consent'];
  let detectedType = 'Approval';
  for (const type of docTypes) {
    if (cleanLower.includes(type.toLowerCase())) {
      detectedType = type;
      break;
    }
  }
  result.documentType = detectedType;

  // 5. Document Name (heuristic extraction)
  // e.g. "Received payroll adjustment approval request..." -> payroll adjustment approval request
  const docNameMatch = transcript.match(/(?:received|record|for|document|title)\s+([^,.]+?(?:agreement|contract|report|request|approval|memo|nda))\b/i) ||
                       transcript.match(/([^,.]+?(?:adjustment|agreement|contract|report|request|approval|memo|nda))\b/i);
  if (docNameMatch) {
    result.documentName = docNameMatch[1].trim().replace(/^\s*(a|an|the)\s+/i, '');
  } else {
    result.documentName = 'Payroll Adjustment Approval Request';
  }

  // 6. Purpose
  if (cleanLower.includes('review') || cleanLower.includes('signature') || cleanLower.includes('sign')) {
    result.purpose = 'Review and Signature Approval';
  } else {
    result.purpose = 'Official Submission & Compliance Archival';
  }

  // 7. Submitted By (fullName)
  const nameMatch = transcript.match(/(?:submitted by|by|from)\s+([A-Z][a-z]+)/i) ||
                    transcript.match(/([A-Z][a-z]+)\s+(?:at|today|submitted)/i);
  if (nameMatch) {
    result.fullName = nameMatch[1];
  } else {
    // Khmer & English helper names mapping
    const commonNames = ['Sokha', 'Chantha', 'Sopheap', 'Piseth', 'Sophia', 'Vannak', 'David', 'Seng', 'Phon'];
    let matchedName = '';
    for (const name of commonNames) {
      if (cleanLower.includes(name.toLowerCase())) {
        matchedName = name;
        break;
      }
    }
    result.fullName = matchedName || 'Sokha';
  }

  // Capitalize name
  result.fullName = result.fullName.charAt(0).toUpperCase() + result.fullName.slice(1);

  return result;
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.post('/api/parse-voice', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Transcript string is required' });
  }

  console.log('Parsing transcript:', transcript);

  try {
    const ai = getAiClient();
    if (!ai) {
      console.log('No Gemini API client configured. Using heuristic parsing.');
      const parsed = fallbackParse(transcript);
      return res.json({ parsed, method: 'Heuristic NLP (Offline)' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Parse the following spoken command transcript into structured fields for a document signature record. Extract employeeId, fullName, department, documentName, documentType, purpose, and priorityLevel.
If some fields are missing from the text, infer smart defaults where possible.
Transcript to parse:
"${transcript}"`,
      config: {
        systemInstruction: "You are an expert NLP parser that extracts corporate record metadata from voice transcriptions. Ensure employeeId is a numeric string or 'Unknown' if not mentioned. department must be a standard department (e.g. HR, Sales, IT, Finance, Engineering, Operations, Legal, Administration). documentType should be one of: Contract, Report, Request, Approval, Memo, Agreement. priorityLevel must be one of: Normal, Urgent, High.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeId: {
              type: Type.STRING,
              description: 'The employee identification number or code.',
            },
            fullName: {
              type: Type.STRING,
              description: 'The full name of the employee submitting or giving the document (e.g. Sokha).',
            },
            department: {
              type: Type.STRING,
              description: 'Department name.',
            },
            documentName: {
              type: Type.STRING,
              description: 'Full descriptive title of the document (e.g. Payroll Adjustment Approval Request).',
            },
            documentType: {
              type: Type.STRING,
              description: 'The type category (Contract, Report, Request, Approval, Memo).',
            },
            purpose: {
              type: Type.STRING,
              description: 'Purpose or reason for submission (e.g. Review and Signature Approval).',
            },
            priorityLevel: {
              type: Type.STRING,
              description: 'Priority of the document (Normal, Urgent, High).',
            },
          },
          required: ['employeeId', 'fullName', 'department', 'documentName', 'documentType', 'purpose', 'priorityLevel'],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ parsed, method: 'Gemini 3.5 Flash' });
    } else {
      throw new Error('Empty response from Gemini');
    }
  } catch (error: any) {
    console.error('Error parsing transcript with Gemini:', error);
    const parsed = fallbackParse(transcript);
    return res.json({ parsed, method: 'Heuristic NLP Fallback (due to api error)', error: error.message });
  }
});

// AI Document Title generation / polishing endpoint
app.post('/api/generate-title', async (req, res) => {
  const { transcript, language } = req.body;
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Transcript string is required' });
  }

  console.log('Generating polished document title from:', transcript);

  try {
    const ai = getAiClient();
    if (!ai) {
      console.log('No Gemini API client configured for title generation. Using smart heuristics.');
      // Heuristic fallback
      let polished = transcript.trim();
      // Remove conversational fillers
      polished = polished.replace(/^(hey|hi|hello|please|could you|would you|can you|can you please|please sign|sign this|track this|add this|log this)\s+/i, '');
      polished = polished.replace(/\s+(please|thanks|thank you|now|asap|today|for me)$/i, '');
      // Capitalize first letter of each word (Title Case) for English
      if (!/[\u0e80-\u0eff\u1780-\u17ff]/.test(polished)) {
        polished = polished
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return res.json({ polished, method: 'Heuristic Polish (Offline)' });
    }

    const isKhmer = language === 'km-KH' || /[\u1780-\u17ff]/.test(transcript);
    const systemInstruction = isKhmer 
      ? "You are an expert assistant. Polish the provided raw Khmer/English voice transcript or spoken request into a formal, clear, short and concise Document Title/Name. Do NOT add prefix titles, numbers, quotes, or conversational phrases. Return ONLY the final polished title, in appropriate professional Khmer or English. For example, if the user says 'សុំច្បាប់ ឈប់សម្រាក', you should output 'លិខិតសុំច្បាប់ឈប់សម្រាក'. If they say 'quarterly report', output 'Quarterly Performance Report'."
      : "You are an expert assistant. Polish the provided raw voice transcript or spoken description into a formal, clear, and highly professional Document Title/Name (Title Case). Do NOT add extra words, headers, prefixes (like 'Title:'), quotes, or explanations. Keep it under 6-7 words if possible. Return ONLY the polished name itself.";

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Transform this spoken transcript into a formal and professional document title: "${transcript}"`,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    const polishedText = response.text?.trim().replace(/^["']|["']$/g, '');
    if (polishedText) {
      return res.json({ polished: polishedText, method: 'Gemini 3.5 Flash' });
    } else {
      throw new Error('Empty response from Gemini');
    }
  } catch (error: any) {
    console.error('Error generating title with Gemini:', error);
    // Safe fallback
    let polished = transcript.trim();
    polished = polished.replace(/^(hey|hi|hello|please|could you|would you|can you|can you please|please sign|sign this)\s+/i, '');
    if (!/[\u1780-\u17ff]/.test(polished)) {
      polished = polished.charAt(0).toUpperCase() + polished.slice(1);
    }
    return res.json({ polished, method: 'Heuristic Polish Fallback', error: error.message });
  }
});

// AI Document list Executive Summarizer & Report Generator
app.post('/api/generate-summary', async (req, res) => {
  const { records, language } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Records array is required' });
  }

  console.log(`Generating executive report summary for ${records.length} records...`);

  try {
    const ai = getAiClient();
    if (!ai) {
      const statsEn = `### Executive Summary Report (Offline Heuristic Mode)
- **Total Registered Logs**: ${records.length} documents currently compiled in the secure vault.
- **Signed & Finalized Status**: ${records.filter((r: any) => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length} documents successfully verified and signed off.
- **Pending Actions**: ${records.filter((r: any) => r.signatureStatus !== 'Completed' && r.signatureStatus !== 'Approved & Signed').length} documents awaiting administrative signature.
- **Compliance Rating**: ${Math.round((records.filter((r: any) => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length / (records.length || 1)) * 100)}% of documents logged are fully signed.

*Please configure your GEMINI_API_KEY environment variable to activate real-time Gemini AI report generation and live analytics.*`;
      
      const statsKh = `### របាយការណ៍សង្ខេបប្រតិបត្តិ (របៀប Heuristic ក្រៅបណ្តាញ)
- **ឯកសារចុះបញ្ជីសរុប**: មានចំនួន ${records.length} ឯកសារត្រូវបានរក្សាទុកដោយសុវត្ថិភាព។
- **ស្ថានភាពចុះហត្ថលេខារួច**: មានចំនួន ${records.filter((r: any) => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length} ឯកសារត្រូវបានផ្ទៀងផ្ទាត់និងអនុម័តរួចរាល់។
- **កំពុងរង់ចាំការពិនិត្យ**: មានចំនួន ${records.filter((r: any) => r.signatureStatus !== 'Completed' && r.signatureStatus !== 'Approved & Signed').length} ឯកសារកំពុងរង់ចាំការចុះហត្ថលេខា។
- **សន្ទស្សន៍អនុលោមភាព**: ${Math.round((records.filter((r: any) => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length / (records.length || 1)) * 100)}% នៃលិខិតទាំងអស់ត្រូវបានចុះហត្ថលេខាពេញលេញ។

*សូមកំណត់កូដសម្ងាត់ GEMINI_API_KEY នៅក្នុងការកំណត់ ដើម្បីដំណើរការការវិភាគផ្សាយផ្ទាល់ និងរបាយការណ៍ស្វ័យប្រវត្តិតាមរយៈ Gemini AI។*`;

      return res.json({ summary: language === 'KH' ? statsKh : statsEn });
    }

    const recordsInfo = records.map((r: any) => ({
      id: r.id,
      title: r.documentName,
      submittedBy: r.fullName,
      status: r.signatureStatus,
      date: r.signatureDate,
      remarks: r.signatureComment || r.description || ''
    }));

    const isKhmer = language === 'KH';
    const systemInstruction = isKhmer
      ? "You are an expert executive reporting analyst. Analyze the provided JSON list of signed & pending document logs, and write a high-level corporate summary report in professional, elegant Khmer. Highlight the total count, signed vs pending ratios, key submitters, and notable administrative actions. Use bullet points and clean Markdown structure. Do not use conversational preambles. Focus on professional language."
      : "You are an expert executive reporting analyst. Analyze the provided JSON list of signed & pending document logs, and write a high-level corporate summary report in professional, elegant English. Highlight the total count, signed vs pending ratios, key submitters, and notable administrative actions. Use bullet points and clean Markdown structure. Do not use conversational preambles.";

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate an executive document audit report for the following logs: ${JSON.stringify(recordsInfo)}`,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const summary = response.text?.trim();
    if (summary) {
      return res.json({ summary });
    } else {
      throw new Error('Empty response from model');
    }
  } catch (error: any) {
    console.error('Error generating summary with Gemini:', error);
    // Safe offline fallback in case of rate limits or service interruption
    const statsEn = `### Executive Summary Report (Service Fallback)
- **Total Registered Logs**: ${records.length} documents currently compiled in the secure vault.
- **Signed & Finalized Status**: ${records.filter((r: any) => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length} documents successfully verified and signed off.
- **Pending Actions**: ${records.filter((r: any) => r.signatureStatus !== 'Completed' && r.signatureStatus !== 'Approved & Signed').length} documents awaiting administrative signature.`;
    return res.json({ summary: statsEn, error: error.message });
  }
});

// Setup Vite Dev Server / Static Ingress
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static build handler integrated.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express application active at http://localhost:${PORT}`);
  });
}

setupVite();
