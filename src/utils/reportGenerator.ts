import { SignatureRecord } from '../types';

export function generateHtmlReport(record: SignatureRecord): string {
  const generatedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const displayId = record.id.startsWith('SR-') ? record.id.replace('SR-', 'SIG-') : record.id;

  const auditRows = record.auditTrail
    .map(
      (log) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #334155;">${log.timestamp}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #1E293B; font-weight: 700;">${log.user}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #475569;">${log.action}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; color: #0D9488; font-family: monospace;">
        ${log.previousStatus && log.newStatus ? `${log.previousStatus} &rarr; ${log.newStatus}` : 'INITIAL'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; color: #64748B; font-family: monospace;">${log.deviceInfo}</td>
    </tr>
  `
    )
    .join('');

  const statusColors: Record<string, { text: string; bg: string }> = {
    Submitted: { text: '#2563EB', bg: '#EFF6FF' },
    'Under Review': { text: '#4F46E5', bg: '#EEF2F6' },
    'Need Correction': { text: '#D97706', bg: '#FFFBEB' },
    'Approved & Signed': { text: '#0D9488', bg: '#F0FDFA' },
    'Returned to Submitter': { text: '#7C3AED', bg: '#F5F3FF' },
    Completed: { text: '#059669', bg: '#ECFDF5' },
    Rejected: { text: '#DC2626', bg: '#FEF2F2' },
    Archived: { text: '#475569', bg: '#F8FAFC' },
  };

  const currentColors = statusColors[record.signatureStatus] || { text: '#2563EB', bg: '#EFF6FF' };

  const signatureImgHtml = record.signatureImage
    ? `<img src="${record.signatureImage}" alt="Authorized Signature" style="max-height: 90px; max-width: 100%; display: block; margin: 10px 0; object-fit: contain;" />`
    : `<div style="padding: 15px; border: 1px dashed #CBD5E1; color: #94A3B8; text-align: center; border-radius: 6px; font-size: 12px;">No signature visual captured</div>`;

  const audioHtml = record.voiceRecord
    ? `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-top: 8px;">
        <p style="margin: 0 0 8px 0; font-size: 11px; color: #475569; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">▶ Spoken Voice Evidence Playback</p>
        <audio src="${record.voiceRecord}" controls style="width: 100%; height: 32px;"></audio>
      </div>
    `
    : `<p style="color: #94A3B8; font-style: italic; font-size: 12px; margin: 5px 0 0 0;">Spoken voice confirmation transcript logged. No physical audio stream saved.</p>`;

  const originalAttachmentHtml = record.originalAttachmentName
    ? `<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-top: 8px;">
         <span style="font-size: 12px; font-weight: bold; color: #1E293B;">📄 ${record.originalAttachmentName}</span>
         <span style="font-size: 11px; color: #64748B; margin-left: 10px;">(${record.originalAttachmentSize || 'Unknown size'})</span>
       </div>`
    : `<p style="color: #94A3B8; font-style: italic; font-size: 12px; margin: 5px 0 0 0;">No physical document was attached at submission.</p>`;

  const signedAttachmentHtml = record.signedAttachmentName
    ? `<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px; margin-top: 8px;">
         <span style="font-size: 12px; font-weight: bold; color: #15803D;">✅ ${record.signedAttachmentName}</span>
         <span style="font-size: 11px; color: #166534; margin-left: 10px;">(Executed & Signed Copy)</span>
       </div>`
    : `<p style="color: #94A3B8; font-style: italic; font-size: 12px; margin: 5px 0 0 0;">No executed file attachment uploaded yet.</p>`;

  // User requested raw literal report structure for easy copy-paste
  const plainTextReport = `SIGNED DOCUMENT RECORD

Record ID:
${displayId}

Document Name:
${record.documentName}

Category:
${record.documentType}

Signed Date:
${record.signatureDate}

Signed Time:
${record.signatureTime}

Description:
${record.description || record.purpose || `Digital signature authorization log for ${record.documentName}`}

Attachment:
${record.originalAttachmentName || 'None'}

Remarks:
${record.signatureComment || 'Completed'}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Personal Signed Document Record - ${displayId}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #F8FAFC;
      color: #1E293B;
      line-height: 1.5;
      margin: 0;
      padding: 40px 20px;
    }
    .report-card {
      max-width: 800px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
      overflow: hidden;
    }
    .brand-header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFFFFF;
      padding: 30px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #94A3B8;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .record-id-badge {
      background-color: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 16px;
      border-radius: 50px;
      font-family: monospace;
      font-weight: bold;
      font-size: 14px;
    }
    .report-content {
      padding: 40px;
    }
    .literal-manifest-box {
      background-color: #FAF5FF;
      border: 1px solid #E9D5FF;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .literal-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #7E22CE;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #F3E8FF;
      padding-bottom: 6px;
    }
    .literal-text {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      color: #581C87;
      white-space: pre-wrap;
      margin: 0;
      line-height: 1.6;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin-bottom: 30px;
    }
    .info-group {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px;
    }
    .info-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748B;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .field-label {
      color: #64748B;
      font-weight: 500;
    }
    .field-value {
      color: #0F172A;
      font-weight: 700;
      text-align: right;
    }
    .signature-container {
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      background-color: #FFFFFF;
    }
    .signature-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 20px;
    }
    .signature-stamp {
      border: 2px dashed #D8B4FE;
      border-radius: 8px;
      padding: 8px;
      display: inline-block;
      text-align: center;
      background-color: #FAF5FF;
      color: #7E22CE;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .audit-section {
      margin-top: 40px;
    }
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #334155;
      font-weight: 800;
      margin-bottom: 15px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
    }
    .audit-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .audit-table th {
      background-color: #F8FAFC;
      color: #475569;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px;
      border-bottom: 2px solid #E2E8F0;
      font-weight: 700;
    }
    .footer-stamp {
      text-align: center;
      padding: 25px;
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      font-size: 11px;
      color: #64748B;
    }
    .no-print {
      max-width: 800px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
    }
    .btn {
      background-color: #0F172A;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1E293B;
    }
    .btn-secondary {
      background-color: #FFFFFF;
      color: #0F172A;
      border: 1px solid #E2E8F0;
    }
    .btn-secondary:hover {
      background-color: #F8FAFC;
    }
    @media print {
      body {
        background-color: #FFFFFF;
        padding: 0;
      }
      .report-card {
        box-shadow: none;
        border: none;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>

  <div class="no-print">
    <button class="btn btn-secondary" onclick="window.close()">✕ Close Report</button>
    <div>
      <button class="btn" onclick="window.print()">🖨 Print / Export PDF</button>
    </div>
  </div>

  <div class="report-card">
    <div class="brand-header">
      <div>
        <h1 class="brand-title">PERSONAL SIGNED DOCUMENT RECORD</h1>
        <p class="brand-subtitle">Digital Signature Logbook & Proof Sheet</p>
      </div>
      <div class="record-id-badge">
        ${displayId}
      </div>
    </div>

    <div class="report-content">
      
      <!-- Exact User Format Copy-Paste Area -->
      <div class="literal-manifest-box">
        <h3 class="literal-title">📋 Copy-Pasteable Plain-Text Log Record</h3>
        <pre class="literal-text" id="copyText">${plainTextReport}</pre>
        <button class="btn btn-secondary" style="margin-top: 10px; padding: 6px 12px; font-size: 11px;" onclick="navigator.clipboard.writeText(document.getElementById('copyText').innerText); alert('Copied to clipboard!')">Copy Manifest Text</button>
      </div>
      
      <!-- Primary Core Metadata Grid -->
      <div class="grid">
        <!-- Signatory profile -->
        <div class="info-group">
          <h3 class="info-title">Signatory Profile</h3>
          <div class="field-row">
            <span class="field-label">Signatory Profile</span>
            <span class="field-value">${record.createdBy || 'Self'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Prepared / Submitted By</span>
            <span class="field-value">${record.fullName || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Related Department</span>
            <span class="field-value">${record.department}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Signatory Position</span>
            <span class="field-value">${record.position || 'Authorized Signatory'}</span>
          </div>
        </div>

        <!-- Document info -->
        <div class="info-group">
          <h3 class="info-title">Document & Status Profile</h3>
          <div class="field-row">
            <span class="field-label">Document Title</span>
            <span class="field-value" style="display: block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${record.documentName}">${record.documentName}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Document Category</span>
            <span class="field-value">${record.documentType}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Reference No.</span>
            <span class="field-value">${record.referenceNumber}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Log Status</span>
            <span class="field-value" style="color: ${currentColors.text}; background-color: ${currentColors.bg}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">
              ${record.signatureStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Description context -->
      <div class="info-group" style="margin-bottom: 30px;">
        <h3 class="info-title">Description & Scope</h3>
        <p style="margin: 0; font-size: 13px; color: #1E293B; font-weight: 600; line-height: 1.6;">${record.description || record.purpose || 'No additional description provided.'}</p>
      </div>

      <!-- Attachment Overview Grid -->
      <div class="grid">
        <div class="signature-container" style="margin-bottom: 0;">
          <h3 class="info-title">Associated Original Attachment</h3>
          ${originalAttachmentHtml}
        </div>
        <div class="signature-container" style="margin-bottom: 0;">
          <h3 class="info-title">Executed Signed Document Copy</h3>
          ${signedAttachmentHtml}
        </div>
      </div>

      <div style="height: 30px;"></div>

      <!-- Signature Visual Evidence -->
      <div class="signature-container">
        <h3 class="info-title" style="margin-bottom: 15px;">AUTHORIZED INK SIGNATURE VISUAL</h3>
        <div class="signature-flex">
          <div>
            ${signatureImgHtml}
          </div>
          <div style="text-align: right;">
            <div class="signature-stamp">
              VERIFIED RECORD
            </div>
            <p style="font-size: 10px; color: #64748B; margin: 8px 0 0 0; font-family: monospace;">
              HASH REFERENCE:<br>
              SHA256-${record.id}-${record.employeeId || 'ME'}
            </p>
          </div>
        </div>
      </div>

      <!-- Voice Evidence -->
      <div class="signature-container">
        <h3 class="info-title" style="margin-bottom: 12px;">VOICE EVIDENCE & TRANSACTION RECORD</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <p style="font-size: 12px; font-weight: 500; color: #334155; margin: 0;">
            <strong style="color: #64748B;">Spoken Transcript:</strong> 
            "${record.voiceTranscript || 'I confirm that this signature and document metadata is accurate and represents my official digital signoff.'}"
          </p>
          ${audioHtml}
        </div>
      </div>

      <!-- Audit Remarks -->
      <div class="info-group" style="margin-bottom: 30px;">
        <h3 class="info-title">Transaction Status & Remarks</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px;">
          <div>
            <p style="margin: 4px 0;"><span style="color: #64748B; font-weight: 500;">Signing Date:</span> <strong style="color: #0F172A;">${record.signatureDate}</strong></p>
            <p style="margin: 4px 0;"><span style="color: #64748B; font-weight: 500;">Signing Time:</span> <strong style="color: #0F172A;">${record.signatureTime}</strong></p>
          </div>
          <div>
            <p style="margin: 4px 0;"><span style="color: #64748B; font-weight: 500;">Remarks / Notes:</span></p>
            <p style="margin: 4px 0; font-style: italic; color: #475569;">"${record.signatureComment || 'Completed'}"</p>
          </div>
        </div>
      </div>

      <!-- Detailed Audit Trail -->
      <div class="audit-section">
        <h3 class="section-title">🛡️ Record Security Audit Trail</h3>
        <table class="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User Initiator</th>
              <th>Action Logged</th>
              <th>Status Transition</th>
              <th>Network / Device Signature</th>
            </tr>
          </thead>
          <tbody>
            ${auditRows}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer-stamp">
      <p style="margin: 0; font-weight: bold;">Personal Signed Document Verification Authority</p>
      <p style="margin: 4px 0 0 0;">Generated by Signature Store AI System on ${generatedDate}. This document serves as digital proof of personal signature execution and compliance.</p>
    </div>
  </div>

</body>
</html>`;
}

export function downloadHtmlFile(record: SignatureRecord) {
  const htmlContent = generateHtmlReport(record);
  const displayId = record.id.startsWith('SR-') ? record.id.replace('SR-', 'SIG-') : record.id;
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Signed_Document_Record_${displayId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
