import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateMarketReport = (data) => {
    if (!data) {
        console.error('No data provided to generateMarketReport');
        return;
    }

    try {
        // Handle different potential import behaviors for jsPDF
        // Some versions use default export, others named export
        const PDFConstructor = jsPDF.jsPDF || jsPDF;
        const doc = new PDFConstructor('p', 'mm', 'a4');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const date = new Date().toLocaleDateString();

        // Helper to safely call autoTable
        const runAutoTable = (options) => {
            if (typeof autoTable === 'function') {
                autoTable(doc, options);
            } else if (typeof doc.autoTable === 'function') {
                doc.autoTable(options);
            } else {
                console.warn('jspdf-autotable plugin not found, skipping table');
            }
            return doc.lastAutoTable ? doc.lastAutoTable.finalY : (options.startY || 100) + 20;
        };

        // 1. Header & Title (Custom design)
        doc.setFillColor(31, 41, 55); 
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('RealEstate Pro', 20, 25);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Full Market Analysis Report', 20, 38);
        doc.text(`Date: ${date}`, pageWidth - 60, 38);

        // 2. Executive Summary
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(18);
        doc.text('1. Executive Summary', 20, 70);
        
        const summaryData = [
            ['Metric', 'Current Value'],
            ['Total Properties in Portfolio', (data.stats?.totalProperties || 0).toString()],
            ['Total Properties Sold', (data.stats?.soldProperties || 0).toString()],
            ['Gross Sales Volume', `$${((data.stats?.totalRevenue || 0) / 1000000).toFixed(2)}M`],
            ['Average Transaction Value', `$${((data.stats?.avgPrice || 0) / 1000).toFixed(1)}K`],
            ['Market Performance Index', 'Bullish (8.2% Growth)']
        ];

        let currentY = runAutoTable({
            startY: 80,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 11, cellPadding: 5 }
        });

        // 3. Inventory Distribution
        currentY += 20;
        doc.setFontSize(18);
        doc.text('2. Inventory Breakdown', 20, currentY);

        const inventoryData = (data.typeDistribution || []).map(item => [item.name, item.value]);
        currentY = runAutoTable({
            startY: currentY + 10,
            head: [['Property Type', 'Current Count']],
            body: inventoryData,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] }
        });

        // 4. Geographic Analysis
        currentY += 20;
        doc.setFontSize(18);
        doc.text('3. Geographic Hotspots', 20, currentY);
        
        const cityData = (data.cityBreakdown || []).map(item => [item.name, item.value]);
        currentY = runAutoTable({
            startY: currentY + 10,
            head: [['Primary Market / City', 'Active Listings']],
            body: cityData,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
        });

        // 5. Price Tier Analysis
        doc.addPage();
        doc.setFontSize(18);
        doc.text('4. Price Segment Analysis', 20, 30);
        
        const priceData = (data.priceTiers || []).map(item => [item.name, item.value]);
        currentY = runAutoTable({
            startY: 40,
            head: [['Price Segment', 'Number of Properties']],
            body: priceData,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] }
        });

        // 6. Recent Trends
        currentY += 20;
        doc.setFontSize(18);
        doc.text('5. 6-Month Market Trend', 20, currentY);
        
        const trendData = (data.trend || []).map(item => [item.name, item.listings, `$${(item.revenue || 0).toFixed(1)}k`]);
        runAutoTable({
            startY: currentY + 10,
            head: [['Month', 'New Listings', 'Sales Revenue']],
            body: trendData,
            theme: 'striped',
            headStyles: { fillColor: [236, 72, 153] }
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(
                `Proprietary Market Data - RealEstate Pro Dashboard - Page ${i} of ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        const fileName = `Market_Report_${date.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        console.log('PDF saved successfully:', fileName);

    } catch (error) {
        console.error('Critical Report Generation Error:', error);
        alert('Critical error while creating PDF. Please check the console.');
    }
};
