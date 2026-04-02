const PDFDocument = require('pdfkit');

const generateInsuranceCardPDF = async (policyDetails) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a document
            const doc = new PDFDocument({ margin: 30, size: 'A4' });

            // Store PDF data chunks in an array
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', err => reject(err));

            // ------------- Card Design -------------
            
            // Background Header
            doc.rect(0, 0, doc.page.width, 100)
               .fill('#0f8b8d');
               
            doc.fillColor('white')
               .fontSize(28)
               .font('Helvetica-Bold')
               .text('NABHA HEALTHCARE', 40, 35);
               
            doc.fontSize(12)
               .font('Helvetica')
               .text('Premium Health Insurance Member', 40, 65);

            // -------------------------------------
            doc.moveDown(4);

            doc.fillColor('#333333')
               .fontSize(22)
               .font('Helvetica-Bold')
               .text('Health Insurance Policy Card', 40, doc.y);
            
            doc.moveDown(1);
            
            // Draw a stylish Box for Details
            doc.rect(40, doc.y, doc.page.width - 80, 250)
               .lineWidth(1)
               .stroke('#dddddd');

            // Internal Padding
            const boxTop = doc.y + 20;

            doc.fontSize(12).font('Helvetica-Bold').fillColor('#666666').text('POLICY DETAILS', 60, boxTop);
            
            doc.moveDown(1);

            // Function to add a row
            let currentY = doc.y + 10;
            const drawRow = (label, value) => {
                doc.font('Helvetica-Bold').fillColor('#111111').fontSize(11).text(label, 60, currentY);
                doc.font('Helvetica').fillColor('#333333').text(value, 200, currentY);
                currentY += 30;
            };

            drawRow('Policy Holder Name:', policyDetails.name);
            drawRow('Policy Number:', policyDetails.policyNumber);
            drawRow('Health Plan:', policyDetails.planName);
            drawRow('Coverage Amount:', policyDetails.coverage);
            drawRow('Valid Till:', new Date(policyDetails.validTill).toLocaleDateString('en-IN'));
            drawRow('Date of Birth:', new Date(policyDetails.dob).toLocaleDateString('en-IN'));

            // Footer of card Box
            doc.rect(40, boxTop + 200, doc.page.width - 80, 50)
               .fill('#f3f4f6');
               
            doc.fillColor('#0f8b8d').font('Helvetica-Bold').fontSize(10)
               .text('24/7 HELPLINE: 9318496221 | www.nabhahealthcare.com', 40, boxTop + 220, { align: 'center' });

            // Disclaimer
            doc.moveDown(4);
            doc.fillColor('#999999').fontSize(9).font('Helvetica')
               .text('This card is system generated and does not require a physical signature.', 40, currentY + 90, { align: 'center' });
            doc.text('Please present this card at any network hospital for cashless treatment.', { align: 'center' });

            // Finalize PDF file
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInsuranceCardPDF };
