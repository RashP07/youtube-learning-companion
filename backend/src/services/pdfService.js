const PDFDocument = require('pdfkit');

/**
 * Generate a PDF from analysis data and pipe it to the response stream.
 */
const generatePDF = (analysis, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="notes-${analysis.videoId}.pdf"`
  );

  doc.pipe(res);

  const colors = {
    primary: '#4F46E5',
    secondary: '#6B7280',
    accent: '#10B981',
    danger: '#EF4444',
    dark: '#111827',
    light: '#F9FAFB',
  };

  const pageWidth = doc.page.width - 100;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 80).fill(colors.primary);
  doc
    .fillColor('white')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('YouTube Learning Companion', 50, 20, { width: pageWidth });
  doc
    .fontSize(11)
    .font('Helvetica')
    .text('AI-Generated Study Notes', 50, 50);

  doc.moveDown(3);

  // ── Title ────────────────────────────────────────────────────────────────
  doc
    .fillColor(colors.primary)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(analysis.title || 'Video Analysis', { underline: true });

  doc
    .fillColor(colors.secondary)
    .fontSize(10)
    .font('Helvetica')
    .text(`Source: ${analysis.videoUrl}`)
    .text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`);

  doc.moveDown(1.5);
  drawDivider(doc, colors.primary);

  // ── Summary ──────────────────────────────────────────────────────────────
  sectionHeader(doc, 'Summary', colors.primary);
  doc
    .fillColor(colors.dark)
    .fontSize(11)
    .font('Helvetica')
    .text(analysis.summary || 'No summary available.', { lineGap: 4 });

  doc.moveDown(1);
  drawDivider(doc, colors.secondary);

  // ── Key Takeaways ────────────────────────────────────────────────────────
  if (analysis.keyTakeaways && analysis.keyTakeaways.length > 0) {
    sectionHeader(doc, 'Key Takeaways', colors.accent);
    analysis.keyTakeaways.forEach((point, i) => {
      doc
        .fillColor(colors.dark)
        .fontSize(11)
        .font('Helvetica')
        .text(`${i + 1}. ${point}`, { lineGap: 3 });
    });
    doc.moveDown(1);
    drawDivider(doc, colors.secondary);
  }

  // ── Notes with Timestamps ────────────────────────────────────────────────
  if (analysis.notes && analysis.notes.length > 0) {
    sectionHeader(doc, 'Timestamped Notes', colors.primary);
    analysis.notes.forEach((note) => {
      doc.moveDown(0.3);
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`[${note.timestamp}]`, { continued: true });
      doc
        .fillColor(colors.dark)
        .fontSize(10)
        .font('Helvetica')
        .text(`  ${note.text}`, { lineGap: 2 });
    });
    doc.moveDown(1);
    drawDivider(doc, colors.secondary);
  }

  // ── Quiz Questions ───────────────────────────────────────────────────────
  if (analysis.quiz && analysis.quiz.length > 0) {
    sectionHeader(doc, 'Quiz Questions', colors.accent);
    analysis.quiz.forEach((q, i) => {
      doc.moveDown(0.5);

      // Check if we need a new page
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      doc
        .fillColor(colors.dark)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Q${i + 1}: ${q.question}`, { lineGap: 2 });

      if (Array.isArray(q.options)) {
        q.options.forEach((opt, oi) => {
          const letter = ['A', 'B', 'C', 'D'][oi];
          const isAnswer = letter === q.answer;
          doc
            .fillColor(isAnswer ? colors.accent : colors.secondary)
            .fontSize(10)
            .font(isAnswer ? 'Helvetica-Bold' : 'Helvetica')
            .text(`   ${opt}${isAnswer ? '  ✓' : ''}`, { lineGap: 1 });
        });
      }

      if (q.explanation) {
        doc
          .fillColor(colors.secondary)
          .fontSize(9)
          .font('Helvetica-Oblique')
          .text(`   Explanation: ${q.explanation}`, { lineGap: 2 });
      }
    });
    doc.moveDown(1);
    drawDivider(doc, colors.secondary);
  }

  // ── Flashcards ───────────────────────────────────────────────────────────
  if (analysis.flashcards && analysis.flashcards.length > 0) {
    if (doc.y > doc.page.height - 250) {
      doc.addPage();
    }
    sectionHeader(doc, 'Flashcards', colors.primary);
    analysis.flashcards.forEach((card, i) => {
      doc.moveDown(0.4);
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Q: ${card.front}`, { lineGap: 1 });
      doc
        .fillColor(colors.dark)
        .fontSize(10)
        .font('Helvetica')
        .text(`A: ${card.back}`, { lineGap: 3 });
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.moveDown(2);
  doc
    .fillColor(colors.secondary)
    .fontSize(9)
    .font('Helvetica')
    .text('Generated by YouTube Learning Companion • AI-powered study assistant', {
      align: 'center',
    });

  doc.end();
};

const sectionHeader = (doc, title, color) => {
  doc
    .fillColor(color)
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(title);
  doc.moveDown(0.5);
};

const drawDivider = (doc, color) => {
  doc
    .strokeColor(color)
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();
  doc.moveDown(0.8);
};

module.exports = { generatePDF };
