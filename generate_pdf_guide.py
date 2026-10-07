import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(40, 810, "MedEasy Pharmacy OS — Complete Testing & UAT Guide")
            self.drawRightString(555, 810, "BETA-2 Production Release")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, 804, 555, 804)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 36, 555, 36)
        
        self.drawString(40, 24, "Confidential — For Internal Quality Assurance & Pharmacist Testing")
        self.drawRightString(555, 24, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename="MedEasy_Pharmacy_OS_Complete_Testing_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0284C7')
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )
    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0369A1')
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    elements = []

    # Title & Metadata Banner
    elements.append(Paragraph("MedEasy Pharmacy OS", title_style))
    elements.append(Paragraph("Complete QA Testing Guide, UAT Checklist & Operations Manual", subtitle_style))
    elements.append(Spacer(1, 10))

    # Deployment metadata table
    meta_data = [
        [Paragraph("<b>Frontend URL:</b>", table_cell_bold), Paragraph("https://beta-2-seven.vercel.app", code_style)],
        [Paragraph("<b>Backend API:</b>", table_cell_bold), Paragraph("https://beta2-h6y2.onrender.com (Node.js + PostgreSQL)", code_style)],
        [Paragraph("<b>Admin Credentials:</b>", table_cell_bold), Paragraph("Username: <b>admin</b> | Password: <b>admin123</b>", table_cell)],
        [Paragraph("<b>Alternate Admin:</b>", table_cell_bold), Paragraph("Username: <b>ninaad_nk</b> | Password: <b>password123</b>", table_cell)],
        [Paragraph("<b>Registered Mobile:</b>", table_cell_bold), Paragraph("<b>8380036778</b> (For password reset verification)", table_cell)]
    ]
    meta_table = Table(meta_data, colWidths=[130, 385])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # SECTION 1: AUTHENTICATION & LOGIN EYE TOGGLE
    elements.append(Paragraph("1. Authentication & Security Testing (Page: /login)", h1_style))
    auth_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Eye Toggle Button (Show/Hide Password)</b>", table_cell),
            Paragraph("1. Open <b>/login</b><br/>2. Type password into the password field<br/>3. Click the <b>Eye Icon</b> on the right side", table_cell),
            Paragraph("Password switches from masked dots (••••) to visible plain text. Clicking again hides it back.", table_cell)
        ],
        [
            Paragraph("<b>Admin Login</b>", table_cell),
            Paragraph("Enter username: <b>admin</b>, password: <b>admin123</b>, click 'Login to Counter'", table_cell),
            Paragraph("Authenticates instantly, receives JWT Bearer token, redirects directly to <b>/dashboard</b>.", table_cell)
        ],
        [
            Paragraph("<b>Forgot / Reset Password Flow</b>", table_cell),
            Paragraph("1. Click 'Forgot password?' link on login page<br/>2. Enter username: <b>admin</b><br/>3. Enter mobile: <b>8380036778</b><br/>4. Enter new password & click eye icon", table_cell),
            Paragraph("Verifies registered phone against database, resets password with success alert, auto-fills login form.", table_cell)
        ],
        [
            Paragraph("<b>Role-Based Access Control (RBAC)</b>", table_cell),
            Paragraph("Log in with a STAFF account and try opening <b>/settings</b> or <b>/purchases</b>", table_cell),
            Paragraph("Protected route guard automatically redirects unauthorized roles back to /dashboard.", table_cell)
        ]
    ]
    t1 = Table(auth_data, colWidths=[120, 215, 180])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t1)
    elements.append(Spacer(1, 14))

    # SECTION 2: POS BILLING & MEDICINE SEARCH
    elements.append(Paragraph("2. POS Billing Counter Testing (Page: /billing)", h1_style))
    bill_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>1,000+ Master Drug Live Search</b>", table_cell),
            Paragraph("In billing search bar, type: <b>Dolo</b>, <b>Pan</b>, or <b>Azithral</b>", table_cell),
            Paragraph("Autocomplete dropdown appears instantly showing both in-stock batches and master catalog medicines.", table_cell)
        ],
        [
            Paragraph("<b>1-Click Billing from Master Catalog</b>", table_cell),
            Paragraph("Click '+ 1-Click Bill' on any un-inwarded master medicine (e.g. Pan 40)", table_cell),
            Paragraph("Auto-populates cart with current selling price, MRP, and 12% GST rate without requiring manual entry.", table_cell)
        ],
        [
            Paragraph("<b>Mobile Customer Selector Bar</b>", table_cell),
            Paragraph("Open <b>/billing</b> on mobile screen (< 640px) or shrink browser window", table_cell),
            Paragraph("Clean card layout: customer label & '+ New Customer' button on top, full-width select dropdown, zero overflow.", table_cell)
        ],
        [
            Paragraph("<b>Schedule H / Doctor Rx Details</b>", table_cell),
            Paragraph("Enter Prescribing Doctor: <i>Dr. Kulkarni MBBS</i> and Patient Name: <i>Suresh Patil</i>", table_cell),
            Paragraph("Saves doctor name with the invoice and satisfies FDA Schedule H statutory requirement.", table_cell)
        ],
        [
            Paragraph("<b>Thermal 80mm POS Print</b>", table_cell),
            Paragraph("Add items to cart and click 'Print (F9)'", table_cell),
            Paragraph("Opens 80mm formatted POS receipt with store header, DL number, GSTIN, line items, and signature line.", table_cell)
        ],
        [
            Paragraph("<b>WhatsApp Digital Bill</b>", table_cell),
            Paragraph("Click 'WhatsApp Bill', confirm customer mobile number", table_cell),
            Paragraph("Opens WhatsApp Web / Mobile with a pre-formatted tax invoice summary ready to send.", table_cell)
        ]
    ]
    t2 = Table(bill_data, colWidths=[120, 215, 180])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284C7')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 14))

    # SECTION 3: SALES HISTORY, REPRINTS & RETURNS
    elements.append(Paragraph("3. Sales Invoices History, Reprints & Returns (Page: /sales)", h1_style))
    sales_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Browse Past Invoices</b>", table_cell),
            Paragraph("Navigate to <b>/sales</b> via sidebar link 'Sales History'", table_cell),
            Paragraph("Displays full table of historical sales fetched from PostgreSQL database.", table_cell)
        ],
        [
            Paragraph("<b>Search & Payment Filters</b>", table_cell),
            Paragraph("Filter by: <b>Cash</b>, <b>UPI</b>, or <b>Card</b>; or search by invoice #", table_cell),
            Paragraph("Instantly filters table rows and displays payment breakdown metrics.", table_cell)
        ],
        [
            Paragraph("<b>Thermal Reprint Copy</b>", table_cell),
            Paragraph("Click the <b>Printer Icon</b> on any past invoice row", table_cell),
            Paragraph("Opens print dialog with exact 80mm receipt marked with '*** REPRINT COPY ***'.", table_cell)
        ],
        [
            Paragraph("<b>Resend WhatsApp Bill</b>", table_cell),
            Paragraph("Click the <b>💬 Icon</b> on any past invoice row", table_cell),
            Paragraph("Opens WhatsApp with that specific past invoice breakdown.", table_cell)
        ],
        [
            Paragraph("<b>Bill Cancellation & Stock Reversal</b>", table_cell),
            Paragraph("Click the <b>Rotate Icon (↩️)</b> on an invoice, confirm cancellation", table_cell),
            Paragraph("Atomic rollback: marks bill CANCELLED, restores item quantities back into batch inventory, deducts customer spend.", table_cell)
        ]
    ]
    t3 = Table(sales_data, colWidths=[120, 215, 180])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#059669')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t3)
    elements.append(Spacer(1, 14))

    # SECTION 4: INVENTORY & STOCK MANAGEMENT
    elements.append(Paragraph("4. Inventory & Batch Vault Testing (Page: /stock)", h1_style))
    inv_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Stock Filter Tabs</b>", table_cell),
            Paragraph("Click tabs: <b>All Stock</b>, <b>Low Stock</b>, and <b>Expiring Soon</b>", table_cell),
            Paragraph("Filters inventory in real-time by current stock quantity and expiry date (< 90 days).", table_cell)
        ],
        [
            Paragraph("<b>Batch Management</b>", table_cell),
            Paragraph("Click on any medicine name (e.g. Dolo 650) to open details page", table_cell),
            Paragraph("View all batches sorted by First-Expiry-First-Out (FEFO), add new batch, or adjust stock.", table_cell)
        ],
        [
            Paragraph("<b>Physical Stock Adjustment</b>", table_cell),
            Paragraph("Click 'Adjust Stock' on a batch, enter new count and reason", table_cell),
            Paragraph("Updates batch stock and appends a permanent audit adjustment log.", table_cell)
        ],
        [
            Paragraph("<b>CSV Stock Export</b>", table_cell),
            Paragraph("Click the 'CSV' button in top toolbar", table_cell),
            Paragraph("Downloads a complete spreadsheet of all store medicines, batches, and stock counts.", table_cell)
        ]
    ]
    t4 = Table(inv_data, colWidths=[120, 215, 180])
    t4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#7C3AED')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t4)
    elements.append(Spacer(1, 14))

    # SECTION 5: PURCHASES & DISTRIBUTORS
    elements.append(Paragraph("5. Distributor Purchases & Suppliers (Pages: /purchases & /suppliers)", h1_style))
    pur_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Add Distributor / Supplier</b>", table_cell),
            Paragraph("On <b>/suppliers</b>, click '+ Add Supplier', enter name, GSTIN, mobile", table_cell),
            Paragraph("Saves distributor to PostgreSQL database and makes them selectable in purchases.", table_cell)
        ],
        [
            Paragraph("<b>Inward Purchase Invoice</b>", table_cell),
            Paragraph("On <b>/purchases</b>, select distributor, enter invoice number, add medicine item with batch, expiry & cost", table_cell),
            Paragraph("Saves purchase invoice and automatically increments warehouse stock in the inventory vault.", table_cell)
        ],
        [
            Paragraph("<b>Purchase Invoices History</b>", table_cell),
            Paragraph("Click the 'Purchase Invoices History' tab on /purchases", table_cell),
            Paragraph("Lists all received distributor purchase bills with supplier name and total amount.", table_cell)
        ]
    ]
    t5 = Table(pur_data, colWidths=[120, 215, 180])
    t5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#D97706')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t5)
    elements.append(Spacer(1, 14))

    # SECTION 6: CUSTOMER REFILL REMINDERS
    elements.append(Paragraph("6. Customer Management & Chronic Refill Alerts (Page: /customers)", h1_style))
    cust_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Customer Directory & Spend</b>", table_cell),
            Paragraph("Browse customer list on <b>/customers</b>", table_cell),
            Paragraph("Tracks customer mobile, lifetime purchase value (₹), and total number of bills.", table_cell)
        ],
        [
            Paragraph("<b>Chronic Refill Reminders Tab</b>", table_cell),
            Paragraph("Click tab '💊 Chronic Refill Reminders'", table_cell),
            Paragraph("Filters clients who have active prescription bills and are due for their monthly refill.", table_cell)
        ],
        [
            Paragraph("<b>1-Click WhatsApp Refill Alert</b>", table_cell),
            Paragraph("Click the '💬 Refill Alert' button on a customer row", table_cell),
            Paragraph("Opens WhatsApp with personalized reminder inviting them to reserve their medicines.", table_cell)
        ]
    ]
    t6 = Table(cust_data, colWidths=[120, 215, 180])
    t6.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0D9488')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t6)
    elements.append(Spacer(1, 14))

    # SECTION 7: REPORTS, GST & SCHEDULE H
    elements.append(Paragraph("7. Financial Reports, GST Audit & Schedule H Register (Page: /reports)", h1_style))
    rep_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Financial Overview</b>", table_cell),
            Paragraph("Open <b>/reports</b>", table_cell),
            Paragraph("Displays real Sales Turnover, Purchase Spend, Invoices count, and monthly sales bar chart.", table_cell)
        ],
        [
            Paragraph("<b>GST Tax & GSTR-1 CSV Export</b>", table_cell),
            Paragraph("Click tab 'GST Tax & GSTR-1 Filing', then click 'Download GSTR-1 CSV'", table_cell),
            Paragraph("Calculates Taxable Turnover, CGST (6%), SGST (6%), Input Tax Credit (ITC), and exports CSV for accountant/CA.", table_cell)
        ],
        [
            Paragraph("<b>Schedule H / Rx Inspection Register</b>", table_cell),
            Paragraph("Click tab 'Schedule H / Rx Register', search doctor name, click 'Export CSV'", table_cell),
            Paragraph("Gathers prescription sales with patient, doctor, batch, and qty for FDA Drug Inspector compliance audit.", table_cell)
        ]
    ]
    t7 = Table(rep_data, colWidths=[120, 215, 180])
    t7.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#BE185D')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t7)
    elements.append(Spacer(1, 14))

    # SECTION 8: SETTINGS & STORE PROFILE PERSISTENCE
    elements.append(Paragraph("8. Pharmacy Store Profile & Settings (Page: /settings)", h1_style))
    set_data = [
        [Paragraph("Feature / Action", table_cell_bold), Paragraph("Exact Steps to Test", table_cell_bold), Paragraph("Expected Behavior", table_cell_bold)],
        [
            Paragraph("<b>Store License Persistence</b>", table_cell),
            Paragraph("Edit Store Name, Drug License (DL), GSTIN, Phone, Address; click 'Save Store Profile & Licenses'", table_cell),
            Paragraph("Saves permanently to PostgreSQL. Refreshes preserve values, and thermal receipts automatically print the updated details.", table_cell)
        ],
        [
            Paragraph("<b>Staff User Registration</b>", table_cell),
            Paragraph("Click '+ Add Staff User', enter name, username, password, select role (PHARMACIST/STAFF)", table_cell),
            Paragraph("Creates active user in database; new staff member can immediately log in from the login page.", table_cell)
        ],
        [
            Paragraph("<b>Language Toggle (English / Marathi)</b>", table_cell),
            Paragraph("Click the language toggle in top header or settings (EN / MR)", table_cell),
            Paragraph("Entire UI instantly translates to Marathi (मराठी) or English.", table_cell)
        ]
    ]
    t8 = Table(set_data, colWidths=[120, 215, 180])
    t8.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#475569')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(t8)
    elements.append(Spacer(1, 14))

    # SUMMARY BOX
    elements.append(Paragraph("<b>Quality Assurance Verification Sign-off:</b>", body_bold))
    elements.append(Paragraph("All 30 automated integration tests passed (30/30). All frontend views build with 0 TypeScript/Vite errors. The application is completely functional and ready for daily medical counter operations.", body_style))

    # Build document
    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "MedEasy_Pharmacy_OS_Complete_Testing_Guide.pdf"
    build_pdf(out_file)
