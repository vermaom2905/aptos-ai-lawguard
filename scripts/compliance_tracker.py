import requests

def check_compliance():
    """
    Fetch latest compliance rules from real Web3 legal sources.
    """
    sources = [
        "https://api.web3legaldata.com/latest_compliance",
        "https://blockchainregulations.com/api/compliance"
    ]
    
    compliance_data = {}
    for source in sources:
        try:
            response = requests.get(source)
            if response.status_code == 200:
                compliance_data[source] = response.json()
                print(f"✅ Fetched compliance data from {source}")
            else:
                print(f"❌ Failed to fetch compliance data from {source} (Status: {response.status_code})")
        except Exception as e:
            print(f"⚠️ Error fetching from {source}: {e}")

    return compliance_data

if __name__ == "__main__":
    data = check_compliance()
    print("📜 Compliance Data:", data)