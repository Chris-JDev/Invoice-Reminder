// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InvoiceManager
 * @dev Blockchain invoice system with automated reminders and dispute resolution
 * Features:
 * - Create invoices with due dates
 * - Payment tracking with statuses (Pending/Paid/Overdue/Disputed)
 * - Automated overdue marking
 * - Reminder counter with blockchain audit trail
 * - Dispute resolution system
 * - Early payment discount support
 */
contract InvoiceManager {
    enum InvoiceStatus { PENDING, PAID, OVERDUE, DISPUTED }
    
    struct Invoice {
        string invoiceNumber;
        address issuer;
        address recipient;
        uint256 amount;
        uint256 issueDate;
        uint256 dueDate;
        InvoiceStatus status;
        uint256 reminderCount;
        bool earlyDiscountUsed;
        string description;
    }

    mapping(string => Invoice) public invoices;
    mapping(address => string[]) public userInvoices;
    
    // Security features
    modifier onlyIssuer(string memory invoiceNumber) {
        require(invoices[invoiceNumber].issuer == msg.sender, "Not invoice issuer");
        _;
    }
    
    modifier validRecipient(string memory invoiceNumber) {
        require(invoices[invoiceNumber].recipient == msg.sender, "Not invoice recipient");
        _;
    }

    event InvoiceCreated(
        string indexed invoiceNumber,
        address indexed issuer,
        address recipient,
        uint256 amount,
        uint256 dueDate
    );
    
    event PaymentReceived(
        string indexed invoiceNumber,
        address payer,
        uint256 amount
    );
    
    event ReminderSent(
        string indexed invoiceNumber,
        uint256 reminderCount
    );
    
    event InvoiceDisputed(
        string indexed invoiceNumber,
        address disputer,
        string reason
    );

    /**
     * @dev Create new invoice with blockchain timestamp
     */
    function createInvoice(
        string memory _invoiceNumber,
        address _recipient,
        uint256 _amount,
        uint256 _dueDate,
        string memory _description
    ) external {
        require(_dueDate > block.timestamp, "Due date must be in future");
        
        invoices[_invoiceNumber] = Invoice({
            invoiceNumber: _invoiceNumber,
            issuer: msg.sender,
            recipient: _recipient,
            amount: _amount,
            issueDate: block.timestamp,
            dueDate: _dueDate,
            status: InvoiceStatus.PENDING,
            reminderCount: 0,
            earlyDiscountUsed: false,
            description: _description
        });
        
        userInvoices[msg.sender].push(_invoiceNumber);
        emit InvoiceCreated(_invoiceNumber, msg.sender, _recipient, _amount, _dueDate);
    }

    /**
     * @dev Make payment for invoice
     */
    function payInvoice(string memory _invoiceNumber) external payable validRecipient(_invoiceNumber) {
        Invoice storage invoice = invoices[_invoiceNumber];
        
        require(invoice.status == InvoiceStatus.PENDING || invoice.status == InvoiceStatus.OVERDUE,
            "Invoice not payable");
        require(msg.value >= invoice.amount, "Insufficient payment");
        
        // Handle early payment discount (5% if paid 3+ days early)
        if(block.timestamp < invoice.dueDate - 3 days && !invoice.earlyDiscountUsed) {
            uint256 discount = invoice.amount * 5 / 100;
            payable(msg.sender).transfer(discount);
            invoice.earlyDiscountUsed = true;
        }
        
        invoice.status = InvoiceStatus.PAID;
        payable(invoice.issuer).transfer(msg.value);
        emit PaymentReceived(_invoiceNumber, msg.sender, msg.value);
    }

    /**
     * @dev Mark invoice as overdue (automated or manual)
     */
    function markOverdue(string memory _invoiceNumber) external onlyIssuer(_invoiceNumber) {
        Invoice storage invoice = invoices[_invoiceNumber];
        require(block.timestamp > invoice.dueDate, "Due date not passed");
        require(invoice.status == InvoiceStatus.PENDING, "Invalid status for overdue");
        
        invoice.status = InvoiceStatus.OVERDUE;
    }

    /**
     * @dev Send reminder and increment counter
     */
    function sendReminder(string memory _invoiceNumber) external onlyIssuer(_invoiceNumber) {
        Invoice storage invoice = invoices[_invoiceNumber];
        require(invoice.status != InvoiceStatus.PAID, "Invoice already paid");
        
        invoice.reminderCount += 1;
        emit ReminderSent(_invoiceNumber, invoice.reminderCount);
    }

    /**
     * @dev Initiate dispute process
     */
    function disputeInvoice(string memory _invoiceNumber, string memory _reason) external validRecipient(_invoiceNumber) {
        Invoice storage invoice = invoices[_invoiceNumber];
        require(invoice.status == InvoiceStatus.PENDING || invoice.status == InvoiceStatus.OVERDUE,
            "Cannot dispute paid invoice");
        
        invoice.status = InvoiceStatus.DISPUTED;
        emit InvoiceDisputed(_invoiceNumber, msg.sender, _reason);
    }

    /**
     * @dev Get invoice details for frontend
     */
    function getInvoice(string memory _invoiceNumber) external view returns (
        string memory,
        address,
        address,
        uint256,
        uint256,
        uint256,
        InvoiceStatus,
        uint256,
        bool,
        string memory
    ) {
        Invoice storage invoice = invoices[_invoiceNumber];
        return (
            invoice.invoiceNumber,
            invoice.issuer,
            invoice.recipient,
            invoice.amount,
            invoice.issueDate,
            invoice.dueDate,
            invoice.status,
            invoice.reminderCount,
            invoice.earlyDiscountUsed,
            invoice.description
        );
    }
}
