"use client";

import { useState } from "react";
import "./App.css";

function App() {
  const [contractText, setContractText] = useState("");
  const [riskScore, setRiskScore] = useState(null);
  const [riskCategory, setRiskCategory] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");

  // Connect Aptos Wallet
  const connectWallet = async () => {
    if (!window.aptos) {
      alert("No Aptos wallet detected! Install Petra Wallet from https://petra.app/");
      return;
    }
    try {
      const response = await window.aptos.connect();
      if (!response.address) throw new Error("Wallet address not received.");
      setWalletAddress(response.address);
      alert(`Wallet connected: ${response.address}`);
    } catch (error) {
      console.error("Wallet connection failed:", error.message);
      alert("Failed to connect to Petra Wallet.");
    }
  };

  // Handle Input Mode Change
  const handleInputModeChange = (event) => {
    const newMode = event.target.value;
    if (newMode !== inputMode) {
      setInputMode(newMode);
      resetForm();
    }
  };

  // Reset form for new upload/input
  const resetForm = () => {
    setContractText("");
    setRiskScore(null);
    setRiskCategory("");
    setSelectedFile(null);
    setAnalyzed(false);
  };

  // Handle text change without resetting analysis
  const handleTextChange = (e) => {
    setContractText(e.target.value);
    if (analyzed) {
      setAnalyzed(false);
      setRiskScore(null);
      setRiskCategory("");
    }
  };

  // File Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    setSelectedFile(file);
    setAnalyzed(false);
    setRiskScore(null);
    setRiskCategory("");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      console.log("Uploading file...");
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error while uploading file.");

      const data = await response.json();
      console.log("Extracted Text:", data.text);
      setContractText(data.text || "No text extracted.");
      alert("File uploaded & text extracted successfully!");
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  // Analyze Contract Risk
  const analyzeContract = async () => {
    if (!contractText) {
      alert("Please enter or upload a contract.");
      return;
    }

    setLoading(true);
    setAnalyzed(true);

    try {
      console.log("Sending contract for analysis...");
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract: contractText }),
      });

      if (!response.ok) throw new Error("Server error while analyzing contract.");

      const data = await response.json();
      console.log("Analysis Result:", data);
      setRiskScore(data.riskScore);
      setRiskCategory(data.riskCategory);
      alert("Contract analysis completed!");
    } catch (error) {
      console.error("Error analyzing contract:", error);
      alert("Error analyzing contract.");
      setAnalyzed(false);
    } finally {
      setLoading(false);
    }
  };

  // Submit Contract to Aptos Blockchain
  const submitContractToAptos = async () => {
    if (!walletAddress) {
        alert("Please connect your Aptos wallet first.");
        return;
    }

    try {
        console.log("🚀 Submitting contract to Aptos blockchain...");
        const encoder = new TextEncoder();
        const contractTextBytes = encoder.encode(contractText);
        const riskCategoryBytes = encoder.encode(riskCategory);

        const transaction = {
            type: "entry_function_payload",
            function: "0x82d32ba2dd39a66c8e860773959ccd93a4eb4dc013ba64c0079128fe886efee2::SmartContract::create_contract",
            type_arguments: [],
            arguments: [Array.from(contractTextBytes), riskScore, Array.from(riskCategoryBytes)],
            gas_unit_price: 100,
            max_gas_amount: 50000,
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        console.log("Transaction submitted:", response);
        setTransactionStatus("Transaction Submitted! Check your Aptos account.");
        alert("Contract submitted successfully to Aptos blockchain!");
    } catch (error) {
        console.error("Transaction failed:", error);
        setTransactionStatus("Transaction Failed!");
        alert("Failed to submit contract to Aptos.");
    }
};
  return (
    <div className={`app-container ${darkMode ? "light-mode" : "dark-mode"}`}>
      <div className="background-effect"></div>

      <div className="content-wrapper">
        <header>
          <div className="logo-area">
            <h1 className="main-title">BlockGuardian</h1>
            <div className="subtitle">Advanced Contract Risk Analysis Platform</div>
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Light" : "Dark"}
            </button>

            <button className="wallet-connect" onClick={connectWallet}>
              {walletAddress ? (
                <span>
                  Connected: <span className="wallet-address">{walletAddress.substring(0, 8)}...</span>
                </span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
        </header>

        <main>
          <div className="input-section">
            <div className="input-selector">
              <label>Input Method:</label>
              <div className="toggle-buttons">
                <button
                  className={`toggle-btn ${inputMode === "manual" ? "active" : ""}`}
                  onClick={() => inputMode !== "manual" && handleInputModeChange({ target: { value: "manual" } })}
                >
                  Manual Input
                </button>
                <button
                  className={`toggle-btn ${inputMode === "file" ? "active" : ""}`}
                  onClick={() => inputMode !== "file" && handleInputModeChange({ target: { value: "file" } })}
                >
                  Upload File
                </button>
              </div>
            </div>

            <div className="input-container">
              {inputMode === "file" ? (
                <div className="file-upload-container">
                  <label htmlFor="file-upload" className="file-upload-label">
                    <span className="upload-icon"></span>
                    <span>Choose a file or drag it here</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  {selectedFile && (
                    <div className="selected-file">
                      <span className="file-name">{selectedFile.name}</span>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="contract-textarea"
                  rows="8"
                  value={contractText}
                  onChange={handleTextChange}
                  placeholder="Type your contract here..."
                />
              )}
            </div>

            <div className="action-buttons">
              <button className="analyze-button" onClick={analyzeContract} disabled={loading || !contractText}>
                {loading ? (
                  <span className="loading-text">
                    <span className="loading-spinner"></span>
                    Processing...
                  </span>
                ) : (
                  <span>Analyze Contract</span>
                )}
              </button>

              {analyzed && (
                <button className="reset-button" onClick={resetForm}>
                  New Analysis
                </button>
              )}

              {analyzed && (
                <button className="submit-button" onClick={submitContractToAptos}>
                  Submit to Aptos Blockchain
                </button>
              )}
            </div>
          </div>

          {riskScore !== null && (
            <div className="result-container">
              <h2 className="result-title">Analysis Results</h2>
              <div className="result-card">
                <div className="result-item">
                  <div className="result-label">Risk Score</div>
                  <div className="result-value">{riskScore}</div>
                </div>
                <div className="result-item">
                  <div className="result-label">Risk Category</div>
                  <div className="result-value">{riskCategory}</div>
                </div>
              </div>
            </div>
          )}

          {transactionStatus && (
            <div className="transaction-status">
              <p>{transactionStatus}</p>
            </div>
          )}
        </main>

        <footer>
          <p>Powered by Aptos Blockchain Technology</p>
        </footer>
      </div>
    </div>
  );
}

export default App;