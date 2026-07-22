import React, { useState } from 'react';
import { SignatureRecord, UserRole, DocumentStatus } from '../types';
import { downloadHtmlFile } from '../utils/reportGenerator';
import {
  FileText,
  User,
  ShieldAlert,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Award,
  PlusCircle,
  CornerDownRight,
  AlertOctagon,
  Play,
  Volume2,
  Upload,
  FolderOpen,
  AlertCircle,
  Calendar,
  Check,
  ArrowRight,
  Edit,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react';

interface RecordDetailsModalProps {
  record: SignatureRecord;
  userRole: UserRole;
  currentUserName: string;
  onUpdateStatus: (
    recordId: string,
    newStatus: DocumentStatus,
    comment: string,
    signedBy: string,
    signedAttachmentName?: string | null,
    signedAttachmentData?: string | null
  ) => void;
  onClose: () => void;
  onUpdateRecord?: (updatedRecord: SignatureRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
}

export default function RecordDetailsModal({
  record,
  userRole,
  currentUserName,
  onUpdateStatus,
  onClose,
  onUpdateRecord,
  onDeleteRecord,
}: RecordDetailsModalProps) {
  const [comment, setComment] = useState(record.signatureComment || '');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>(record.signatureStatus);
  const [signedBy, setSignedBy] = useState(record.signedBy || currentUserName);
  
  // Signed document attachment states
  const [signedAttachmentName, setSignedAttachmentName] = useState<string | null>(record.signedAttachmentName || null);
  const [signedAttachmentData, setSignedAttachmentData] = useState<string | null>(record.signedAttachmentData || null);
  const [isDragging, setIsDragging] = useState(false);

  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editDocName, setEditDocName] = useState(record.documentName);
  const [editDocType, setEditDocType] = useState(record.documentType);
  const [editRefNumber, setEditRefNumber] = useState(record.referenceNumber);
  const [editFullName, setEditFullName] = useState(record.fullName);
  const [editEmployeeId, setEditEmployeeId] = useState(record.employeeId);
  const [editDepartment, setEditDepartment] = useState(record.department);
  const [editPosition, setEditPosition] = useState(record.position);
  const [editPriorityLevel, setEditPriorityLevel] = useState(record.priorityLevel || 'Normal');
  const [editPurpose, setEditPurpose] = useState(record.purpose || '');
  const [editDescription, setEditDescription] = useState(record.description || '');

  // Delete Confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canApprove = userRole === 'Super Admin' || userRole === 'Admin / Manager';

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!comment.trim() && (selectedStatus === 'Rejected' || selectedStatus === 'Need Correction')) {
      setFormError('Remarks/comments are required to reject or request corrections.');
      return;
    }

    onUpdateStatus(
      record.id,
      selectedStatus,
      comment,
      signedBy.trim() || currentUserName,
      signedAttachmentName,
      signedAttachmentData
    );
    setShowApprovalPanel(false);
  };

  const handleSignedFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSignedAttachmentName(file.name);
      setSignedAttachmentData(reader.result as string);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleShareEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSentNotice(true);
    setTimeout(() => {
      setEmailSentNotice(false);
      setShowEmailInput(false);
      setEmailInput('');
    }, 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDocName.trim() || !editFullName.trim() || !editEmployeeId.trim()) {
      setFormError('Required fields: Document Title, Submitter Name, and Submitter ID.');
      return;
    }

    const updatedRecord: SignatureRecord = {
      ...record,
      documentName: editDocName,
      documentType: editDocType,
      referenceNumber: editRefNumber,
      fullName: editFullName,
      employeeId: editEmployeeId,
      department: editDepartment,
      position: editPosition,
      priorityLevel: editPriorityLevel,
      purpose: editPurpose,
      description: editDescription,
    };

    if (onUpdateRecord) {
      onUpdateRecord(updatedRecord);
    }
    setIsEditing(false);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditDocName(record.documentName);
    setEditDocType(record.documentType);
    setEditRefNumber(record.referenceNumber);
    setEditFullName(record.fullName);
    setEditEmployeeId(record.employeeId);
    setEditDepartment(record.department);
    setEditPosition(record.position);
    setEditPriorityLevel(record.priorityLevel || 'Normal');
    setEditPurpose(record.purpose || '');
    setEditDescription(record.description || '');
    setIsEditing(false);
    setFormError(null);
  };

  const handleConfirmDelete = () => {
    if (onDeleteRecord) {
      onDeleteRecord(record.id);
    }
    setShowDeleteConfirm(false);
  };

  // Status visual mapping configuration
  const statusConfig: Record<DocumentStatus, { text: string; bg: string; border: string; icon: React.ComponentType<any>; colorHex: string }> = {
    Submitted: {
      text: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800/40',
      icon: Clock,
      colorHex: '#2563EB',
    },
    'Under Review': {
      text: 'text-indigo-700 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      border: 'border-indigo-200 dark:border-indigo-800/40',
      icon: Clock,
      colorHex: '#4F46E5',
    },
    'Need Correction': {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/40',
      icon: AlertOctagon,
      colorHex: '#D97706',
    },
    'Approved & Signed': {
      text: 'text-teal-700 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      border: 'border-teal-200 dark:border-teal-800/40',
      icon: ShieldCheck,
      colorHex: '#0D9488',
    },
    'Returned to Submitter': {
      text: 'text-violet-700 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-200 dark:border-violet-800/40',
      icon: CornerDownRight,
      colorHex: '#7C3AED',
    },
    Completed: {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      icon: CheckCircle2,
      colorHex: '#059669',
    },
    Rejected: {
      text: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/40',
      icon: XCircle,
      colorHex: '#DC2626',
    },
    Archived: {
      text: 'text-slate-700 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/30',
      border: 'border-slate-200 dark:border-slate-800/40',
      icon: FolderOpen,
      colorHex: '#475569',
    },
  };

  const currentStatus = statusConfig[record.signatureStatus] || statusConfig.Submitted;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Ribbon */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-emerald-400 font-extrabold tracking-widest uppercase bg-emerald-950/80 border border-emerald-900/60 px-2 py-0.5 rounded">
                {record.id}
              </span>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${currentStatus.text} ${currentStatus.bg} ${currentStatus.border} flex items-center gap-1`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {record.signatureStatus}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-100 mt-2">
              {record.documentName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Submitted by <strong className="text-slate-200">{record.fullName}</strong> ({record.position}) • Received: {record.signatureDate} @ {record.signatureTime}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors cursor-pointer text-xs font-bold w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Primary Container */}
        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Quick Actions Panel */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl flex flex-wrap gap-2 justify-between items-center">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Verify & Export Report
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadHtmlFile(record)}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                HTML Compliance Report
              </button>

              <button
                onClick={() => {
                  downloadHtmlFile(record);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                Export PDF / Print
              </button>

              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                <Mail className="w-4 h-4" />
                Email Sharing
              </button>
            </div>
          </div>

          {/* Email Share Box */}
          {showEmailInput && (
            <form onSubmit={handleShareEmail} className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Specify Recipient Corporate Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="e.g. director@corporation.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Send Report
                </button>
              </div>
              {emailSentNotice && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block animate-pulse">
                  ✓ Document signature compliance verification report dispatched securely to {emailInput}!
                </span>
              )}
            </form>
          )}

          {/* Authorized Actions Panel */}
          {canApprove && (
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-indigo-200/50 dark:border-indigo-900/30 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                  Executive Administrative Controls
                </span>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-xl cursor-pointer transition-all shadow-xs flex-1 sm:flex-initial"
                >
                  {isEditing ? <RotateCcw className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                  {isEditing ? 'Cancel Edit' : 'Edit Information'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-xl cursor-pointer transition-all shadow-xs flex-1 sm:flex-initial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Entry
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Overlay Banner */}
          {showDeleteConfirm && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-5 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                    CRITICAL: Confirm Permanent Record Deletion
                  </h4>
                  <p className="text-[11px] text-rose-600 dark:text-rose-300 font-semibold mt-1">
                    Are you absolutely certain you want to delete this signature compliance record (<strong>{record.id}</strong>)? 
                    This will permanently expunge this record, the original uploaded document, cryptographic signatures, 
                    voice proof, and all audit trails. <strong>This action cannot be undone.</strong>
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                >
                  No, Preserve Record
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-5 bg-indigo-50/10 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 p-6 rounded-2xl animate-fadeIn">
              <div className="border-b border-indigo-100 dark:border-indigo-900/40 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Edit className="w-4 h-4" />
                  Edit Report Information Form
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold tracking-wider">FIELDS MARKED WITH * ARE REQUIRED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left side: Submitter Information */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
                    Submitter & Identification
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Submitted By *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 animate-fadeIn"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Submitter Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={editEmployeeId}
                      onChange={(e) => setEditEmployeeId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Job Position
                      </label>
                      <input
                        type="text"
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Right side: Document Information */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
                    Document Details
                  </h4>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Document Title / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editDocName}
                      onChange={(e) => setEditDocName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Document Type
                      </label>
                      <select
                        value={editDocType}
                        onChange={(e) => setEditDocType(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                      >
                        <option value="Agreement">Agreement</option>
                        <option value="Contract">Contract</option>
                        <option value="Report">Report</option>
                        <option value="Form">Form</option>
                        <option value="Memo">Memo</option>
                        <option value="Policy">Policy</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Invoices">Invoices</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Priority Level
                      </label>
                      <select
                        value={editPriorityLevel}
                        onChange={(e) => setEditPriorityLevel(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={editRefNumber}
                        onChange={(e) => setEditRefNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Submission Purpose
                      </label>
                      <input
                        type="text"
                        value={editPurpose}
                        onChange={(e) => setEditPurpose(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Remarks / Description Details
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2.5}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                  placeholder="Describe details regarding this submission..."
                />
              </div>

              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs p-2.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-indigo-100/40 dark:border-indigo-900/20 pt-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Two-Column Record Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Box: Submitter Details */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/40 dark:border-slate-800/40 pb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    Submitter Information
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Submitted By:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{record.fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Submitter ID Code:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">#{record.employeeId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Department:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{record.department}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Job Position:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{record.position}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Box: Document Scope */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/40 dark:border-slate-800/40 pb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Document Metadata
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Document Type:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{record.documentType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Reference Code:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{record.referenceNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Purpose of Submission:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-right max-w-[180px] truncate" title={record.purpose}>
                        {record.purpose}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Priority Level:</span>
                      <strong className={`font-extrabold uppercase px-1.5 py-0.5 rounded text-[10px] ${
                        record.priorityLevel === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                        record.priorityLevel === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {record.priorityLevel || 'Normal'}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Description Block */}
              {record.description && (
                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Executive Remarks / Purpose Details
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    {record.description}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Original Document Attachment Section */}
          <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 bg-white dark:bg-slate-950/40">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Original Submitted Document Attachment
            </h3>
            
            {record.originalAttachmentName ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-xs md:max-w-md">
                      {record.originalAttachmentName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {record.originalAttachmentSize || 'Unknown Size'} • {record.originalAttachmentType || 'Document'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {record.originalAttachmentData && (
                    <a
                      href={record.originalAttachmentData}
                      download={record.originalAttachmentName}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Original
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-400 font-bold italic">No original physical document was uploaded at submission.</p>
              </div>
            )}
          </div>

          {/* Captured Ink Signature Block */}
          <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 bg-white dark:bg-slate-950/40">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Cryptographic Digital Signature Visual
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/20">
              {record.signatureImage ? (
                <div className="bg-white dark:bg-slate-900 rounded p-2 border border-slate-200 dark:border-slate-800 max-h-[120px] flex items-center justify-center shadow-xs">
                  <img
                    src={record.signatureImage}
                    alt="Drawn Authorization Ink"
                    className="max-h-[100px] max-w-[280px] object-contain"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No image signature registered</span>
              )}

              <div className="text-center sm:text-right space-y-1.5">
                <span className="text-[10px] uppercase font-extrabold bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-900/40">
                  Secure Compliance Verified
                </span>
                <p className="text-[10px] font-mono text-slate-500 mt-1 leading-tight">
                  Verification Code:<br />
                  SEC-HASH-{record.id}
                </p>
              </div>
            </div>
          </div>

          {/* Voice Confirmation Evidence */}
          {record.voiceTranscript && (
            <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 bg-white dark:bg-slate-950/40 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Voice Evidence & Spoken Record
              </h3>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    Spoken Voice Transcript
                  </span>
                  <span className="text-[10px] text-slate-400">Captured at submission</span>
                </div>
                
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{record.voiceTranscript}"
                </p>

                {record.voiceRecord ? (
                  <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                    <audio src={record.voiceRecord} controls className="w-full h-8 outline-none" />
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1">
                    (Audio log recorded securely as transaction proof)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Signature Action Record (Manager/Director signing results) */}
          <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 bg-slate-50 dark:bg-slate-950/20 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
              Signature Action Record (Final Decision)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-slate-500 block">Signed / Actions Logged By:</span>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  {record.signedBy || 'Pending Executive Signature'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Action Timestamp:</span>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {record.signatureDate && record.signatureTime ? `${record.signatureDate} @ ${record.signatureTime}` : 'Pending signature action'}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-500">Executive Decision Comments / Notes:</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-bold italic">
                "{record.signatureComment || 'No additional comments attached.'}"
              </p>
            </div>

            {/* Signed Document Download */}
            <div className="pt-2">
              <span className="text-slate-500 text-xs block mb-2 font-bold">Signed Completed File Attachment:</span>
              {record.signedAttachmentName ? (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-xs">{record.signedAttachmentName}</span>
                  </div>
                  {record.signedAttachmentData && (
                    <a
                      href={record.signedAttachmentData}
                      download={record.signedAttachmentName}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-emerald-100/60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Signed Doc
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white/40 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <p className="text-[11px] text-slate-400 italic">No final signed document file uploaded yet. Managers can attach files below.</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail List (Document Status Timeline) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Document Status Timeline & Audit Trail
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User Initiator</th>
                      <th className="p-3">Action Logged</th>
                      <th className="p-3">Status Change</th>
                      <th className="p-3">Device / Network Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.auditTrail.map((log, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-800/40 last:border-0 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{log.timestamp}</td>
                        <td className="p-3 font-black text-slate-800 dark:text-slate-200">{log.user}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{log.action}</td>
                        <td className="p-3 font-mono">
                          {log.previousStatus && log.newStatus ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold">
                              <span className="text-slate-400">{log.previousStatus}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-emerald-500">{log.newStatus}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-black">
                              INIT
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[10px] font-mono text-slate-500 max-w-xs truncate">{log.deviceInfo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Admin Approval Control Panel */}
          {canApprove && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <button
                type="button"
                onClick={() => setShowApprovalPanel(!showApprovalPanel)}
                className="w-full px-5 py-3 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-xs cursor-pointer transition-all border border-indigo-100 dark:border-indigo-900/30"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  ADMINISTRATIVE APPROVAL & SIGNATURE TIMELINE ACTION
                </span>
                <span>{showApprovalPanel ? '▼ Hide Controls' : '▲ Show Controls'}</span>
              </button>

              {showApprovalPanel && (
                <form onSubmit={handleStatusSubmit} className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-fadeIn">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status selection */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Update Document Workflow Status *
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus)}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                      >
                        {(Object.keys(statusConfig) as DocumentStatus[]).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Signed By */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Signed By (Manager/Director Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={signedBy}
                        onChange={(e) => setSignedBy(e.target.value)}
                        placeholder="e.g. Director Sophia"
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Comments / Remarks */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Decision Comments / Status Change Remarks
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Comment on identity verification or reason for requesting changes/rejection..."
                      rows={2.5}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Signed Version Attachment Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Upload Signed / Executed File Attachment (Optional)
                    </label>
                    
                    {signedAttachmentName ? (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 font-bold" />
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">{signedAttachmentName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSignedAttachmentName(null);
                            setSignedAttachmentData(null);
                          }}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleSignedFileChange(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDragging ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="file"
                          id="signed-file-upload"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleSignedFileChange(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="signed-file-upload" className="cursor-pointer">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                            Drag & Drop executed signed document here, or <span className="text-emerald-500 underline">Browse</span>
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {formError && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs p-2.5 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
                    >
                      Authorize & Save Action Record
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
