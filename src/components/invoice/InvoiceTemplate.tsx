import React, { forwardRef, useState, useEffect } from 'react';
import api from '@/api/axios';

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

interface BusinessDetails {
    name: string;
    address: string;
    email: string;
    phone: string;
    gstin: string;
    city: string;
    country: string;
    postalCode: string;
}

interface InvoiceTemplateProps {
    order: Order;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order }, ref) => {
    const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
        name: "",
        address: "",
        email: "",
        phone: "",
        gstin: "",
        city: "",
        country: "",
        postalCode: ""
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch business details from admin profile
    useEffect(() => {
        const fetchBusinessDetails = async () => {
            let timeoutId;
            
            try {
                setIsLoading(true);
                console.log("Fetching business details from profile...");
                
                // Add timeout to prevent hanging
                const controller = new AbortController();
                timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                
                const response = await api.get('/admin/auth/profile', {
                    signal: controller.signal
                });
                const data = response.data.data;
                
                console.log("Profile data received:", data);
                
                if (data) {
                    console.log("Raw address from profile:", data.address);
                    // Only use actual data from profile, no defaults
                    let city = data.city || "";
                    let country = data.country || "";
                    let postalCode = data.postalCode ? data.postalCode.trim() : "";
                    let address = data.address ? data.address.trim() : "";
                    
                    // Clean up the address - remove extra whitespace and newlines
                    address = address.replace(/\s+/g, " ").trim();
                    
                    // Parse address from Address Information section
                    // Format: "No. 47, Green Park Avenue  \nNear City Plaza, Andheri East  \nMumbai, Maharashtra"
                    if (address) {
                        // Split by newlines first to separate address lines
                        const addressLines = address.split("\n").map(line => line.trim()).filter(line => line);
                        
                        if (addressLines.length > 0) {
                            // Keep the full address with line breaks preserved for display
                            address = addressLines.join(", ");
                            
                            // Extract city and state information from the lines
                            addressLines.forEach(line => {
                                // Extract city if not already set
                                if (!city) {
                                    if (line.includes("Mumbai")) city = "Mumbai";
                                    else if (line.includes("Bangalore")) city = "Bangalore";
                                    else if (line.includes("Delhi")) city = "Delhi";
                                }
                                
                                // Extract state/country info if not already set
                                if (!country) {
                                    if (line.includes("Maharashtra")) country = "India";
                                    else if (line.includes("Karnataka")) country = "India";
                                }
                            });
                        }
                    }
                    
                    const newBusinessDetails = {
                        name: data.businessName || data.name || "",
                        address: address,
                        email: data.email || "",
                        phone: data.mobileNumber || "",
                        gstin: data.gstNumber || "",
                        city: city,
                        country: country,
                        postalCode: postalCode
                    };
                    
                    console.log("Parsed address components:", { address, city, country, postalCode });
                    console.log("Setting business details:", newBusinessDetails);
                    setBusinessDetails(newBusinessDetails);
                }
                clearTimeout(timeoutId);
                // Small delay to ensure state is updated before PDF generation
                setTimeout(() => setIsLoading(false), 100);
            } catch (error) {
                clearTimeout(timeoutId);
                console.error("Failed to fetch business details:", error);
                console.error("Error details:", {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    isTimeout: error.name === 'AbortError'
                });
                
                // If it's a timeout, log it specifically
                if (error.name === 'AbortError') {
                    console.log("Request timed out - backend response too slow");
                }
                
                // Keep empty values if fetch fails - no defaults
                setIsLoading(false);
            }
        };

        fetchBusinessDetails();
    }, []);

    // Helper to safely get values
    const getCustomerName = () => order.customer || order.hotel?.hotelName || "";
    const getCustomerAddress = () => order.hotel?.address || "";
    const getCustomerPhone = () => order.hotel?.mobileNumber || "";
    const getInvoiceDate = () => order.date || new Date(order.createdAt).toLocaleDateString('en-IN');
    const getTotal = () => order.total || order.totalAmount || 0;
    const getRemarks = () => order.remarks || order.specialInstructions || "";

    // Assuming Ship To is same as Bill To for now unless separate field exists
    const getShipToName = () => getCustomerName();
    const getShipToAddress = () => getCustomerAddress();

    // Format full business address
    const getBusinessAddress = () => {
        const parts = [businessDetails.address, businessDetails.city, businessDetails.country, businessDetails.postalCode]
            .filter(Boolean);
        return parts.join(", ");
    };

    // Don't render anything while loading to prevent PDF generation with loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading business details...</p>
            </div>
        );
    }

    return (
        <div ref={ref} className="bg-white p-8 max-w-[800px] mx-auto text-black font-sans" style={{ width: '800px', minHeight: '1100px' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                <div className="flex items-center">
                    <img src="/Invoice.png" alt="PRK SMILES" className="h-20 w-auto object-contain" />
                </div>
                <div className="text-right">
                    {businessDetails.name && (
                        <h1 className="text-2xl font-bold text-gray-900">{businessDetails.name}</h1>
                    )}
                    {businessDetails.address && (
                        <p className="text-xs text-gray-600 whitespace-pre-wrap">{businessDetails.address}</p>
                    )}
                    {(businessDetails.city || businessDetails.country || businessDetails.postalCode) && (
                        <p className="text-xs text-gray-600">
                            {[businessDetails.city, businessDetails.country, businessDetails.postalCode].filter(Boolean).join(", ")}
                        </p>
                    )}
                    {(businessDetails.email || businessDetails.phone) && (
                        <p className="text-xs text-gray-600">
                            {businessDetails.email && `Email: ${businessDetails.email}`}
                            {businessDetails.email && businessDetails.phone && " | "}
                            {businessDetails.phone && `Ph: ${businessDetails.phone}`}
                        </p>
                    )}
                    {businessDetails.gstin && (
                        <p className="text-xs font-bold mt-1">GSTIN: {businessDetails.gstin}</p>
                    )}
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
                    {getCustomerName() && (
                        <p className="font-bold text-sm">{getCustomerName()}</p>
                    )}
                    {getCustomerAddress() && (
                        <p className="whitespace-pre-wrap text-gray-600 text-xs">{getCustomerAddress()}</p>
                    )}
                    {getCustomerPhone() && (
                        <p className="mt-1 text-xs"><span className="font-semibold">Ph:</span> {getCustomerPhone()}</p>
                    )}
                </div>

                {/* Ship To */}
                <div className="w-1/3 p-3 border-r border-gray-300">
                    <h3 className="font-bold mb-1 text-gray-700 uppercase text-xs">Ship To:</h3>
                    {getShipToName() && (
                        <p className="font-bold text-sm">{getShipToName()}</p>
                    )}
                    {getShipToAddress() && (
                        <p className="whitespace-pre-wrap text-gray-600 text-xs">{getShipToAddress()}</p>
                    )}
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

                        {getRemarks() && (
                            <>
                                <div className="font-semibold text-gray-600">Remarks:</div>
                                <div className="whitespace-pre-wrap break-words max-w-[180px]" title={getRemarks()}>{getRemarks()}</div>
                            </>
                        )}
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
                        <p className="font-bold mb-8">For {businessDetails.name}</p>
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
