import re
import nltk
from nltk.tokenize import sent_tokenize

nltk.download('punkt')

def analyze_contract(text):
    risk_score = 0
    risky_keywords = [
        "terminate", "penalty", "breach", "undefined", "ambiguous", "fee",
        "obligation", "delay", "fraud", "default", "litigation", "liability",
        "dispute", "arbitration", "liquidation", "non-disclosure"
    ]

    sentences = sent_tokenize(text)
    
    for sentence in sentences:
        for word in risky_keywords:
            if re.search(rf"\b{word}\b", sentence, re.IGNORECASE):
                risk_score += 1
    
    return min(risk_score, 10)

if __name__ == "__main__":
    sample_contract = "This contract includes an arbitration clause with penalties."
    score = analyze_contract(sample_contract)
    print(f"Risk Score: {score}")
