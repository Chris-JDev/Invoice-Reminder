import React, { useState, useEffect } from 'react';
import './App.css';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import { format } from 'date-fns';

function App() {
  const [invoices, setInvoices] = useState(() => {
    const savedInvoices = localStorage.getItem('invoices');
    return savedInvoices ? JSON.parse(savedInvoices) : [];
  });

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  const addInvoice = (invoice) => {
    setInvoices([...invoices, { ...invoice, id: Date.now().toString() }]);
  };

  const deleteInvoice = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  const markAsPaid = (id) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { ...invoice, paid: true, paidDate: format(new Date(), 'yyyy-MM-dd') } : invoice
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Invoice Reminder</h1>
      </header>
      <main>
        <InvoiceForm onAddInvoice={addInvoice} />
        <InvoiceList 
          invoices={invoices} 
          onDelete={deleteInvoice} 
          onMarkPaid={markAsPaid}
        />
      </main>
    </div>
  );
}

export default App;