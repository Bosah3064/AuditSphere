import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, AlignmentType, WidthType } from 'docx'
// Safaricom Vivid Brand Colors
const BRAND_PRIMARY = [38, 179, 90] // Vivid Green
const BRAND_ACCENT = [235, 20, 20]  // Vivid Red
const BRAND_DARK = [20, 26, 23]     // Dark text

interface ReportData {
  audits?: any[]
  findings?: any[]
  risks?: any[]
  controls?: any[]
}

const getMockFallback = (type: string) => {
  if (type === "audits") {
    return [
      { id: "a1", title: "Q3 2026 Financial Controls", type: "Financial", status: "Fieldwork", risk: "High" },
      { id: "a2", title: "ISO 27001 Compliance Review", type: "Compliance", status: "Planning", risk: "Critical" },
      { id: "a3", title: "Vendor Management Process", type: "Operational", status: "Review", risk: "Medium" }
    ]
  }
  if (type === "findings") {
    return [
      { id: "f1", title: "Unauthorized System Access", severity: "Critical", status: "Open", owner: "IT Ops", dueDate: "2026-07-15" },
      { id: "f2", title: "Missing Vendor Contracts", severity: "High", status: "Management Response", owner: "Procurement", dueDate: "2026-07-10" },
      { id: "f3", title: "Manual Journal Entry Approval Bypassed", severity: "High", status: "Draft", owner: "Finance", dueDate: "2026-08-01" }
    ]
  }
  if (type === "risks") {
    return [
      { id: "r1", title: "M-Pesa API Key Leakage", category: "IT Security", impact: 5, likelihood: 2, status: "Open" },
      { id: "r2", title: "Currency Exchange Fluctuations", category: "Financial", impact: 4, likelihood: 4, status: "Mitigated" },
      { id: "r3", title: "Inadequate AWS Snapshot Backup", category: "Operational", impact: 4, likelihood: 2, status: "Mitigated" }
    ]
  }
  if (type === "controls") {
    return [
      { id: "c1", title: "M-Pesa API endpoint MFA validation", type: "Preventive", frequency: "Real-time", status: "Effective", owner: "DevOps" },
      { id: "c2", title: "Weekly review of user account creation logs", type: "Detective", frequency: "Weekly", status: "Effective", owner: "Security Team" },
      { id: "c3", title: "Continuous backup replication across AWS regions", type: "Preventive", frequency: "Daily", status: "Effective", owner: "DBA Group" }
    ]
  }
  return []
}

export const generateDynamicPDFReport = (reportId: string, reportTitle: string, data: ReportData) => {
  const doc = new jsPDF()

  // --- 1. COVER PAGE HEADER ---
  doc.setFillColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2])
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text("AuditSphere", 14, 25)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text("Internal Audit, Compliance & GRC", 14, 32)

  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2])
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text(reportTitle, 14, 60)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`Generated on: ${date}`, 14, 70)
  doc.text(`Confidential - For Management Review Only`, 14, 78)

  // --- 2. EXECUTIVE SUMMARY (Dynamic based on Report Type) ---
  doc.setFontSize(15)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2])
  doc.text("Report Overview & Executive Summary", 14, 95)

  doc.setFontSize(10.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(50, 50, 50)
  
  let summaryText = ""
  if (reportId === "audit-report") {
    summaryText = "This engagement report outlines the scope, plan, and progress of active audit reviews. It summarizes key testing milestones, scoping considerations, and engagement parameters."
  } else if (reportId === "management-letter") {
    summaryText = "To Management: We have audited the internal controls and accounting records. Below we outline key operational deficiencies and highlight procedural gaps requiring remediation."
  } else if (reportId === "executive-summary") {
    summaryText = "This high-level reporting brief presents consolidated GRC highlights across audits, risks, and findings trackers. It outlines organizational posture and critical exceptions."
  } else if (reportId === "risk-report") {
    summaryText = "This risk registry details active operational, compliant, and security risks. Scores are calculated by mapping financial/regulatory impact against occurrence likelihood."
  } else if (reportId === "compliance-report") {
    summaryText = "This review validates organizational control designs against framework mandates. Statuses outline whether tested mechanisms are effective or require design changes."
  } else {
    summaryText = "All active deficiencies are detailed in this report, mapped to operational owners, remediation due dates, and verification plans."
  }

  const splitText = doc.splitTextToSize(summaryText, 180)
  doc.text(splitText, 14, 103)

  // --- 3. DATA GRID TABLE ---
  doc.setFontSize(15)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2])
  doc.text("Audit Records & Details", 14, 125)

  let tableHead: string[][] = []
  let tableBody: string[][] = []

  const audits = data.audits && data.audits.length > 0 ? data.audits : getMockFallback("audits")
  const findings = data.findings && data.findings.length > 0 ? data.findings : getMockFallback("findings")
  const risks = data.risks && data.risks.length > 0 ? data.risks : getMockFallback("risks")
  const controls = data.controls && data.controls.length > 0 ? data.controls : getMockFallback("controls")

  if (reportId === "audit-report" || reportId === "executive-summary") {
    tableHead = [['Audit ID', 'Title', 'Type', 'Status', 'Risk Level']]
    tableBody = audits.map((a: any) => [a.id || "", a.title || "", a.type || "", a.status || "", a.risk || ""])
  } else if (reportId === "risk-report") {
    tableHead = [['Risk ID', 'Title', 'Category', 'Score', 'Status']]
    tableBody = risks.map((r: any) => [r.id || "", r.title || "", r.category || "", String((r.impact || 1) * (r.likelihood || 1)), r.status || ""])
  } else if (reportId === "compliance-report") {
    tableHead = [['Control ID', 'Title', 'Type', 'Frequency', 'Status']]
    tableBody = controls.map((c: any) => [c.id || "", c.title || "", c.type || "", c.frequency || "", c.status || ""])
  } else {
    // Findings or Management letter
    tableHead = [['Finding ID', 'Title', 'Severity', 'Status', 'Owner', 'Due Date']]
    tableBody = findings.map((f: any) => [f.id || "", f.title || "", f.severity || "", f.status || "", f.owner || "", f.dueDate || ""])
  }

  autoTable(doc, {
    startY: 132,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: { 
      fillColor: [38, 179, 90], // Safaricom Green 
      textColor: 255, 
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 9.5, cellPadding: 4.5 },
  })

  // --- 4. FOOTER ---
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10)
    doc.text(`AuditSphere Secure GRC Report Engine`, 14, doc.internal.pageSize.height - 10)
  }

  // Save the PDF
  doc.save(`${reportTitle.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.pdf`)
}

export const generateDynamicExcelReport = async (reportId: string, reportTitle: string, data: ReportData) => {
  let excelData: any[] = []
  let columns: { header: string, key: string, width: number }[] = []

  const audits = data.audits && data.audits.length > 0 ? data.audits : getMockFallback("audits")
  const findings = data.findings && data.findings.length > 0 ? data.findings : getMockFallback("findings")
  const risks = data.risks && data.risks.length > 0 ? data.risks : getMockFallback("risks")
  const controls = data.controls && data.controls.length > 0 ? data.controls : getMockFallback("controls")

  if (reportId === "audit-report" || reportId === "executive-summary") {
    columns = [
      { header: 'Audit ID', key: 'id', width: 15 },
      { header: 'Title', key: 'title', width: 45 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Risk Level', key: 'risk', width: 15 }
    ]
    excelData = audits.map((a: any) => ({
      id: a.id, title: a.title, type: a.type, status: a.status, risk: a.risk
    }))
  } else if (reportId === "risk-report") {
    columns = [
      { header: 'Risk ID', key: 'id', width: 15 },
      { header: 'Title', key: 'title', width: 45 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Impact', key: 'impact', width: 12 },
      { header: 'Likelihood', key: 'likelihood', width: 12 },
      { header: 'Score', key: 'score', width: 12 },
      { header: 'Status', key: 'status', width: 15 }
    ]
    excelData = risks.map((r: any) => ({
      id: r.id, title: r.title, category: r.category, impact: r.impact, likelihood: r.likelihood, score: (r.impact || 1) * (r.likelihood || 1), status: r.status
    }))
  } else if (reportId === "compliance-report") {
    columns = [
      { header: 'Control ID', key: 'id', width: 15 },
      { header: 'Title', key: 'title', width: 45 },
      { header: 'Control Type', key: 'type', width: 20 },
      { header: 'Frequency', key: 'frequency', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Owner', key: 'owner', width: 25 }
    ]
    excelData = controls.map((c: any) => ({
      id: c.id, title: c.title, type: c.type, frequency: c.frequency, status: c.status, owner: c.owner
    }))
  } else {
    columns = [
      { header: 'Finding ID', key: 'id', width: 15 },
      { header: 'Title', key: 'title', width: 45 },
      { header: 'Severity', key: 'severity', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Owner', key: 'owner', width: 25 },
      { header: 'Due Date', key: 'dueDate', width: 20 }
    ]
    excelData = findings.map((f: any) => ({
      id: f.id, title: f.title, severity: f.severity, status: f.status, owner: f.owner, dueDate: f.dueDate
    }))
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'AuditSphere'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(reportTitle.slice(0, 30))

  // Add Report Title Header
  sheet.mergeCells('A1', String.fromCharCode(64 + columns.length) + '1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = reportTitle
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26B35A' } } // Safaricom Green
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }

  // Add subtitle
  sheet.mergeCells('A2', String.fromCharCode(64 + columns.length) + '2')
  const subTitleCell = sheet.getCell('A2')
  subTitleCell.value = `Generated on ${new Date().toLocaleDateString()}`
  subTitleCell.font = { name: 'Arial', size: 10, italic: true }
  subTitleCell.alignment = { horizontal: 'right' }

  sheet.addRow([]) // Spacer

  // Add Table Headers
  const headerRow = sheet.addRow(columns.map(c => c.header))
  headerRow.height = 24
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF141A17' } } // Dark header
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }
  })

  // Set columns keys and widths
  sheet.columns = columns

  // Add Data Rows
  excelData.forEach((dataRow, index) => {
    const row = sheet.addRow(columns.map(c => dataRow[c.key]))
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
      }
      
      // Alternate row colors
      if (index % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } }
      }
    })
  })

  // Write and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${reportTitle.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.xlsx`)
}

export const generateDynamicWordReport = async (reportId: string, reportTitle: string, data: ReportData) => {
  const audits = data.audits && data.audits.length > 0 ? data.audits : getMockFallback("audits")
  const findings = data.findings && data.findings.length > 0 ? data.findings : getMockFallback("findings")
  const risks = data.risks && data.risks.length > 0 ? data.risks : getMockFallback("risks")
  const controls = data.controls && data.controls.length > 0 ? data.controls : getMockFallback("controls")

  let tableRows: TableRow[] = []

  const createCell = (text: string, isHeader: boolean = false) => {
    return new TableCell({
      children: [new Paragraph({ 
        children: [new TextRun({ text: String(text), bold: isHeader, color: isHeader ? "FFFFFF" : "000000" })],
        alignment: AlignmentType.CENTER
      })],
      shading: {
        fill: isHeader ? "26B35A" : "FFFFFF"
      },
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    })
  }

  if (reportId === "audit-report" || reportId === "executive-summary") {
    tableRows.push(new TableRow({ children: [createCell("Audit ID", true), createCell("Title", true), createCell("Type", true), createCell("Status", true), createCell("Risk Level", true)] }))
    audits.forEach((a: any) => {
      tableRows.push(new TableRow({ children: [createCell(a.id), createCell(a.title), createCell(a.type), createCell(a.status), createCell(a.risk)] }))
    })
  } else if (reportId === "risk-report") {
    tableRows.push(new TableRow({ children: [createCell("Risk ID", true), createCell("Title", true), createCell("Category", true), createCell("Score", true), createCell("Status", true)] }))
    risks.forEach((r: any) => {
      tableRows.push(new TableRow({ children: [createCell(r.id), createCell(r.title), createCell(r.category), createCell(String((r.impact || 1) * (r.likelihood || 1))), createCell(r.status)] }))
    })
  } else if (reportId === "compliance-report") {
    tableRows.push(new TableRow({ children: [createCell("Control ID", true), createCell("Title", true), createCell("Type", true), createCell("Status", true)] }))
    controls.forEach((c: any) => {
      tableRows.push(new TableRow({ children: [createCell(c.id), createCell(c.title), createCell(c.type), createCell(c.status)] }))
    })
  } else {
    tableRows.push(new TableRow({ children: [createCell("Finding ID", true), createCell("Title", true), createCell("Severity", true), createCell("Status", true), createCell("Owner", true)] }))
    findings.forEach((f: any) => {
      tableRows.push(new TableRow({ children: [createCell(f.id), createCell(f.title), createCell(f.severity), createCell(f.status), createCell(f.owner)] }))
    })
  }

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
    }
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "AuditSphere",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: reportTitle,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: "Data Records",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 }
        }),
        table
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${reportTitle.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.docx`)
}
