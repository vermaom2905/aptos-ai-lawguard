def get_risk_category(score):
    """
    Maps numerical risk scores to refined categories.
    """
    if score == 0:
        return "No Risk"
    elif 1 <= score <= 3:
        return "Low Risk"
    elif 4 <= score <= 6:
        return "Moderate Risk"
    elif 7 <= score <= 8:
        return "High Risk"
    else:
        return "Critical Risk"

if __name__ == "__main__":
    sample_scores = [0, 2, 5, 7, 10]
    for score in sample_scores:
        print(f"Risk Score: {score}, Category: {get_risk_category(score)}")