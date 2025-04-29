import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });

  // Load invoices from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({
      ...newInvoice,
      [name]: value
    });
  };

  // Add new invoice
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newInvoice.client || !newInvoice.amount || !newInvoice.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const invoice = {
      ...newInvoice,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    setInvoices([...invoices, invoice]);
    
    // Reset form
    setNewInvoice({
      client: '',
      amount: '',
      dueDate: '',
      description: '',
      status: 'pending'
    });
  };

  // Mark invoice as paid
  const markAsPaid = (id) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { ...invoice, status: 'paid' } : invoice
    ));
  };

  // Delete invoice
  const deleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    }
  };

  // Calculate days remaining until due
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Send reminder (simulated)
  const sendReminder = (invoice) => {
    alert(`Reminder email sent to ${invoice.client} for invoice of $${invoice.amount}`);
    // In a real app, you would call an API to send an email here
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Invoice Reminder</h1>
      </header>

      <main className="app-main">
        <section className="invoice-form-container">
          <h2>Add New Invoice</h2>
          <form onSubmit={handleSubmit} className="invoice-form">
            <div className="form-group">
              <label htmlFor="client">Client*</label>
              <input
                type="text"
                id="client"
                name="client"
                value={newInvoice.client}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount ($)*</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newInvoice.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date*</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newInvoice.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newInvoice.description}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="btn-submit">Add Invoice</button>
          </form>
        </section>

        <section className="invoices-container">
          <h2>Invoices</h2>
          {invoices.length === 0 ? (
            <p className="no-invoices">No invoices yet. Add one above!</p>
          ) : (
            <div className="invoice-list">
              {invoices.map(invoice => {
                const daysRemaining = getDaysRemaining(invoice.dueDate);
                const isPastDue = daysRemaining < 0;
                const isDueSoon = daysRemaining >= 0 && daysRemaining <= 7;
                
                return (
                  <div 
                    key={invoice.id} 
                    className={`invoice-card ${invoice.status === 'paid' ? 'paid' : ''} 
                              ${isPastDue && invoice.status !== 'paid' ? 'past-due' : ''} 
                              ${isDueSoon && invoice.status !== 'paid' ? 'due-soon' : ''}`}
                  >
                    <div className="invoice-header">
                      <h3>{invoice.client}</h3>
                      <span className={`status ${invoice.status}`}>
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="invoice-body">
                      <p className="amount">${parseFloat(invoice.amount).toFixed(2)}</p>
                      <p className="due-date">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        {invoice.status !== 'paid' && (
                          <span className={`days-remaining ${isPastDue ? 'past-due' : isDueSoon ? 'due-soon' : ''}`}>
                            {isPastDue 
                              ? `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue` 
                              : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
                          </span>
                        )}
                      </p>
                      {invoice.description && (
                        <p className="description">{invoice.description}</p>
                      )}
                    </div>
                    
                    <div className="invoice-actions">
                      {invoice.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => markAsPaid(invoice.id)}
                            className="btn-mark-paid"
                          >
                            Mark as Paid
                          </button>
                          <button 
                            onClick={() => sendReminder(invoice)}
                            className="btn-reminder"
                          >
                            Send Reminder
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteInvoice(invoice.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
