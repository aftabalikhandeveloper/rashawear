import jsPDF from 'jspdf';
import { WooOrder } from '@/lib/types';
import { cleanPrice } from '@/lib/utils';

export function generateOrderPDF(order: WooOrder) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addText = (text: string, x: number, yPos: number, options?: { fontSize?: number; bold?: boolean; color?: [number, number, number]; align?: 'left' | 'center' | 'right' }) => {
    const { fontSize = 10, bold = false, color = [0, 0, 0], align = 'left' } = options || {};
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, yPos, { align });
  };

  const drawLine = (yPos: number) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
  };

  // ─── HEADER ───────────────────────────────────────────────────
  // Brand circle
  doc.setFillColor(0, 0, 0);
  doc.circle(20, y + 2, 5, 'F');
  addText('R', 20, y + 4, { fontSize: 8, bold: true, color: [255, 255, 255], align: 'center' });
  addText('Rashawear', 28, y + 4, { fontSize: 16, bold: true });

  addText('ORDER CONFIRMATION', pageWidth - 15, y + 4, { fontSize: 10, bold: true, color: [100, 100, 100], align: 'right' });
  y += 16;

  drawLine(y);
  y += 10;

  // ─── ORDER DETAILS ────────────────────────────────────────────
  addText('Order Number', 15, y, { fontSize: 8, color: [120, 120, 120] });
  addText('Date', 70, y, { fontSize: 8, color: [120, 120, 120] });
  addText('Status', 125, y, { fontSize: 8, color: [120, 120, 120] });
  addText('Payment', pageWidth - 15, y, { fontSize: 8, color: [120, 120, 120], align: 'right' });
  y += 6;

  addText(`#${order.orderNumber}`, 15, y, { fontSize: 11, bold: true });
  const orderDate = order.date ? new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  addText(orderDate, 70, y, { fontSize: 11 });
  const statusText = (order.status || 'processing').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  addText(statusText, 125, y, { fontSize: 11, color: [217, 119, 6] });
  addText(order.paymentMethodTitle || 'COD', pageWidth - 15, y, { fontSize: 11, align: 'right' });
  y += 14;

  drawLine(y);
  y += 10;

  // ─── BILLING / SHIPPING ───────────────────────────────────────
  if (order.billing) {
    addText('BILLING & SHIPPING ADDRESS', 15, y, { fontSize: 8, bold: true, color: [120, 120, 120] });
    y += 8;
    addText(`${order.billing.firstName} ${order.billing.lastName}`, 15, y, { fontSize: 10, bold: true });
    y += 6;
    addText(order.billing.address1 || '', 15, y, { fontSize: 9 });
    y += 5;
    addText(`${order.billing.city || ''}, ${order.billing.state || ''} ${order.billing.postcode || ''}`, 15, y, { fontSize: 9 });
    y += 5;
    addText(order.billing.country || '', 15, y, { fontSize: 9 });
    y += 5;
    addText(`Email: ${order.billing.email || ''}`, 15, y, { fontSize: 9, color: [80, 80, 80] });
    y += 5;
    addText(`Phone: ${order.billing.phone || ''}`, 15, y, { fontSize: 9, color: [80, 80, 80] });
    y += 12;
  }

  drawLine(y);
  y += 10;

  // ─── ORDER ITEMS TABLE ────────────────────────────────────────
  addText('ITEM', 15, y, { fontSize: 8, bold: true, color: [120, 120, 120] });
  addText('QTY', 130, y, { fontSize: 8, bold: true, color: [120, 120, 120], align: 'center' });
  addText('TOTAL', pageWidth - 15, y, { fontSize: 8, bold: true, color: [120, 120, 120], align: 'right' });
  y += 3;
  drawLine(y);
  y += 7;

  order.lineItems?.nodes?.forEach((item) => {
    const name = item.product?.node?.name || 'Product';
    const truncatedName = name.length > 55 ? name.slice(0, 55) + '...' : name;
    addText(truncatedName, 15, y, { fontSize: 10 });
    addText(String(item.quantity), 130, y, { fontSize: 10, align: 'center' });
    addText(cleanPrice(item.total) || '-', pageWidth - 15, y, { fontSize: 10, align: 'right' });
    y += 8;

    // Check if we need a new page
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  y += 4;
  drawLine(y);
  y += 10;

  // ─── TOTALS ───────────────────────────────────────────────────
  const addTotalRow = (label: string, value: string, bold = false, color: [number, number, number] = [0, 0, 0]) => {
    addText(label, 120, y, { fontSize: bold ? 11 : 9, bold, color: [100, 100, 100], align: 'right' });
    addText(value, pageWidth - 15, y, { fontSize: bold ? 13 : 10, bold, color, align: 'right' });
    y += bold ? 8 : 6;
  };

  addTotalRow('Subtotal', cleanPrice(order.subtotal) || '-');
  addTotalRow('Shipping', cleanPrice(order.shippingTotal) || 'Free');
  if (order.totalTax && cleanPrice(order.totalTax) !== '₨ 0') {
    addTotalRow('Tax', cleanPrice(order.totalTax));
  }
  y += 2;
  drawLine(y);
  y += 8;
  addTotalRow('Total', cleanPrice(order.total) || '-', true, [5, 122, 85]);

  y += 14;

  // ─── FOOTER ───────────────────────────────────────────────────
  drawLine(y);
  y += 8;
  addText('Thank you for shopping with Rashawear!', pageWidth / 2, y, { fontSize: 10, bold: true, align: 'center' });
  y += 6;
  addText('For any questions, contact us at support@rashawear.com', pageWidth / 2, y, { fontSize: 8, color: [120, 120, 120], align: 'center' });
  y += 5;
  addText('dash.rashawear.com', pageWidth / 2, y, { fontSize: 8, color: [120, 120, 120], align: 'center' });

  // Save
  doc.save(`Rashawear-Order-${order.orderNumber}.pdf`);
}
