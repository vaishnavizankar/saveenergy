from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from datetime import datetime, timezone
import os

class ReportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.report_dir = "reports"
        if not os.path.exists(self.report_dir):
            os.makedirs(self.report_dir)

    def generate_sustainability_report(self, title, data, filename):
        file_path = os.path.join(self.report_dir, filename)
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        elements = []

        # Title
        elements.append(Paragraph(f"GreenOps: {title}", self.styles['Title']))
        elements.append(Paragraph(f"Generated on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}", self.styles['Normal']))
        elements.append(Spacer(1, 24))

        # Summary Section
        elements.append(Paragraph("Sustainability Summary", self.styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Cost (Estimated)', f"${data.get('total_cost', 0):.2f}"],
            ['Total CO2 Emissions', f"{data.get('total_carbon', 0):.2f} kg"],
            ['Running Resources', str(data.get('running_count', 0))],
            ['Idle Resources Detected', str(data.get('idle_count', 0))],
        ]
        
        t = Table(summary_data, colWidths=[200, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16A34A")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        elements.append(t)
        elements.append(Spacer(1, 24))

        # Resource Table
        elements.append(Paragraph("Resource Inventory Details", self.styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        resource_rows = [['Resource ID', 'Name', 'Type', 'Cost/h', 'CO2/h']]
        for res in data.get('resources', []):
            resource_rows.append([
                res.resource_id,
                res.name,
                res.type,
                f"${res.cost_per_hour:.4f}",
                f"{res.carbon_emissions:.4f} kg"
            ])
            
        rt = Table(resource_rows, colWidths=[110, 110, 80, 80, 80])
        rt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        elements.append(rt)
        
        # Recommendations
        elements.append(Spacer(1, 24))
        elements.append(Paragraph("Optimization Recommendations", self.styles['Heading2']))
        elements.append(Paragraph("The following actions are recommended to reduce cost and carbon impact:", self.styles['Normal']))
        elements.append(Spacer(1, 12))
        
        recs = data.get('recommendations', [])
        if not recs:
            elements.append(Paragraph("No urgent optimizations detected. System is running efficiently.", self.styles['Italic']))
        else:
            for rec in recs:
                elements.append(Paragraph(f"• {rec.action}: {rec.description} (Potential Savings: ${rec.potential_savings:.2f})", self.styles['Normal']))

        doc.build(elements)
        return file_path

report_service = ReportService()
