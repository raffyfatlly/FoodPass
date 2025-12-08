import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DeclaredItem } from "../types";

export const generateDeclarationPDF = (items: DeclaredItem[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // -- Header --
  doc.setFillColor(249, 115, 22); // Brand Orange (approx brand-500)
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Food Inventory List", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);

  // -- Table --
  // Prepare body data
  const bodyData = items.map(item => [
    '', // Placeholder for image
    item.brand + "\n" + item.name, // Combined Name
    item.ingredients,
    item.weight,
    item.quantity.toString()
  ]);

  autoTable(doc, {
    startY: 50,
    head: [["Photo", "Product Details", "Ingredients", "Weight", "Qty"]],
    body: bodyData,
    headStyles: { 
        fillColor: [67, 20, 7], // Dark Orange/Brown
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
    },
    bodyStyles: {
        minCellHeight: 25, // Ensure space for image
        valign: 'middle'
    },
    alternateRowStyles: { fillColor: [255, 247, 237] }, // Brand 50
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' }, // Photo column
      1: { cellWidth: 40, fontStyle: 'bold' }, // Product
      2: { cellWidth: 'auto' }, // Ingredients
      3: { cellWidth: 20, halign: 'center' }, // Weight
      4: { cellWidth: 15, halign: 'center' }, // Qty
    },
    didDrawCell: (data) => {
      // Draw image in the first column
      if (data.section === 'body' && data.column.index === 0) {
        const item = items[data.row.index];
        if (item.image) {
           try {
               // Calculate formatting to fit image squarely in cell
               const cell = data.cell;
               const imageSize = 20;
               const x = cell.x + (cell.width - imageSize) / 2;
               const y = cell.y + (cell.height - imageSize) / 2;
               
               doc.addImage(item.image, 'JPEG', x, y, imageSize, imageSize);
           } catch (e) {
               console.error("Error adding image to PDF", e);
           }
        }
      }
    }
  });

  doc.save("food_inventory_list.pdf");
};