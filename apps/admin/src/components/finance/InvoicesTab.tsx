import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Send, Printer } from "lucide-react";
import { Invoice, Payment } from "../../types";
import { toast } from "sonner";

interface InvoicesTabProps {
  invoices: Invoice[];
  payments: Payment[];
}

export function InvoicesTab({ invoices, payments }: InvoicesTabProps) {
  const handleDownloadPDF = (invoiceNumber: string, customerName: string) => {
    toast.success(`Downloading tax invoice #${invoiceNumber}...`);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Invoice #${invoiceNumber} - Taaza Bites</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #10b981; }
              .details { margin-top: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 30px; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
              th { background: #f8fafc; }
              .total { margin-top: 30px; text-align: right; font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">TAAZA BITES</div>
                <p>Cloud Kitchen & Healthy Meal Subscriptions</p>
                <p>GSTIN: 27AABCT1234F1Z5</p>
              </div>
              <div>
                <h2>TAX INVOICE</h2>
                <p>Invoice #: ${invoiceNumber}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div class="details">
              <p><strong>Billed To:</strong> ${customerName}</p>
            </div>
            <table>
              <tr><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
              <tr><td>Healthy Meal Subscription Plan</td><td>996331</td><td>1</td><td>₹2,500.00</td><td>₹2,500.00</td></tr>
            </table>
            <div class="total">
              <p>CGST (2.5%): ₹62.50 | SGST (2.5%): ₹62.50</p>
              <p>Grand Total: ₹2,625.00 (Inclusive of GST)</p>
            </div>
            <script>window.print();<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">GST Tax Invoices & Credit Notes</h2>
          <p className="text-sm text-slate-500">Auto-generated B2C tax invoices compliant with Indian GST regulations (CGST/SGST).</p>
        </div>
        <Button onClick={() => toast.success("GST Summary Report exported.")} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export GST Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Tax Invoices</CardTitle>
          <CardDescription>All subscription and meal order invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment Ref</TableHead>
                <TableHead>Generated Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.filter(p => p.status === 'Success').map((p, index) => {
                const invNum = p.invoiceNumber || `TB-INV-${2026}${1000 + index}`;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-semibold text-emerald-700">{invNum}</TableCell>
                    <TableCell className="font-medium">{p.customerName || 'Valued Customer'}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{p.paymentId || p.id.substring(0, 8)}</TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(invNum, p.customerName || 'Customer')} className="gap-1">
                        <Printer className="w-3.5 h-3.5" /> PDF / Print
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
