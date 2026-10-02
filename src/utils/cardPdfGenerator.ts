import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScoutMember } from '../types';

// Standard ISO/IEC 7810 ID-1 (CR80) dimensions in mm
export const CR80_WIDTH_MM = 85.6;
export const CR80_HEIGHT_MM = 53.98;

export interface PdfExportOptions {
  mode: 'exact-cr80' | 'a4-sheet-foldable';
  qualityScale?: number;
}

/**
 * Capture an HTML card element cleanly into a high-resolution canvas
 */
async function captureElementToCanvas(element: HTMLElement, scale: number = 2.5): Promise<HTMLCanvasElement> {
  // 1. Wait for any internal images to be fully loaded
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(() => resolve(), 1200);
      });
    })
  );

  // 2. Capture using html2canvas
  return await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    imageTimeout: 12000,
    width: element.offsetWidth || 460,
    height: element.offsetHeight || 300,
    onclone: (clonedDoc) => {
      const el = clonedDoc.getElementById(element.id);
      if (el) {
        el.style.transform = 'none';
        el.style.transition = 'none';
        el.style.visibility = 'visible';
        el.style.display = 'block';
      }
    },
  });
}

/**
 * Download High-Resolution PDF of a Scout Card (Front and Back)
 */
export async function downloadCardImagePng(
  frontElement: HTMLElement,
  member: ScoutMember,
  qualityScale: number = 3.0
): Promise<void> {
  const frontCanvas = await captureElementToCanvas(frontElement, qualityScale);
  const sanitizedName = (member.fullName || 'PENGAKAP')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 25);
  const fileName = `Kad_Pengakap_Depan_${member.id}_${sanitizedName}.png`;

  frontCanvas.toBlob((blob) => {
    if (!blob) {
      // Fallback to dataURL download
      const dataUrl = frontCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 2000);
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2500);
  }, 'image/png', 1.0);
}

export async function downloadCardPdf(
  frontElement: HTMLElement,
  backElement: HTMLElement,
  member: ScoutMember,
  options: PdfExportOptions = { mode: 'exact-cr80', qualityScale: 2.5 }
): Promise<void> {
  const { mode, qualityScale = 2.5 } = options;

  // Capture both sides to high-res canvas
  const frontCanvas = await captureElementToCanvas(frontElement, qualityScale);
  const backCanvas = await captureElementToCanvas(backElement, qualityScale);

  const frontImgData = frontCanvas.toDataURL('image/png', 1.0);
  const backImgData = backCanvas.toDataURL('image/png', 1.0);

  const sanitizedName = (member.fullName || 'PENGAKAP')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 25);
  const fileName = `Kad_Pengakap_${member.id}_${sanitizedName}.pdf`;

  if (mode === 'exact-cr80') {
    // 2-page document where each page is EXACT CR80 dimensions (85.6mm x 53.98mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [CR80_WIDTH_MM, CR80_HEIGHT_MM],
      compress: true,
    });

    // Page 1: Front
    pdf.addImage(frontImgData, 'PNG', 0, 0, CR80_WIDTH_MM, CR80_HEIGHT_MM, undefined, 'FAST');

    // Page 2: Back
    pdf.addPage([CR80_WIDTH_MM, CR80_HEIGHT_MM], 'landscape');
    pdf.addImage(backImgData, 'PNG', 0, 0, CR80_WIDTH_MM, CR80_HEIGHT_MM, undefined, 'FAST');

    // Save with guaranteed cross-browser blob trigger
    savePdfCrossBrowser(pdf, fileName);
  } else {
    // A4 Printable Sheet with exact cut marks and folding guidelines
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const a4Width = 210;
    const marginX = (a4Width - (CR80_WIDTH_MM * 2 + 10)) / 2; // Center two cards side by side
    const startY = 35;

    // Header info on sheet
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(20, 30, 70);
    pdf.text('PERSEKUTUAN PENGAKAP MALAYSIA DAERAH PENDANG', a4Width / 2, 18, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(80, 90, 110);
    pdf.text(
      'Standard Saiz Kad CR80 (85.6mm × 54mm). Cetak pada Skala 100% (Actual Size).',
      a4Width / 2,
      24,
      { align: 'center' }
    );
    pdf.text(
      `Nama: ${member.fullName} | No. Ahli: ${member.id} | K/P: ${member.icPassport || '-'}`,
      a4Width / 2,
      29,
      { align: 'center' }
    );

    // Front Card
    const frontX = marginX;
    pdf.addImage(frontImgData, 'PNG', frontX, startY, CR80_WIDTH_MM, CR80_HEIGHT_MM);

    // Back Card (side by side for easy horizontal folding or laminating pouch)
    const backX = frontX + CR80_WIDTH_MM + 10;
    pdf.addImage(backImgData, 'PNG', backX, startY, CR80_WIDTH_MM, CR80_HEIGHT_MM);

    // Draw Corner Crop Marks (Cut lines)
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.2);

    const drawCropMarks = (x: number, y: number, w: number, h: number) => {
      const len = 4;
      pdf.line(x - 2, y, x - 2 - len, y);
      pdf.line(x, y - 2, x, y - 2 - len);
      pdf.line(x + w + 2, y, x + w + 2 + len, y);
      pdf.line(x + w, y - 2, x + w, y - 2 - len);
      pdf.line(x - 2, y + h, x - 2 - len, y + h);
      pdf.line(x, y + h + 2, x, y + h + 2 + len);
      pdf.line(x + w + 2, y + h, x + w + 2 + len, y + h);
      pdf.line(x + w, y + h + 2, x + w, y + h + 2 + len);
    };

    drawCropMarks(frontX, startY, CR80_WIDTH_MM, CR80_HEIGHT_MM);
    drawCropMarks(backX, startY, CR80_WIDTH_MM, CR80_HEIGHT_MM);

    // Labels under cards
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text('▲ BAHAGIAN DEPAN (85.6 × 54 mm)', frontX + CR80_WIDTH_MM / 2, startY + CR80_HEIGHT_MM + 6, { align: 'center' });
    pdf.text('▲ BAHAGIAN BELAKANG (85.6 × 54 mm)', backX + CR80_WIDTH_MM / 2, startY + CR80_HEIGHT_MM + 6, { align: 'center' });

    // Stacking/folding guide line
    pdf.setLineDashPattern([1, 1], 0);
    pdf.line(frontX + CR80_WIDTH_MM + 5, startY - 5, frontX + CR80_WIDTH_MM + 5, startY + CR80_HEIGHT_MM + 10);
    pdf.setLineDashPattern([], 0);

    // Footer note
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 140);
    pdf.text('Portal Kad Digital Pengakap Daerah Pendang • Developed by Miss Shada 2026', a4Width / 2, 280, { align: 'center' });

    // Save with guaranteed cross-browser blob trigger
    savePdfCrossBrowser(pdf, fileName);
  }
}

/**
 * Robust cross-browser PDF downloader using Blob and HTML5 download attribute
 */
function savePdfCrossBrowser(pdf: jsPDF, fileName: string) {
  try {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2500);
  } catch (err) {
    console.warn('Fallback to standard pdf.save:', err);
    pdf.save(fileName);
  }
}

/**
 * Direct print trigger using browser print with exact 85.6mm x 53.98mm styles
 */
export function triggerDirectPrint(): boolean {
  try {
    window.print();
    return true;
  } catch (err) {
    console.error('Failed to trigger window.print():', err);
    return false;
  }
}
