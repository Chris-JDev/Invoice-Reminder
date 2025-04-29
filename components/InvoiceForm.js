import React, { useState } from 'react';
import { format } from 'date-fns';

function InvoiceForm({ onAddInvoice }) {
  const [formData, setFormData] = useState({
    clientName: '',
    invoiceNumber: '',
    amount: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
    paid: false
  });
  
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.clientName || !formData.invoiceNumber || !formData.amount || 
        !formData.issueDate || !formData.dueDate) {
      alert('Please fill in all fields');
      return;
    }
    
    onAddInvoice({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    
    // Reset form
    setFormData({
      clientName: '',
      invoiceNumber: '',
      amount: '',
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
      paid: false
    });
    
    setShowForm(false);
  };

  return (
    <div className="invoice-form-container">
      {!showForm ? (
        <button 
          className="add-invoice-btn" 
          onClick={() => setShowForm(true)}
        >
          Add New Invoice
        </button>
      ) : (
        <form className="invoice-form" onSubmit={handleSubmit}>
          <h2>Add New Invoice</h2>
          
          <div className="form-group">
            <label htmlFor="clientName">Client Name</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Client name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="invoiceNumber">Invoice Number</label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-001"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issueDate">Issue Date</label>
              <input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">Save Invoice</button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default InvoiceForm;