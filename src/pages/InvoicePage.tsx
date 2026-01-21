import React from 'react';
import InvoiceForm from '@/components/invoice/InvoiceForm';

const InvoicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceForm />
    </div>
  );
};

export default InvoicePage;
