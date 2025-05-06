import { saveAs } from "file-saver";

export const exportToCSV = (transactions, filename = "transactions.csv") => {
  if (!transactions || transactions.length === 0) {
    alert("No transactions to download.");
    return;
  }

  const headers = [
    "Transaction ID",
    "Type",
    "Details",
    "Date",
    "Time",
    "Amount",
    "Status",
  ];

  const rows = transactions.map((txn) => {
    const dateObj = new Date(txn.timestamp);
    const date = dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const detail =
      txn.metadata?.to
        ? `To: ${txn.metadata.to}`
        : txn.metadata?.from
        ? `From: ${txn.metadata.from}`
        : txn.metadata?.mobileNumber
        ? `Mobile: ${txn.metadata.mobileNumber}`
        : txn.metadata?.channel || "-";

    return [
      txn.referenceId,
      txn.type,
      detail,
      date,
      time.toLowerCase(),
      `₱${txn.amount.toFixed(2)}`,  // ✅ Peso symbol correctly
      txn.type.charAt(0).toUpperCase() + txn.type.slice(1),
    ];
  });

  // Add BOM to fix Excel UTF-8 parsing issues
  const csvContent =
    "\uFEFF" + // <- Add BOM here
    [headers, ...rows]
      .map((e) => e.map((field) => `"${field}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};
