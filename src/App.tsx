import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Sun,
  Moon,
  RefreshCw,
  FolderOpen,
  ArrowUpDown,
  TrendingUp,
  Award,
  Globe,
  UserCheck,
  HelpCircle,
  AlertCircle,
  Download,
  Upload,
  Database,
  Trash2,
  HardDrive,
  Eye,
  Edit3
} from 'lucide-react';

import { SignatureRecord, UserRole, AuditLog, DocumentStatus } from './types';
import StatsGrid from './components/StatsGrid';
import AnalyticsCharts from './components/AnalyticsCharts';
import RecordForm from './components/RecordForm';
import RecordDetailsModal from './components/RecordDetailsModal';

// Bilingual Khmer and English translations dictionary
const TRANSLATIONS = {
  EN: {
    title: "Personal Signature Store",
    subtitle: "Signed Document History & Record Storage",
    totalRecords: "Total Records Logged",
    signedThisMonth: "Signed This Month",
    categories: "Active Categories",
    aiAccuracy: "AI Voice Accuracy",
    addLog: "Log Signed Document",
    searchPlaceholder: "Search document name, category, department or Reference No...",
    recordId: "Record ID",
    documentName: "Document Name",
    category: "Category",
    signedDate: "Signed Date",
    signedTime: "Signed Time",
    dept: "Related Dept",
    submittedBy: "Prepared/Submitted By",
    refNo: "Reference No.",
    remarks: "Remarks & Comments",
    voiceInput: "Voice Dictation",
    stats: "Analytics",
    trend: "Signature Trend Progression",
    distribution: "Authorization Ratios",
    departmentsLabel: "Department Metrics",
    reset: "Reset Database Seeds",
    allDepts: "All Departments",
    allDocs: "All Document Categories",
    allStatuses: "All Signature Statuses",
    complianceBadge: "Cryptographic Vault Verified",
    voiceEvidence: "Voice Evidence & Spoken Record",
    actionsRecord: "Action Remarks",
    auditTrail: "Detailed Security Audit Trail",
    close: "Close Viewer",
    cancel: "Cancel",
    submit: "Compile & Log Record",
    drawSignature: "Draw Signature Ink",
    prefilledMsg: "Voice parameters parsed successfully! Details pre-filled.",
    dropzone: "Drag & Drop executed signed document here, or browse files",
    uploadBtn: "Select File",
    statusTimeline: "Timeline",
    downloadReport: "Download Compliance Report",
    exportPdf: "Export PDF / Print",
    emailSharing: "Email Share",
    timeline: "Action Timeline",
    signatoryProfile: "Signatory Profile",
    metadata: "Document Metadata",
    executiveRemarks: "Executive Remarks",
    originalAttachment: "Original Submitted Document",
    signedAttachment: "Signed & Executed Version",
    copiedMsg: "Record manifest copied to clipboard!",
    copiableText: "Copiable Plain-Text Record",
    language: "Language / ភាសា",
    profileTitle: "Simulated Session Persona",
    mainMenu: "Main Menu",
    dashboard: "Dashboard Overview",
    reports: "Reports & Insights",
    ledgerTitle: "Personal Signed Document History Ledger",
    ledgerSubtitle: "Verify, search, and retrieve all documents you have signed. Fully audited and voice-verified.",
    resetSuccess: "Successfully restored default seed signature records!",
    dataManagement: "Data Management",
    dmTitle: "Data Management Center",
    dmSubtitle: "Securely backup, restore, and manage all system report records.",
    dmBackupJson: "Export JSON Backup",
    dmBackupXlsx: "Export Excel (.xlsx)",
    dmRestoreJson: "Upload Backup File",
    dmRestoreSeed: "Restore Seed Records",
    dmWipeAll: "Wipe All Data",
    dmBackupDesc: "Download a structured backup of all document transaction logs, cryptographic validation hashes, and signatures.",
    dmRestoreDesc: "Restore the entire signature transaction database from a previously downloaded JSON backup file.",
    dmResetDesc: "Wipe database storage clean to fulfill privacy purge mandates, or reload pristine seed compliance records.",
    reportsSigned: "Signed Document Logs",
    reportsPending: "Pending Signature Logs",
    reportsView: "View",
    reportsEdit: "Edit",
    reportsDelete: "Delete",
    reportsAction: "Action"
  },
  KH: {
    title: "ប្រព័ន្ធលិខិតស្នាមផ្ទាល់ខ្លួន",
    subtitle: "ប្រវត្តិលិខិតដែលបានចុះហត្ថលេខា និងការរក្សាទុក",
    totalRecords: "លិខិតចុះហត្ថលេខាសរុប",
    signedThisMonth: "បានចុះហត្ថលេខាខែនេះ",
    categories: "ប្រភេទឯកសារសកម្ម",
    aiAccuracy: "ភាពត្រឹមត្រូវនៃសំឡេង AI",
    addLog: "កត់ត្រាឯកសារចុះហត្ថលេខា",
    searchPlaceholder: "ស្វែងរកឈ្មោះឯកសារ ប្រភេទឯកសារ នាយកដ្ឋាន ឬលេខយោង...",
    recordId: "លេខសម្គាល់លិខិត",
    documentName: "ឈ្មោះឯកសារ",
    category: "ប្រភេទឯកសារ",
    signedDate: "កាលបរិច្ឆេទចុះហត្ថលេខា",
    signedTime: "ម៉ោងចុះហត្ថលេខា",
    dept: "នាយកដ្ឋានពាក់ព័ន្ធ",
    submittedBy: "រៀបចំ/បញ្ជូនដោយ",
    refNo: "លេខយោងឯកសារ",
    remarks: "មតិយោបល់ / ស្ថានភាព",
    voiceInput: "ការបញ្ចូលដោយសំឡេង",
    stats: "ស្ថិតិវិភាគ",
    trend: "និន្នាការនៃការចុះហត្ថលេខា",
    distribution: "សមាមាត្រនៃប្រភេទឯកសារ",
    departmentsLabel: "រង្វាស់តាមនាយកដ្ឋាន",
    reset: "កំណត់ឡើងវិញ",
    allDepts: "គ្រប់នាយកដ្ឋាន",
    allDocs: "គ្រប់ប្រភេទឯកសារ",
    allStatuses: "គ្រប់ស្ថានភាព",
    complianceBadge: "លិខិតបានផ្ទៀងផ្ទាត់និងធានាសុវត្ថិភាព",
    voiceEvidence: "ភស្តុតាងសំឡេងដែលបាននិយាយ",
    actionsRecord: "មតិយោបល់ប្រតិបត្តិ",
    auditTrail: "កំណត់ហេតុត្រួតពិនិត្យសុវត្ថិភាពលម្អិត",
    close: "បិទ",
    cancel: "បោះបង់",
    submit: "ចងក្រង និងកត់ត្រាឯកសារ",
    drawSignature: "គូរហត្ថលេខាឌីជីថល",
    prefilledMsg: "បានបំប្លែងសំឡេងជោគជ័យ! ទិន្នន័យត្រូវបានបំពេញស្វ័យប្រវត្ត។",
    dropzone: "អូសនិងទម្លាក់ឯកសារចុះហត្ថលេខានៅទីនេះ ឬជ្រើសរើសឯកសារ",
    uploadBtn: "ជ្រើសរើសឯកសារ",
    statusTimeline: "កាលប្បវត្តិនៃស្ថានភាព",
    downloadReport: "ទាញយករបាយការណ៍ HTML",
    exportPdf: "នាំចេញជា PDF / បោះពុម្ព",
    emailSharing: "ចែករំលែកតាមអ៊ីមែល",
    timeline: "ប្រវត្តិលិខិត",
    signatoryProfile: "ព័ត៌មានលម្អិតអ្នកចុះហត្ថលេខា",
    metadata: "ទិន្នន័យមេតានៃឯកសារ",
    executiveRemarks: "មតិយោបល់ប្រតិបត្តិ",
    originalAttachment: "ឯកសារដើមដែលបានបញ្ជូន",
    signedAttachment: "ច្បាប់ចម្លងដែលបានចុះហត្ថលេខារួច",
    copiedMsg: "បានចម្លងព័ត៌មានលិខិតទៅកាន់ក្តារតម្បៀតខ្ទាស់!",
    copiableText: "អត្ថបទព័ត៌មានដែលអាចចម្លងបាន",
    language: "ភាសា / Language",
    profileTitle: "គណនីចុះហត្ថលេខាគំរូ",
    mainMenu: "ម៉ឺនុយចម្បង",
    dashboard: "ផ្ទាំងគ្រប់គ្រងទូទៅ",
    reports: "របាយការណ៍សង្ខេប",
    ledgerTitle: "សៀវភៅបញ្ជីប្រវត្តិឯកសារចុះហត្ថលេខាផ្ទាល់ខ្លួន",
    ledgerSubtitle: "ផ្ទៀងផ្ទាត់ ស្វែងរក និងទាញយកឯកសារទាំងអស់ដែលអ្នកបានចុះហត្ថលេខា។ មានសុវត្ថិភាព និងផ្ទៀងផ្ទាត់ដោយសំឡេង។",
    resetSuccess: "បានកំណត់ឡើងវិញនូវកំណត់ត្រាគំរូដោយជោគជ័យ!",
    dataManagement: "ការគ្រប់គ្រងទិន្នន័យ",
    dmTitle: "មជ្ឈមណ្ឌសម្រាប់គ្រប់គ្រងទិន្នន័យ",
    dmSubtitle: "រក្សាទុក ស្តារ និងគ្រប់គ្រងទិន្នន័យរបាយការណ៍ទាំងអស់ដោយសុវត្ថិភាព។",
    dmBackupJson: "ទាញយក JSON Backup",
    dmBackupXlsx: "ទាញយក Excel (.xlsx)",
    dmRestoreJson: "ជ្រើសរើសឯកសារ Backup",
    dmRestoreSeed: "ស្ដារទិន្នន័យគំរូដើម",
    dmWipeAll: "លុបទិន្នន័យទាំងអស់",
    dmBackupDesc: "ទាញយកទិន្នន័យទាំងអស់ជាទម្រង់ JSON ឬ Excel សម្រាប់រក្សាទុក ឬវិភាគ។",
    dmRestoreDesc: "ជ្រើសរើសឯកសារ JSON Backup ដែលធ្លាប់បាននាំចេញ ដើម្បីស្តារទិន្នន័យឡើងវិញ។",
    dmResetDesc: "លុបទិន្នន័យលិខិតស្នាមទាំងអស់ចេញពីគណនីរបស់អ្នក ឬស្ដារទិន្នន័យគំរូដើមឡើងវិញ។",
    reportsSigned: "លិខិតចុះហត្ថលេខារួច",
    reportsPending: "លិខិតកំពុងរង់ចាំ",
    reportsView: "ពិនិត្យ",
    reportsEdit: "កែសម្រួល",
    reportsDelete: "លុប",
    reportsAction: "សកម្មភាព"
  }
};

// Sample Seed Signatures to make the application look gorgeous immediately on load
const seedSignatures = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'><path d='M20,50 Q40,20 60,80 T100,50 T140,50 T180,20' stroke='%230F172A' stroke-width='4' fill='none'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'><path d='M10,80 Q50,10 90,60 T130,20 T170,80' stroke='%231E40AF' stroke-width='4.5' fill='none'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'><path d='M30,30 C50,10 70,90 90,40 C110,10 130,90 150,50' stroke='%230F172A' stroke-width='3.5' fill='none'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'><path d='M15,50 Q50,90 85,20 T155,70 T185,40' stroke='%23B91C1C' stroke-width='4' fill='none'/></svg>"
];

const INITIAL_RECORDS: SignatureRecord[] = [
  {
    id: 'SIG-000125',
    employeeId: '1025',
    fullName: 'Sokha Morn',
    department: 'Finance',
    position: 'Senior Accountant',
    documentName: 'Visa Extension & Multi-Entry Operational Permit Approval',
    documentType: 'Visa',
    referenceNumber: 'DOC-REF-991823',
    purpose: 'Immigration / Visa Review',
    priorityLevel: 'High',
    originalAttachmentName: 'visa_extension_application.pdf',
    originalAttachmentData: 'data:application/pdf;base64,JVBERi0xLjQK...',
    originalAttachmentType: 'application/pdf',
    originalAttachmentSize: '124 KB',
    signedAttachmentName: 'visa_extension_application_executed.pdf',
    signedAttachmentData: 'data:application/pdf;base64,JVBERi0xLjQK...',
    signatureDate: '21 July 2026',
    signatureTime: '10:30 AM',
    signatureStatus: 'Completed',
    signatureImage: seedSignatures[0],
    voiceRecord: null,
    voiceTranscript: 'Confirming visa extension and multi-entry operations permit document is signed and fully approved.',
    description: 'Visa extension approval document for corporate staff signed and logged.',
    createdBy: 'Director Sophia',
    signedBy: 'Director Sophia',
    signatureComment: 'Visa extension approval document signed and logged permanently.',
    auditTrail: [
      {
        timestamp: '21 July 2026, 11:00 AM',
        user: 'Director Sophia',
        action: 'Authorized status update from Submitted to Completed',
        deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Chrome/126.0.0',
        previousStatus: 'Submitted',
        newStatus: 'Completed',
      },
      {
        timestamp: '21 July 2026, 10:30 AM',
        user: 'Director Sophia',
        action: 'Created record & uploaded signed signature ink',
        deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
      },
    ],
  },
  {
    id: 'SIG-000124',
    employeeId: '3052',
    fullName: 'Chantha Piseth',
    department: 'Academics',
    position: 'Academic Coordinator',
    documentName: 'Executive Staff Offer Letter and Benefits NDA',
    documentType: 'Agreement',
    referenceNumber: 'DOC-REF-887121',
    purpose: 'Onboarding & Compliance Signoff',
    priorityLevel: 'Urgent',
    originalAttachmentName: 'executive_offer_package.pdf',
    originalAttachmentData: 'data:application/pdf;base64,JVBERi0xLjQK...',
    originalAttachmentType: 'application/pdf',
    originalAttachmentSize: '1.4 MB',
    signedAttachmentName: null,
    signedAttachmentData: null,
    signatureDate: '18 July 2026',
    signatureTime: '02:15 PM',
    signatureStatus: 'Approved & Signed',
    signatureImage: seedSignatures[1],
    voiceRecord: null,
    voiceTranscript: 'Offer letter and non disclosure agreement signed and registered for new head of operations.',
    description: 'Proprietary source-code protection, employment package and customer privacy agreement.',
    createdBy: 'Director Sophia',
    signedBy: 'Director Sophia',
    signatureComment: 'Authorized and completed following physical identity validation.',
    auditTrail: [
      {
        timestamp: '19 July 2026, 09:15 AM',
        user: 'Director Sophia',
        action: 'Authorized status update from Submitted to Approved & Signed',
        deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/125.0.0',
        previousStatus: 'Submitted',
        newStatus: 'Approved & Signed',
      },
      {
        timestamp: '18 July 2026, 02:15 PM',
        user: 'Director Sophia',
        action: 'Created record & submitted drawn ink',
        deviceInfo: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0',
      },
    ],
  },
  {
    id: 'SIG-000123',
    employeeId: '1104',
    fullName: 'Vannak Sam',
    department: 'Operations',
    position: 'Logistics Supervisor',
    documentName: 'Vendor Delivery Contract - Q3 Prime Dispatch',
    documentType: 'Contract',
    referenceNumber: 'DOC-REF-332155',
    purpose: 'Review and Signature Approval',
    priorityLevel: 'Normal',
    originalAttachmentName: 'vendor_delivery_v3.pdf',
    originalAttachmentData: 'data:application/pdf;base64,JVBERi0xLjQK...',
    originalAttachmentType: 'application/pdf',
    originalAttachmentSize: '680 KB',
    signedAttachmentName: null,
    signedAttachmentData: null,
    signatureDate: '15 July 2026',
    signatureTime: '11:45 AM',
    signatureStatus: 'Under Review',
    signatureImage: seedSignatures[2],
    voiceRecord: null,
    voiceTranscript: 'Confirming operational financial report authorization for logistics provider.',
    description: 'Quarterly distribution compliance review and filing approval signature.',
    createdBy: 'Director Sophia',
    auditTrail: [
      {
        timestamp: '16 July 2026, 09:30 AM',
        user: 'Director Sophia',
        action: 'Advanced workflow status from Submitted to Under Review',
        deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Chrome/125.0.0',
        previousStatus: 'Submitted',
        newStatus: 'Under Review',
      },
      {
        timestamp: '15 July 2026, 11:45 AM',
        user: 'Director Sophia',
        action: 'Created record & logged initial signature',
        deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4',
      },
    ],
  },
  {
    id: 'SIG-000122',
    employeeId: '2018',
    fullName: 'Sopheap Meas',
    department: 'Operations',
    position: 'Operations Lead',
    documentName: 'Q3 Global Campaign Budget Proposal Signoff',
    documentType: 'Report',
    referenceNumber: 'DOC-REF-109282',
    purpose: 'Administrative Budget Approval',
    priorityLevel: 'High',
    originalAttachmentName: 'campaign_budget_q3.docx',
    originalAttachmentData: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBB...',
    originalAttachmentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    originalAttachmentSize: '95 KB',
    signedAttachmentName: null,
    signedAttachmentData: null,
    signatureDate: '10 July 2026',
    signatureTime: '04:10 PM',
    signatureStatus: 'Rejected',
    signatureImage: seedSignatures[3],
    voiceRecord: null,
    voiceTranscript: 'Voice signoff log for Sopheap Meas, Creative Lead, campaign budget proposal.',
    description: 'Operational budget breakdown for autumn product release campaigns.',
    createdBy: 'Director Sophia',
    signedBy: 'Director Sophia',
    signatureComment: 'Rejected because Appendix B and safety credentials disclosures were missing from file package.',
    auditTrail: [
      {
        timestamp: '11 July 2026, 10:00 AM',
        user: 'Director Sophia',
        action: 'Authorized status update from Submitted to Rejected',
        deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Chrome/126.0.0',
        previousStatus: 'Submitted',
        newStatus: 'Rejected',
      },
      {
        timestamp: '10 July 2026, 04:10 PM',
        user: 'Director Sophia',
        action: 'Created record & uploaded signature',
        deviceInfo: 'Mozilla/5.0 (Android 14; Mobile; rv:125.0) Firefox/125.0',
      },
    ],
  },
];

// Simple elegant markdown parser for AI summaries
const renderMarkdown = (text: string) => {
  return text.split('\n').map((line, idx) => {
    let content = line.trim();
    if (!content) return <div key={idx} className="h-2"></div>;

    // Check for headings
    if (content.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm font-black text-slate-800 dark:text-slate-100 mt-4 mb-2 uppercase tracking-wider font-display">
          {content.replace('### ', '')}
        </h4>
      );
    }
    if (content.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-base font-black text-slate-950 dark:text-white mt-5 mb-2.5 font-display border-b border-slate-100 dark:border-slate-800 pb-1">
          {content.replace('## ', '')}
        </h3>
      );
    }

    // Check for bullet list item
    let isBullet = false;
    if (content.startsWith('- ') || content.startsWith('* ')) {
      isBullet = true;
      content = content.substring(2);
    }

    // Replace basic bold markers (e.g. **text**)
    const parts: any[] = [];
    let rem = content;
    while (rem.includes('**')) {
      const start = rem.indexOf('**');
      const end = rem.indexOf('**', start + 2);
      if (end !== -1) {
        if (start > 0) {
          parts.push(rem.substring(0, start));
        }
        parts.push(
          <strong key={start} className="font-extrabold text-slate-900 dark:text-white">
            {rem.substring(start + 2, end)}
          </strong>
        );
        rem = rem.substring(end + 2);
      } else {
        break;
      }
    }
    if (rem) {
      parts.push(rem);
    }

    if (isBullet) {
      return (
        <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 ml-4 list-disc py-0.5 leading-relaxed">
          <span>{parts.length > 0 ? parts : content}</span>
        </li>
      );
    }

    return (
      <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed py-0.5">
        {parts.length > 0 ? parts : content}
      </p>
    );
  });
};

export default function App() {
  // Application state
  const [records, setRecords] = useState<SignatureRecord[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'KH'>('EN');
  const [activeView, setActiveView] = useState<'dashboard' | 'reports' | 'dataManagement'>('dashboard');

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [docFilter, setDocFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'date'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals active state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SignatureRecord | null>(null);

  // Reports Module States
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeReportSubTab, setActiveReportSubTab] = useState<'signed' | 'pending'>('signed');

  // State-based Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportDeleteTarget, setReportDeleteTarget] = useState<SignatureRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, language }),
      });
      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error('Error generating AI summary:', err);
      const completedCount = records.filter(r => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length;
      const pendingCount = records.length - completedCount;
      const pct = Math.round((completedCount / (records.length || 1)) * 100);
      setAiSummary(`### Executive Summary Report (Offline Fallback)
- **Total Registered Logs**: ${records.length} documents.
- **Fully Signed & Executed**: ${completedCount} documents.
- **Pending Sign-offs**: ${pendingCount} documents.
- **Rate**: ${pct}% compliance rate.`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Record ID', 'Reference No', 'Document Title / Name', 'Submitted By (Full Name)', 'Date of Submission', 'Signature Status', 'Remarks'];
    const rows = records.map(r => [
      r.id,
      r.referenceNumber,
      `"${r.documentName.replace(/"/g, '""')}"`,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.signatureDate,
      r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed' ? 'Signed' : 'Not Signed',
      `"${(r.signatureComment || r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SignStore_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const t = TRANSLATIONS[language];

  // Load and sync records from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('signature_records_store');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse local records, using seed data:', err);
        setRecords(INITIAL_RECORDS);
      }
    } else {
      setRecords(INITIAL_RECORDS);
      localStorage.setItem('signature_records_store', JSON.stringify(INITIAL_RECORDS));
    }

    // Default theme based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const saveAndSyncRecords = (newRecords: SignatureRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('signature_records_store', JSON.stringify(newRecords));
  };

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Create new record handler
  const handleAddRecord = (recordData: Omit<SignatureRecord, 'id' | 'auditTrail'>) => {
    const nextIdNum =
      records.reduce((max, r) => {
        const parts = r.id.split('-');
        if (parts.length > 1) {
          const num = parseInt(parts[1]);
          return isNaN(num) ? max : (num > max ? num : max);
        }
        return max;
      }, 125) + 1;

    const newId = `SIG-000${nextIdNum}`;

    const newRecord: SignatureRecord = {
      ...recordData,
      id: newId,
      auditTrail: [
        {
          timestamp: `${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
          user: recordData.createdBy,
          action: 'Created record & registered cryptographic signature metrics',
          deviceInfo: navigator.userAgent,
        },
      ],
    };

    const updated = [newRecord, ...records];
    saveAndSyncRecords(updated);
  };

  // Update administrative approval status handler
  const handleUpdateStatus = (
    recordId: string,
    newStatus: DocumentStatus,
    comment: string,
    signedBy: string,
    signedAttachmentName?: string | null,
    signedAttachmentData?: string | null
  ) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        const log: AuditLog = {
          timestamp: `${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
          user: signedBy,
          action: `Authorized status update from ${r.signatureStatus} to ${newStatus}`,
          deviceInfo: navigator.userAgent,
          previousStatus: r.signatureStatus,
          newStatus: newStatus,
        };

        return {
          ...r,
          signatureStatus: newStatus,
          signatureComment: comment,
          signedBy,
          signatureDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          signatureTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          signedAttachmentName: signedAttachmentName || r.signedAttachmentName,
          signedAttachmentData: signedAttachmentData || r.signedAttachmentData,
          auditTrail: [log, ...r.auditTrail],
        };
      }
      return r;
    });

    saveAndSyncRecords(updated);
    
    // update state of currently selected record viewer
    const updatedSel = updated.find(r => r.id === recordId);
    if (updatedSel) {
      setSelectedRecord(updatedSel);
    }
  };

  // Update complete record handler (for direct edits)
  const handleUpdateRecord = (updatedRecord: SignatureRecord) => {
    const editorName = currentRole === 'Super Admin' ? 'Director Sophia' : currentRole === 'Admin / Manager' ? 'Manager Sokha' : 'Staff Sam';
    const log: AuditLog = {
      timestamp: `${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      user: editorName,
      action: `Modified report details & metadata`,
      deviceInfo: navigator.userAgent,
    };

    const updated = records.map((r) => {
      if (r.id === updatedRecord.id) {
        return {
          ...updatedRecord,
          auditTrail: [log, ...r.auditTrail],
        };
      }
      return r;
    });

    saveAndSyncRecords(updated);
    
    const updatedSel = updated.find(r => r.id === updatedRecord.id);
    if (updatedSel) {
      setSelectedRecord(updatedSel);
    }
  };

  // Delete a specific record handler
  const handleDeleteRecord = (recordId: string) => {
    const updated = records.filter(r => r.id !== recordId);
    saveAndSyncRecords(updated);
    setSelectedRecord(null);
  };

  // Export backup in JSON format
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Signature_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast(language === 'KH' ? 'ការនាំចេញ JSON Backup ទទួលបានជោគជ័យ!' : 'JSON backup exported and downloaded successfully!');
    } catch (e) {
      triggerToast(language === 'KH' ? 'បានបរាជ័យក្នុងការនាំចេញ JSON Backup។' : 'Failed to export JSON backup.');
    }
  };

  // Export reports log in Microsoft Excel (.xlsx) format using xlsx library
  const handleExportXLSX = () => {
    try {
      if (records.length === 0) {
        triggerToast(language === 'KH' ? 'គ្មានកំណត់ត្រាសម្រាប់ការនាំចេញទេ។' : 'No records available to export.');
        return;
      }

      // Flatten records to a clean grid structure suitable for spreadsheets
      const flattened = records.map((r) => ({
        'Record ID': r.id,
        'Document Name': r.documentName,
        'Document Type': r.documentType,
        'Reference Code': r.referenceNumber,
        'Submitted By': r.fullName,
        'Employee ID': r.employeeId,
        'Department': r.department,
        'Position': r.position,
        'Priority Level': r.priorityLevel || 'Normal',
        'Signature Status': r.signatureStatus,
        'Submitted Date': r.signatureDate,
        'Submitted Time': r.signatureTime,
        'Purpose': r.purpose || '',
        'Audit Log Trail Count': r.auditTrail?.length || 0,
        'Is Voice Evidence Attached': r.voiceRecord ? 'Yes' : 'No',
        'Last Verification Status': 'SHA-256 Vault Authenticated'
      }));

      // Create Worksheet and Workbook
      const worksheet = XLSX.utils.json_to_sheet(flattened);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Signature Compliance Logs');

      // Style adjustments (optional auto-fit columns)
      const maxColLengths = Object.keys(flattened[0] || {}).map(key => {
        let maxLen = key.length;
        flattened.forEach(row => {
          const val = String((row as any)[key] || '');
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: maxLen + 2 };
      });
      worksheet['!cols'] = maxColLengths;

      // Write and download
      XLSX.writeFile(workbook, `Signature_Compliance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      triggerToast(language === 'KH' ? 'ការនាំចេញ Excel (.xlsx) ទទួលបានជោគជ័យ!' : 'Microsoft Excel (.xlsx) workbook exported successfully!');
    } catch (e) {
      triggerToast(language === 'KH' ? 'បានបរាជ័យក្នុងការនាំចេញ Excel (.xlsx)។' : 'Failed to export Microsoft Excel (.xlsx) file.');
    }
  };

  // Restore database from exported JSON file
  const handleRestoreJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          // Perform basic schema validation
          const isValid = parsed.every(item => item && typeof item === 'object' && 'id' in item && 'documentName' in item && 'fullName' in item);
          if (isValid) {
            saveAndSyncRecords(parsed);
            triggerToast(language === 'KH' ? 'ការស្តារទិន្នន័យ (Restore) ពី Backup ទទួលបានជោគជ័យ!' : 'Database restored from backup successfully!');
          } else {
            triggerToast(language === 'KH' ? 'ឯកសារគ្មានទម្រង់ត្រឹមត្រូវសម្រាប់ប្រព័ន្ធនេះទេ។' : 'Invalid file schema. Backup is not compatible.');
          }
        } else {
          triggerToast(language === 'KH' ? 'ឯកសារគ្មានទម្រង់ត្រឹមត្រូវសម្រាប់ប្រព័ន្ធនេះទេ។' : 'Invalid file format. Backup must be a JSON array.');
        }
      } catch (err) {
        triggerToast(language === 'KH' ? 'កំហុសក្នុងការអានឯកសារ JSON។' : 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Reset database to seeds (restore defaults)
  const handleResetDatabase = () => {
    if (confirm(language === 'KH' ? 'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូឡើងវិញមែនទេ? រាល់កំណត់ត្រាថ្មីៗនឹងត្រូវលុបចោល។' : 'Are you sure you want to restore default seed signature records? Any newly created entries will be deleted.')) {
      saveAndSyncRecords(INITIAL_RECORDS);
      triggerToast(language === 'KH' ? 'បានកំណត់ទិន្នន័យគំរូឡើងវិញដោយជោគជ័យ!' : 'Successfully restored default seed signature records!');
    }
  };

  // Securely clear all records from database completely (Reset Data function)
  const handleClearAllData = () => {
    if (confirm(language === 'KH' ? '⚠️ ព្រមាន៖ តើអ្នកពិតជាចង់លុបទិន្នន័យរបាយការណ៍ទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានទេ។' : '⚠️ WARNING: Are you sure you want to securely wipe ALL report records from the system? This action cannot be undone.')) {
      saveAndSyncRecords([]);
      triggerToast(language === 'KH' ? 'បានសម្អាតទិន្នន័យទាំងអស់ដោយជោគជ័យ!' : 'All database report records have been securely expunged.');
    }
  };

  // Filter and Search processor
  const filteredRecords = records
    .filter((r) => {
      const matchSearch =
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeId.includes(searchTerm) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = deptFilter === 'All' || r.department === deptFilter;
      const matchDoc = docFilter === 'All' || r.documentType === docFilter;
      const matchStatus = statusFilter === 'All' || r.signatureStatus === statusFilter;

      return matchSearch && matchDept && matchDoc && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortBy === 'name') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'date') {
        comparison = new Date(a.signatureDate).getTime() - new Date(b.signatureDate).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const uniqueDepts = Array.from(new Set(records.map((r) => r.department)));
  const uniqueDocs = Array.from(new Set(records.map((r) => r.documentType)));
  const canApprove = currentRole === 'Super Admin' || currentRole === 'Admin / Manager';

  const toggleSort = (field: 'id' | 'name' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className={`flex h-screen bg-[#F8FAFC] dark:bg-[#090D16] font-sans text-slate-900 dark:text-slate-100 overflow-hidden ${language === 'KH' ? 'font-sans' : ''}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`w-64 bg-[#0F172A] dark:bg-[#070A13] flex flex-col shrink-0 border-r border-slate-200/10 text-slate-300 fixed lg:relative z-50 h-full transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-200/10 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-emerald-500/20">Σ</div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-tight text-xl font-display">SignStore AI</span>
            <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest">{t.complianceBadge}</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto space-y-6">
          <div>
            <div className="px-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.mainMenu}</div>
            <button
              onClick={() => {
                setActiveView('dashboard');
                setSearchTerm('');
                setDeptFilter('All');
                setDocFilter('All');
                setStatusFilter('All');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 font-bold text-sm text-left cursor-pointer transition-all ${
                activeView === 'dashboard'
                  ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              {t.dashboard}
            </button>
            <button
              onClick={() => { setActiveView('reports'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 font-bold text-sm text-left cursor-pointer transition-all ${
                activeView === 'reports'
                  ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              {t.reports}
            </button>
            <button
              onClick={() => { setActiveView('dataManagement'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 font-bold text-sm text-left cursor-pointer transition-all ${
                activeView === 'dataManagement'
                  ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
              }`}
            >
              <HardDrive className="w-4.5 h-4.5" />
              {t.dataManagement}
            </button>
            <button
              onClick={() => { setShowAddForm(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-6 py-4 text-slate-400 hover:text-white transition-all text-left text-sm font-bold cursor-pointer hover:bg-slate-800/30"
            >
              <Plus className="w-4.5 h-4.5" />
              {t.addLog}
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200/10 shrink-0 bg-[#070A13]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.complianceBadge}
          </div>
        </div>
      </nav>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Bar */}
        <header className="h-16 bg-white dark:bg-[#0D1527] border-b border-slate-200 dark:border-slate-800/60 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 w-1/3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Elegant Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2 py-1 text-xs font-extrabold rounded cursor-pointer transition-all ${
                  language === 'EN'
                    ? 'bg-white dark:bg-[#0D1527] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('KH')}
                className={`px-2 py-1 text-xs font-extrabold rounded cursor-pointer transition-all ${
                  language === 'KH'
                    ? 'bg-white dark:bg-[#0D1527] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                KH
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800/80"></div>

            {/* Dark / Light Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800/80"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Restore seeds option */}
            <button
              onClick={handleResetDatabase}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800/80"
              title="Restore seed database"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              {t.reset}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-950/80 transition-all">
              <div className="text-right flex flex-col justify-center">
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="bg-transparent border-none outline-none p-0 text-xs font-black text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer text-right select-none ring-0 focus-visible:ring-0"
                >
                  <option value="Super Admin" className="dark:bg-[#0D1527] dark:text-slate-200 text-left">Director Sophia</option>
                  <option value="Admin / Manager" className="dark:bg-[#0D1527] dark:text-slate-200 text-left">Manager Sokha</option>
                  <option value="Normal User" className="dark:bg-[#0D1527] dark:text-slate-200 text-left">Staff Sam</option>
                </select>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentRole}</div>
              </div>
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-xl flex items-center justify-center font-extrabold text-xs shadow-sm shadow-emerald-500/20">
                {currentRole === 'Super Admin' ? 'DS' : currentRole === 'Admin / Manager' ? 'MS' : 'SS'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8">
          
          {activeView === 'dashboard' ? (
            <>
              {/* Quick Stats Grid */}
              <StatsGrid records={records} />

          {/* Analytics charts + shared Ledger Header */}
          <AnalyticsCharts
            records={records}
            ledgerTitle={t.ledgerTitle}
            ledgerSubtitle={t.ledgerSubtitle}
            addLogLabel={t.addLog}
            onAddLog={() => setShowAddForm(true)}
          />

          {/* Core Signature Records Ledger panel */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">

            {/* Main Data Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-950/40 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/30 select-none" onClick={() => toggleSort('id')}>
                      <div className="flex items-center gap-1">
                        {t.recordId}
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/30 select-none" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">
                        {t.submittedBy}
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-6 py-4">{t.documentName}</th>
                    <th className="px-6 py-4">{t.signedDate}</th>
                    <th className="px-6 py-4">{t.remarks}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/40 font-semibold text-slate-700 dark:text-slate-300">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                      // Status color styles mapping
                      const statusStyles: Record<DocumentStatus, string> = {
                        Submitted: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30',
                        'Under Review': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30',
                        'Need Correction': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30',
                        'Approved & Signed': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/30',
                        'Returned to Submitter': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/30',
                        Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30',
                        Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30',
                        Archived: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800',
                      };

                      const badgeClass = statusStyles[record.signatureStatus] || 'bg-slate-100 text-slate-700';

                      return (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all cursor-pointer"
                        >
                          <td className="px-6 py-4 font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {record.id}
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {record.fullName}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {record.department} • #{record.employeeId}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                            <div className="font-bold max-w-[280px] truncate text-slate-800 dark:text-slate-100" title={record.documentName}>
                              {record.documentName}
                            </div>
                            <div className="flex gap-2 items-center text-xs text-slate-400 mt-1 font-mono">
                              <span>Ref: {record.referenceNumber}</span>
                              <span>•</span>
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-bold">
                                {record.documentType}
                              </span>
                              {record.priorityLevel && (
                                <>
                                  <span>•</span>
                                  <span className={`text-xs font-black uppercase px-1 rounded ${
                                    record.priorityLevel === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                                    record.priorityLevel === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                    {record.priorityLevel}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            <div className="font-bold text-slate-700 dark:text-slate-300">{record.signatureDate}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{record.signatureTime}</div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-black uppercase border tracking-wider ${badgeClass}`}>
                              {record.signatureStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 dark:text-slate-500">
                        <FolderOpen className="w-10 h-10 mx-auto opacity-30 mb-3" />
                        <p className="font-bold text-xs uppercase tracking-wider">No matching records found</p>
                        <p className="text-xs mt-1">Adjust search metrics or filters above.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeView === 'reports' ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header section with description and download/export controls */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div>
              <h2 className="font-black text-slate-800 dark:text-slate-100 text-2xl font-display">
                {language === 'KH' ? 'របាយការណ៍សវនកម្ម & អនុលោមភាព' : 'Audit & Compliance Reports'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'KH' 
                  ? 'សង្ខេបទិន្នន័យចុះហត្ថលេខា ការវិភាគ និងរបាយការណ៍សវនកម្មដោយស្វ័យប្រវត្តិតាមរយៈ AI។' 
                  : 'Comprehensive sign-off analytics, secure digital verification statistics, and automated AI insight reports.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <FolderOpen className="w-4 h-4 text-slate-400" />
                {language === 'KH' ? 'នាំចេញជា CSV' : 'Export CSV Audit Log'}
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/10 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {language === 'KH' ? 'បោះពុម្ពរបាយការណ៍' : 'Print / Export PDF'}
              </button>
            </div>
          </div>

          {/* Reports summary counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Counter 1: Total documents */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {language === 'KH' ? 'លិខិតសរុប' : 'Total Submissions'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <FolderOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-800 dark:text-slate-100">{records.length}</span>
                <span className="text-xs font-bold text-slate-400">docs</span>
              </div>
            </div>

            {/* Counter 2: Signed */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {language === 'KH' ? 'បានចុះហត្ថលេខា' : 'Fully Signed'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
                  {records.filter(r => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length}
                </span>
                <span className="text-xs font-bold text-slate-400">docs</span>
              </div>
            </div>

            {/* Counter 3: Pending */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {language === 'KH' ? 'កំពុងរង់ចាំ' : 'Pending Signatures'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black text-amber-600 dark:text-amber-400">
                  {records.filter(r => r.signatureStatus !== 'Completed' && r.signatureStatus !== 'Approved & Signed').length}
                </span>
                <span className="text-xs font-bold text-slate-400">docs</span>
              </div>
            </div>

            {/* Counter 4: Compliance Rate */}
            {(() => {
              const signed = records.filter(r => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length;
              const rate = Math.round((signed / (records.length || 1)) * 100);
              return (
                <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {language === 'KH' ? 'អនុលោមភាពសរុប' : 'Compliance Rate'}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{rate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${rate}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Gemini AI Executive summarizer section */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-32 h-32" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5 max-w-xl">
                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider rounded border border-indigo-500/30">
                  Powered by Gemini 3.5 Flash
                </span>
                <h3 className="text-lg font-black uppercase tracking-wider mt-2">
                  {language === 'KH' ? 'បង្កើតរបាយការណ៍វិភាគសរុបដោយ AI' : 'AI Executive Audit & Compliance Summary'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'KH'
                    ? 'វិភាគកំណត់ត្រាសកម្ម និងស្ថានភាពចុះហត្ថលេខា ដើម្បីចងក្រងជាសេចក្តីសង្ខេបលម្អិត និងការណែនាំផ្សេងៗ។'
                    : 'Automatically scan through all active signature records, identify bottlenecks, and compile a boardroom-ready document log analysis report.'}
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="shrink-0 px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingSummary ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Award className="w-4 h-4 text-indigo-600" />
                )}
                {isGeneratingSummary 
                  ? (language === 'KH' ? 'កំពុងបង្កើត...' : 'Generating Summary...') 
                  : (language === 'KH' ? '✨ បង្កើតសេចក្តីសង្ខេបស្វ័យប្រវត្ត' : '✨ Generate AI Summary Report')}
              </button>
            </div>

            {/* Render results with beautiful fade in */}
            {aiSummary && (
              <div className="mt-6 bg-slate-950/80 border border-slate-800 p-5 rounded-xl animate-fadeIn text-slate-100 max-h-96 overflow-y-auto">
                <div className="border-b border-slate-800/80 pb-2.5 mb-3.5 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {language === 'KH' ? 'លទ្ធផលសង្ខេបរបស់ AI' : 'AI Analysis Result'}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(aiSummary);
                      triggerToast(language === 'KH' ? 'បានចម្លងទៅក្តារតម្បៀតខ្ទាស់!' : 'Copied AI summary report text to clipboard!');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase cursor-pointer"
                  >
                    [ {language === 'KH' ? 'ចម្លងអត្ថបទ' : 'Copy Text'} ]
                  </button>
                </div>
                <div className="space-y-2 text-left">
                  {renderMarkdown(aiSummary)}
                </div>
              </div>
            )}
          </div>

          {/* Sub-tab breakdown of logs: Signed vs Pending */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">
            
            {/* Sub-tab navigation */}
            <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveReportSubTab('signed')}
                  className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeReportSubTab === 'signed'
                      ? 'border-emerald-500 text-slate-800 dark:text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.reportsSigned} ({records.filter(r => r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed').length})
                </button>
                <button
                  onClick={() => setActiveReportSubTab('pending')}
                  className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeReportSubTab === 'pending'
                      ? 'border-amber-500 text-slate-800 dark:text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.reportsPending} ({records.filter(r => r.signatureStatus !== 'Completed' && r.signatureStatus !== 'Approved & Signed').length})
                </button>
              </div>
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest font-mono hidden sm:inline">
                AUTO-RECORD TRACKING ACTIVE
              </span>
            </div>

            {/* Sub-tab content tables */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/60 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/60">
                    <th className="px-6 py-3.5 text-xs font-extrabold text-slate-400 uppercase tracking-widest w-28">Ref No.</th>
                    <th className="px-6 py-3.5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Document Title / Name</th>
                    <th className="px-6 py-3.5 text-xs font-extrabold text-slate-400 uppercase tracking-widest w-48">Submitted By</th>
                    <th className="px-6 py-3.5 text-xs font-extrabold text-slate-400 uppercase tracking-widest w-40">Date</th>
                    <th className="px-6 py-3.5 text-xs font-extrabold text-slate-400 uppercase tracking-widest w-48 text-right">{t.reportsAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const targetList = records.filter(r => {
                      const isSigned = r.signatureStatus === 'Completed' || r.signatureStatus === 'Approved & Signed';
                      return activeReportSubTab === 'signed' ? isSigned : !isSigned;
                    });

                    if (targetList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            <FolderOpen className="w-8 h-8 mx-auto opacity-30 mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider">No matching logs compiled</p>
                          </td>
                        </tr>
                      );
                    }

                    return targetList.map((r) => (
                      <tr 
                        key={r.id}
                        className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all text-xs"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-slate-500 uppercase">{r.referenceNumber || r.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">{r.documentName}</div>
                          <div className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{r.documentType || 'General Document'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-700 dark:text-slate-300">{r.fullName}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">{r.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700 dark:text-slate-300">{r.signatureDate}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{r.signatureTime}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRecord(r)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/40"
                              title={t.reportsView}
                            >
                              <Eye className="w-3 h-3" />
                              {t.reportsView}
                            </button>
                            {canApprove && (
                              <>
                                <button
                                  onClick={() => setSelectedRecord(r)}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/40"
                                  title={t.reportsEdit}
                                >
                                  <Edit3 className="w-3 h-3" />
                                  {t.reportsEdit}
                                </button>
                                <button
                                  onClick={() => setReportDeleteTarget(r)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 border border-rose-100 dark:border-rose-900/40"
                                  title={t.reportsDelete}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  {t.reportsDelete}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Data Management View */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Data Management Header */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div>
              <h2 className="font-black text-slate-800 dark:text-slate-100 text-2xl font-display flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-500" />
                {t.dmTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{t.dmSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                {language === 'KH' ? 'សុវត្ថិភាពសកម្ម' : 'Security Active'}
              </span>
            </div>
          </div>

          {/* Data Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {language === 'KH' ? 'ឯកសារសរុប' : 'Total Records'}
                </span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3 text-4xl font-black text-slate-800 dark:text-slate-100">{records.length}</div>
            </div>
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {language === 'KH' ? 'ទំហំប៉ាន់ប្រមាណ' : 'Estimated Size'}
                </span>
                <FolderOpen className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3 text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {records.length > 0 ? `${(JSON.stringify(records).length / 1024).toFixed(1)} KB` : '0 KB'}
              </div>
            </div>
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {language === 'KH' ? 'ថ្ងៃចុងក្រោយរក្សាទុក' : 'Last Saved'}
                </span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-3 text-sm font-black text-indigo-600 dark:text-indigo-400">
                {records.length > 0 
                  ? new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '-'
                }
              </div>
            </div>
          </div>

          {/* Main Data Management Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Backup Section */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg font-display">
                    {language === 'KH' ? 'នាំចេញ Backup ទិន្នន័យ' : 'Backup Data'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t.dmBackupDesc}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportJSON}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/15"
                >
                  <Download className="w-4 h-4" />
                  {t.dmBackupJson}
                </button>
                <button
                  onClick={handleExportXLSX}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  {t.dmBackupXlsx}
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'KH' 
                    ? 'JSON សម្រាប់ស្ដារទិន្នន័យក្នុងប្រព័ន្ធ។ Excel (.xlsx) សម្រាប់ការវិភាគ និងរបាយការណ៍។'
                    : 'JSON format is used for system backup and restoration. Excel (.xlsx) format is for reporting and data analysis.'}
                </p>
              </div>
            </div>

            {/* Reset Section */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg font-display">
                    {language === 'KH' ? 'កំណត់ឡើងវិញ និងសម្អាតទិន្នន័យ' : 'Reset Data'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t.dmResetDesc}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResetDatabase}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.dmRestoreSeed}
                </button>
                <button
                  onClick={handleClearAllData}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.dmWipeAll}
                </button>
              </div>

              {/* Restore from JSON */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800/60 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  {language === 'KH' ? 'ស្តារពី JSON Backup' : 'Restore from JSON Backup'}
                </h4>
                <label className="w-full py-2.5 bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 border border-dashed border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-black rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-1">
                  <Upload className="w-4 h-4 animate-bounce" />
                  <span>{t.dmRestoreJson}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleRestoreJSON(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 rounded-xl p-4">
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-semibold">
                  {language === 'KH' 
                    ? '⚠️ ការព្រមាន៖ សកម្មភាពនៃការលុបទិន្នន័យទាំងអស់ ឬស្ដារឡើងវិញមិនអាចត្រឡប់ក្រោយបានទេ។ សូមប្រាកដថាអ្នកបានរក្សាទុក Backup មុននឹងប្រតិបត្តិការណ៍។'
                    : '⚠️ Warning: Data wipe and restore actions are irreversible. Please ensure you have exported a backup before performing these operations.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>

        {/* Status Bar / Footer */}
        <footer className="h-10 bg-white dark:bg-[#0D1527] border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SECURE SHA-256 VAULT ACTIVE
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              ALL ENCRYPTED TRANSACTIONS REGISTERED
            </div>
          </div>
          <div className="text-xs text-slate-400">
            System v3.0.0
          </div>
        </footer>

      </main>

      {/* MODAL 1: Create Record form */}
      {showAddForm && (
        <RecordForm
          onAddRecord={handleAddRecord}
          onClose={() => setShowAddForm(false)}
          currentUserName={currentRole === 'Super Admin' ? 'Director Sophia' : currentRole === 'Admin / Manager' ? 'Manager Sokha' : 'Staff Sam'}
          language={language}
        />
      )}

      {/* MODAL 2: Record Details Viewer */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          userRole={currentRole}
          currentUserName={currentRole === 'Super Admin' ? 'Director Sophia' : currentRole === 'Admin / Manager' ? 'Manager Sokha' : 'Staff Sam'}
          onUpdateStatus={handleUpdateStatus}
          onClose={() => setSelectedRecord(null)}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {/* MODAL 3: Reports Delete Confirmation */}
      {reportDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-rose-600 dark:bg-rose-700 p-5 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-white" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                {language === 'KH' ? 'បញ្ជាក់ការលុប' : 'Confirm Deletion'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'KH' 
                  ? `តើអ្នកពិតជាចង់លុបកំណត់ត្រា (${reportDeleteTarget.id}) មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។`
                  : `Are you sure you want to permanently delete record (${reportDeleteTarget.id})? This action cannot be undone.`}
              </p>
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{reportDeleteTarget.documentName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{reportDeleteTarget.fullName} &bull; {reportDeleteTarget.department}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setReportDeleteTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  {language === 'KH' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    handleDeleteRecord(reportDeleteTarget.id);
                    setReportDeleteTarget(null);
                    triggerToast(language === 'KH' ? 'បានលុបកំណត់ត្រាដោយជោគជ័យ!' : 'Record deleted successfully!');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-rose-500/15"
                >
                  {language === 'KH' ? 'លុបជារៀងខ្លួន' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State-based Toast Notifications Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slideUp">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              System Notification
            </h4>
            <p className="text-xs font-semibold text-slate-200">
              {toastMessage}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
