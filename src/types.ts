export type UserRole = 'Super Admin' | 'Admin / Manager' | 'Normal User';

export interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
  deviceInfo: string;
  previousStatus?: string;
  newStatus?: string;
}

export type DocumentStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Need Correction'
  | 'Approved & Signed'
  | 'Returned to Submitter'
  | 'Completed'
  | 'Rejected'
  | 'Archived';

export interface SignatureRecord {
  id: string; // e.g. DOC-000125
  employeeId: string;
  fullName: string; // Person who gives the document (Submitted By)
  department: string;
  position: string;
  documentName: string; // Document title
  documentType: string; // Contract, Report, Request, Approval, Memo, etc.
  referenceNumber: string;
  purpose: string; // Reason for submission
  priorityLevel: 'Normal' | 'Urgent' | 'High';
  
  // Original Attachment
  originalAttachmentName: string | null;
  originalAttachmentData: string | null; // Base64 representation or mock url
  originalAttachmentType: string | null;
  originalAttachmentSize: string | null;

  // Signed Attachment
  signedAttachmentName: string | null;
  signedAttachmentData: string | null;

  // Signature / Approval Actions
  signatureStatus: DocumentStatus;
  signatureImage: string | null; // drawn signature
  voiceRecord: string | null; // voice audio base64 or mock url
  voiceTranscript: string;
  description: string;
  createdBy: string;
  
  // Signature Action details
  signedBy?: string;
  signatureDate: string;
  signatureTime: string;
  signatureAction?: 'Approved' | 'Rejected' | 'Returned' | null;
  signatureComment?: string;
  auditTrail: AuditLog[];
}

export interface ParseVoiceResult {
  employeeId: string;
  fullName: string;
  department: string;
  documentName: string;
  documentType: string;
  purpose: string;
  priorityLevel?: 'Normal' | 'Urgent' | 'High';
}
