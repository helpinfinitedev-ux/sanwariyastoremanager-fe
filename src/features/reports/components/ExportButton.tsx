import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Toast from '@/web/toast';

type CellAlignment = 'left' | 'center' | 'right';

export interface PdfExportColumn<Row> {
  header: string;
  value: (row: Row) => unknown;
  width?: number;
  align?: CellAlignment;
}

interface ExportButtonProps<Row> {
  reportName: string;
  columns: PdfExportColumn<Row>[];
  rows: Row[];
  summary?: Array<{ label: string; value: unknown }>;
  dateRange?: { startDate: string; endDate: string };
}

function toPdfText(value: unknown): string {
  if (value === undefined || value === null || value === '') return '-';

  return String(value)
    .replace(/₹/g, 'INR ')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '');
}

export function ExportButton<Row>({
  reportName,
  columns,
  rows,
  summary = [],
  dateRange,
}: ExportButtonProps<Row>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      const generatedAt = new Date();

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(toPdfText(reportName), margin, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${generatedAt.toLocaleString('en-IN')}`, margin, 22);

      let y = 28;
      if (dateRange?.startDate && dateRange?.endDate) {
        doc.text(`Reporting period: ${dateRange.startDate} to ${dateRange.endDate}`, margin, y);
        y += 6;
      }

      if (summary.length) {
        const gap = 3;
        const cardsPerRow = Math.min(4, summary.length);
        const cardWidth = (contentWidth - gap * (cardsPerRow - 1)) / cardsPerRow;
        const cardHeight = 15;

        summary.forEach((item, index) => {
          if (index > 0 && index % cardsPerRow === 0) y += cardHeight + gap;
          const x = margin + (index % cardsPerRow) * (cardWidth + gap);
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(toPdfText(item.label), x + 3, y + 5);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(toPdfText(item.value), x + 3, y + 11);
        });

        y += cardHeight + 7;
      }

      const totalWeight = columns.reduce((sum, column) => sum + (column.width || 1), 0) || 1;
      const columnWidths = columns.map((column) => contentWidth * ((column.width || 1) / totalWeight));
      const headerHeight = 9;

      const drawTableHeader = () => {
        let x = margin;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(15, 23, 42);

        columns.forEach((column, index) => {
          const width = columnWidths[index];
          doc.setFillColor(15, 23, 42);
          doc.setDrawColor(15, 23, 42);
          doc.rect(x, y, width, headerHeight, 'FD');
          const align = column.align || 'left';
          const textX = align === 'right' ? x + width - 2 : align === 'center' ? x + width / 2 : x + 2;
          doc.text(toPdfText(column.header), textX, y + 5.8, { align });
          x += width;
        });

        y += headerHeight;
      };

      drawTableHeader();

      if (!rows.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('No records available for the selected report.', margin + 2, y + 7);
      } else {
        rows.forEach((row, rowIndex) => {
          const cellLines = columns.map((column, index) => {
            const lines: string[] = doc.splitTextToSize(
              toPdfText(column.value(row)),
              Math.max(8, columnWidths[index] - 4),
            );
            return lines.length > 10
              ? [...lines.slice(0, 9), `${lines[9].slice(0, -3)}...`]
              : lines;
          });
          const maxLines = Math.max(1, ...cellLines.map((lines) => lines.length));
          const rowHeight = Math.max(8, maxLines * 4 + 3);

          if (y + rowHeight > pageHeight - 12) {
            doc.addPage();
            y = margin;
            drawTableHeader();
          }

          let x = margin;
          const shade = rowIndex % 2 === 0 ? 255 : 248;
          doc.setFillColor(shade, rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 252);
          doc.setDrawColor(226, 232, 240);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);

          columns.forEach((column, index) => {
            const width = columnWidths[index];
            const align = column.align || 'left';
            const textX = align === 'right' ? x + width - 2 : align === 'center' ? x + width / 2 : x + 2;
            doc.setFillColor(shade, rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 252);
            doc.setDrawColor(226, 232, 240);
            doc.rect(x, y, width, rowHeight, 'FD');
            doc.text(cellLines[index], textX, y + 5, { align, lineHeightFactor: 1.15 });
            x += width;
          });

          y += rowHeight;
        });
      }

      const filename = `${reportName
        .trim()
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '')}_${generatedAt.toISOString().slice(0, 10)}.pdf`;

      doc.save(filename);
      Toast.show({
        type: 'success',
        text1: 'PDF Downloaded',
        text2: `${filename} has been downloaded.`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'PDF Export Failed',
        text2: error?.message || 'Could not generate the report PDF.',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      title={exporting ? 'Generating PDF...' : 'Download PDF'}
      onPress={handleExport}
      variant="outline"
      size="sm"
      icon="document-text-outline"
      loading={exporting}
      disabled={exporting}
    />
  );
}

export default ExportButton;
