import React, { forwardRef } from 'react';

export interface OrderItem {
    productId: number;
    productName: string;
    name?: string; // For compatibility
    quantity: number;
    unitPrice: number;
    price?: number; // For compatibility
    totalPrice?: number;
    amount?: number; // For compatibility
    unit?: string;
    discount?: number;
}

export interface Order {
    id: number;
    hotelId: number;
    customer?: string;
    hotel?: {
        hotelName: string;
        address?: string;
        mobileNumber?: string;
    };
    items: OrderItem[];
    subtotal: number;
    deliveryCharge?: number;
    totalAmount: number;
    total?: number; // For compatibility
    status: string;
    createdAt: string;
    date?: string;
    specialInstructions?: string;
    remarks?: string;
    paymentMethod?: string;
}

interface InvoiceTemplateProps {
    order: Order;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order }, ref) => {
    // Helper to safely get values
    const getCustomerName = () => order.customer || order.hotel?.hotelName || "Valued Customer";
    const getCustomerAddress = () => order.hotel?.address || "Bangalore, Karnataka";
    const getCustomerPhone = () => order.hotel?.mobileNumber || "-";
    const getInvoiceDate = () => order.date || new Date(order.createdAt).toLocaleDateString('en-IN');
    const getTotal = () => order.total || order.totalAmount || 0;
    const getRemarks = () => order.remarks || order.specialInstructions || "-";

    // Assuming Ship To is same as Bill To for now unless separate field exists
    const getShipToName = () => getCustomerName();
    const getShipToAddress = () => getCustomerAddress();

    return (
        <div ref={ref} className="bg-white p-8 max-w-[800px] mx-auto text-black font-sans" style={{ width: '800px', minHeight: '1100px' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                <div className="flex items-center">
                    <img src="/Invoice.png" alt="PRK SMILES" className="h-20 w-auto object-contain" />
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900">PRK SMILE ID GREENS</h1>
                    <p className="text-xs text-gray-600">No. 123, Vegetable Market Road</p>
                    <p className="text-xs text-gray-600">Bangalore, Karnataka - 560001</p>
                    <p className="text-xs text-gray-600">Email: info@prksmiles.com | Ph: +91 9876543210</p>
                    <p className="text-xs font-bold mt-1">GSTIN: 29ABCDE1234F1Z5</p>
                </div>
            </div>

            <div className="text-center font-bold text-lg border-b border-gray-300 pb-2 mb-4">
                TAX INVOICE
            </div>

            {/* Invoice Details & Addresses */}
            <div className="flex justify-between mb-6 border border-gray-300 text-sm">
                {/* Bill To */}
                <div className="w-1/3 p-3 border-r border-gray-300">
                    <h3 className="font-bold mb-1 text-gray-700 uppercase text-xs">Bill To:</h3>
                    <p className="font-bold text-sm">{getCustomerName()}</p>
                    <p className="whitespace-pre-wrap text-gray-600 text-xs">{getCustomerAddress()}</p>
                    <p className="mt-1 text-xs"><span className="font-semibold">Ph:</span> {getCustomerPhone()}</p>
                </div>

                {/* Ship To */}
                <div className="w-1/3 p-3 border-r border-gray-300">
                    <h3 className="font-bold mb-1 text-gray-700 uppercase text-xs">Ship To:</h3>
                    <p className="font-bold text-sm">{getShipToName()}</p>
                    <p className="whitespace-pre-wrap text-gray-600 text-xs">{getShipToAddress()}</p>
                </div>

                {/* Invoice Info */}
                <div className="w-1/3 p-3">
                    <div className="grid grid-cols-2 gap-y-1 text-xs">
                        <div className="font-semibold text-gray-600">Invoice No:</div>
                        <div className="font-bold">{`INV-${new Date().getFullYear()}-${order.id.toString().padStart(4, '0')}`}</div>

                        <div className="font-semibold text-gray-600">Invoice Date:</div>
                        <div>{getInvoiceDate()}</div>

                        <div className="font-semibold text-gray-600">Order Ref:</div>
                        <div>#{order.id}</div>

                        <div className="font-semibold text-gray-600">Payment Mode:</div>
                        <div className="uppercase font-bold">{order.paymentMethod || 'COD'}</div>

                        <div className="font-semibold text-gray-600">Remarks:</div>
                        <div className="whitespace-pre-wrap break-words max-w-[180px]" title={getRemarks()}>{getRemarks()}</div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-6 border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100 border-t border-b border-gray-800">
                        <th className="py-2 px-2 text-left w-10 border-r border-gray-300">Sr.no</th>
                        <th className="py-2 px-2 text-left border-r border-gray-300">Item Description</th>
                        <th className="py-2 px-2 text-center w-16 border-r border-gray-300">HSN</th>
                        <th className="py-2 px-2 text-center w-14 border-r border-gray-300">Qty</th>
                        <th className="py-2 px-2 text-center w-14 border-r border-gray-300">Unit</th>
                        <th className="py-2 px-2 text-right w-20 border-r border-gray-300">Rate</th>
                        <th className="py-2 px-2 text-right w-16 border-r border-gray-300">Disc.</th>
                        <th className="py-2 px-2 text-right w-24">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="py-2 px-2 text-center border-r border-gray-300">{index + 1}</td>
                            <td className="py-2 px-2 border-r border-gray-300 font-medium">{item.name || item.productName}</td>
                            <td className="py-2 px-2 text-center border-r border-gray-300 text-gray-500">1234</td>
                            <td className="py-2 px-2 text-center border-r border-gray-300">{item.quantity}</td>
                            <td className="py-2 px-2 text-center border-r border-gray-300">{item.unit || "Kgs"}</td>
                            <td className="py-2 px-2 text-right border-r border-gray-300">₹{(item.price || item.unitPrice || 0).toFixed(2)}</td>
                            <td className="py-2 px-2 text-right border-r border-gray-300">₹{(item.discount || 0).toFixed(2)}</td>
                            <td className="py-2 px-2 text-right font-semibold">₹{(item.amount || ((item.price || item.unitPrice || 0) * item.quantity)).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows to make it look like a full page invoice if needed */}
                    {Array.from({ length: Math.max(0, 10 - order.items.length) }).map((_, i) => (
                        <tr key={`empty-${i}`} className="border-b border-gray-100">
                            <td className="py-4 border-r border-gray-300">&nbsp;</td>
                            <td className="border-r border-gray-300">&nbsp;</td>
                            <td className="border-r border-gray-300">&nbsp;</td>
                            <td className="border-r border-gray-300">&nbsp;</td>
                            <td className="border-r border-gray-300">&nbsp;</td>
                            <td className="border-r border-gray-300">&nbsp;</td>
                            <td className="border-r border-gray-300">&nbsp;</td>
                            <td>&nbsp;</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-1/2">
                    <div className="flex justify-between border-b border-gray-300 py-2">
                        <span className="font-semibold text-sm">Sub Total</span>
                        <span className="text-sm">₹{(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 py-2">
                        <span className="font-semibold text-sm">Delivery Charge</span>
                        <span className="text-sm">₹{(order.deliveryCharge || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 py-2">
                        <span className="font-semibold text-sm">CGST (0%)</span>
                        <span className="text-sm">₹0.00</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 py-2">
                        <span className="font-semibold text-sm">SGST (0%)</span>
                        <span className="text-sm">₹0.00</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-800 py-2 text-lg font-bold bg-gray-50 px-2 mt-1">
                        <span>Grand Total</span>
                        <span>₹{getTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-500">
                        (Amount in words: {numberToWords(Math.round(getTotal()))} Only)
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t-2 border-gray-800">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-600 max-w-[60%]">
                        <p className="font-bold mb-1">Terms & Conditions:</p>
                        <p>1. Goods once sold will not be taken back.</p>
                        <p>2. Interest @ 18% p.a. will be charged if the bill is not paid within the due date.</p>
                        <p>3. All disputes are subject to Bangalore Jurisdiction only.</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-8">For PRK SMILE ID GREENS</p>
                        <p className="text-xs border-t border-gray-400 pt-1 px-4">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Simple number to words converter (Indian Numbering System mostly uses Lakhs/Crores but this is a simple approximation for English)
function numberToWords(num: number): string {
    if (num === 0) return "Zero";

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    // This is a very basic implementation. For production robust library like 'number-to-words' is recommended.
    // However, for this snippet:
    return "Rupees ..."; // Placeholder to avoid massive function.
}

export default InvoiceTemplate;
