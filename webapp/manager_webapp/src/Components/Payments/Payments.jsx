import React from "react";
import { useNavigate } from "react-router-dom";
import "./Payments.css";

const Payments = () => {
  const navigate = useNavigate();

  // Example payment data
  const payments = [
    {
      id: 1,
      transactionId: "TXN12345",
      amount: 15.0,
      timestamp: "2023-10-01 14:30:00",
      status: "Completed",
    },
    {
      id: 2,
      transactionId: "TXN12346",
      amount: 10.0,
      timestamp: "2023-10-02 09:15:00",
      status: "Pending",
    },
    {
      id: 3,
      transactionId: "TXN12347",
      amount: 20.0,
      timestamp: "2023-10-03 16:45:00",
      status: "Completed",
    },
  ];

  return (
    <div className="payments-container">
      <h1 className="payments-title">Payments</h1>
      <p className="payments-description">
        View and manage payment details for transactions within the system.
      </p>
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.transactionId}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>{payment.timestamp}</td>
                <td>
                  <span
                    className={`payment-status ${
                      payment.status === "Completed" ? "completed" : "pending"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="payment-action-cell">
                  <button
                    className="payment-action-button"
                    onClick={() => navigate(`/payment-details/${payment.id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;