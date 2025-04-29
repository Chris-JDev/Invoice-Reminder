import React from 'react';
import { format, isPast, addDays, parseISO } from 'date-fns';

function InvoiceList({ invoices, onDelete, onMarkPaid }) {
  // Sort invoices by due date - upcoming first, then overdue
  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = parseISO(a.dueDate);
    const dateB = parseISO(b.dueDate);
    
    // Put paid invoices at the bottom
    if (a.paid && !b.paid) return 1;
    if (!a.paid && b.paid) return -1;
    
    // Then sort by due date
    return dateA - dateB;
  });
  
  // Calculate days until due or days overdue
  const getDueDateInfo = (dueDate) => {
    const today = new Date();
    const due = parseISO(dueDate);
    
    if (isPast(due)) {
      return {
        text: `Overdue by ${Math.floor((today - due) / (1000 * 60 * 60 * 24))} days`,
        className: 'overdue'
      };
    } else {
      return {
        text: `Due in ${Math.floor((due - today) / (1000 * 60 * 60 * 24))} days`,
        className: 'upcoming'
      };
    }
  };

  // Group invoices by status
  const overdueInvoices = sortedInvoices.filter(invoice => !invoice.paid && isPast(parseISO(invoice.dueDate)));
  const upcomingInvoices = sortedInvoices.filter(invoice => !invoice.paid && !isPast(parseISO(invoice.dueDate)));
  const paidInvoices = sortedInvoices.filter(invoice => invoice.paid);

  return (
    <div className="invoice-list">
      <h2>Your Invoices</h2>
      
      {overdueInvoices.length > 0 && (
        <div className="invoice-group">
          <h3>Overdue</h3>
          {overdueInvoices.map(invoice => {
            const dueDateInfo = getDueDateInfo(invoice.dueDate);
            return (
              <div key={invoice.id} className={`invoice ${dueDateInfo.className}`}>
                <div className="invoice-header">
                  <strong>{invoice.clientName}</strong>
                  <span className="invoice-amount">${invoice.amount.toFixed(2)}</span>
                </div>
                <div className="invoice-details">
                  <div>Invoice #{invoice.invoiceNumber}</div>
                  <div>Issue date: {format(parseISO(invoice.issueDate), 'MMM d, yyyy')}</div>
                  <div>Due date: {format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</div>
                  <div className="due-info overdue">{dueDateInfo.text}</div>
                </div>
                <div className="invoice-actions">
                  <button onClick={() => onMarkPaid(invoice.id)} className="btn-paid">Mark as Paid</button>
                  <button onClick={() => onDelete(invoice.id)} className="btn-delete">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {upcomingInvoices.length > 0 && (
        <div className="invoice-group">
          <h3>Upcoming</h3>
          {upcomingInvoices.map(invoice => {
            const dueDateInfo = getDueDateInfo(invoice.dueDate);
            return (
              <div key={invoice.id} className={`invoice ${dueDateInfo.className}`}>
                <div className="invoice-header">
                  <strong>{invoice.clientName}</strong>
                  <span className="invoice-amount">${invoice.amount.toFixed(2)}</span>
                </div>
                <div className="invoice-details">
                  <div>Invoice #{invoice.invoiceNumber}</div>
                  <div>Issue date: {format(parseISO(invoice.issueDate), 'MMM d, yyyy')}</div>
                  <div>Due date: {format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</div>
                  <div className="due-info upcoming">{dueDateInfo.text}</div>
                </div>
                <div className="invoice-actions">
                  <button onClick={() => onMarkPaid(invoice.id)} className="btn-paid">Mark as Paid</button>
                  <button onClick={() => onDelete(invoice.id)} className="btn-delete">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {paidInvoices.length > 0 && (
        <div className="invoice-group">
          <h3>Paid</h3>
          {paidInvoices.map(invoice => (
            <div key={invoice.id} className="invoice paid">
              <div className="invoice-header">
                <strong>{invoice.clientName}</strong>
                <span className="invoice-amount">${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="invoice-details">
                <div>Invoice #{invoice.invoiceNumber}</div>
                <div>Issue date: {format(parseISO(invoice.issueDate), 'MMM d, yyyy')}</div>
                <div>Due date: {format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</div>
                <div>Paid on: {format(parseISO(invoice.paidDate || new Date()), 'MMM d, yyyy')}</div>
              </div>
              <div className="invoice-actions">
                <button onClick={() => onDelete(invoice.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {invoices.length === 0 && (
        <div className="no-invoices">
          <p>No invoices yet. Add your first invoice above!</p>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;