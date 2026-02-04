import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableRow, 
  TableCell, 
  TextRun, 
  HeadingLevel,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx'

export interface ForecastRow {
  month: number
  monthName: string
  revenue: number
  cogs: number
  grossProfit: number
  payroll: number
  marketing: number
  admin: number
  finance: number
  netProfit: number
  cashFlow: number
  bankBalance: number
}

export interface ExportData {
  businessName: string
  forecastData: ForecastRow[]
  kpis: {
    totalRevenue: number
    totalProfit: number
    profitMargin: number
    endingBalance: number
  }
}

// Export to Excel
export function exportToExcel(data: ExportData) {
  // Create worksheet data
  const wsData = [
    ['דוח תחזית פיננסית - ' + data.businessName],
    [],
    ['סיכום שנתי'],
    ['הכנסות כוללות', data.kpis.totalRevenue],
    ['רווח נקי', data.kpis.totalProfit],
    ['שיעור רווחיות', `${data.kpis.profitMargin.toFixed(1)}%`],
    ['יתרת בנק סוף שנה', data.kpis.endingBalance],
    [],
    ['פירוט חודשי'],
    [
      'חודש', 
      'הכנסות', 
      'עלות מכר', 
      'רווח גולמי', 
      'שכר', 
      'שיווק', 
      'הנהלה', 
      'מימון', 
      'רווח נקי', 
      'תזרים', 
      'יתרת בנק'
    ],
    ...data.forecastData.map(row => [
      row.monthName,
      row.revenue,
      row.cogs,
      row.grossProfit,
      row.payroll,
      row.marketing,
      row.admin,
      row.finance,
      row.netProfit,
      row.cashFlow,
      row.bankBalance,
    ]),
    [],
    ['סה״כ שנתי', 
      data.forecastData.reduce((s, r) => s + r.revenue, 0),
      data.forecastData.reduce((s, r) => s + r.cogs, 0),
      data.forecastData.reduce((s, r) => s + r.grossProfit, 0),
      data.forecastData.reduce((s, r) => s + r.payroll, 0),
      data.forecastData.reduce((s, r) => s + r.marketing, 0),
      data.forecastData.reduce((s, r) => s + r.admin, 0),
      data.forecastData.reduce((s, r) => s + r.finance, 0),
      data.forecastData.reduce((s, r) => s + r.netProfit, 0),
      '',
      data.forecastData[11]?.bankBalance || 0,
    ],
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  ws['!cols'] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'תחזית')

  // Generate and download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `תחזית_${data.businessName}_${new Date().toLocaleDateString('he-IL')}.xlsx`)
}

// Export to Word
export async function exportToWord(data: ExportData) {
  const MONTHS_HEB = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
  
  // Create table rows for monthly data
  const tableRows = [
    // Header row
    new TableRow({
      children: [
        'חודש', 'הכנסות', 'הוצאות', 'רווח נקי', 'יתרת בנק'
      ].map(text => new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text, bold: true, size: 22 })],
          alignment: AlignmentType.CENTER,
        })],
        width: { size: 20, type: WidthType.PERCENTAGE },
      })),
    }),
    // Data rows
    ...data.forecastData.map((row, index) => new TableRow({
      children: [
        MONTHS_HEB[index],
        `₪${row.revenue.toLocaleString()}`,
        `₪${(row.cogs + row.payroll + row.marketing + row.admin + row.finance).toLocaleString()}`,
        `₪${row.netProfit.toLocaleString()}`,
        `₪${row.bankBalance.toLocaleString()}`,
      ].map(text => new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text, size: 22 })],
          alignment: AlignmentType.CENTER,
        })],
      })),
    })),
  ]

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: 'portrait',
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          children: [new TextRun({ 
            text: `דוח תחזית פיננסית`,
            bold: true,
            size: 48,
          })],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        
        // Business name
        new Paragraph({
          children: [new TextRun({ 
            text: data.businessName,
            size: 32,
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // Date
        new Paragraph({
          children: [new TextRun({ 
            text: `תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}`,
            size: 24,
            italics: true,
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),

        // KPIs Section
        new Paragraph({
          children: [new TextRun({ 
            text: 'סיכום שנתי',
            bold: true,
            size: 32,
          })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'הכנסות כוללות: ', bold: true, size: 24 }),
            new TextRun({ text: `₪${data.kpis.totalRevenue.toLocaleString()}`, size: 24 }),
          ],
          spacing: { after: 100 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'רווח נקי שנתי: ', bold: true, size: 24 }),
            new TextRun({ text: `₪${data.kpis.totalProfit.toLocaleString()}`, size: 24 }),
          ],
          spacing: { after: 100 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'שיעור רווחיות: ', bold: true, size: 24 }),
            new TextRun({ text: `${data.kpis.profitMargin.toFixed(1)}%`, size: 24 }),
          ],
          spacing: { after: 100 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'יתרת בנק צפויה בסוף השנה: ', bold: true, size: 24 }),
            new TextRun({ text: `₪${data.kpis.endingBalance.toLocaleString()}`, size: 24 }),
          ],
          spacing: { after: 400 },
        }),

        // Monthly Table Section
        new Paragraph({
          children: [new TextRun({ 
            text: 'פירוט חודשי',
            bold: true,
            size: 32,
          })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),

        // Footer
        new Paragraph({
          children: [new TextRun({ 
            text: 'דוח זה הופק ממערכת תכנון כלכלי',
            size: 20,
            italics: true,
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
        }),
      ],
    }],
  })

  // Generate and download
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `תחזית_${data.businessName}_${new Date().toLocaleDateString('he-IL')}.docx`)
}
