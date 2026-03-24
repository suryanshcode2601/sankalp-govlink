import requests
import os

API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
headers = {"Authorization": f"Bearer {os.environ.get('HF_TOKEN')}"}

labels = [
    "Roads", "Electricity", "Water",
    "Safety", "Healthcare", "Infrastructure"
]

URGENCY_LEVELS = [
    "life threatening emergency requiring immediate action",
    "serious issue causing significant public harm",
    "moderate issue affecting daily life",
    "minor inconvenience with low impact",
]
URGENCY_WEIGHTS = [100, 75, 40, 10]

def _zero_shot(text: str, candidate_labels: list, multi_label: bool = False) -> dict:
    payload = {
        "inputs": text,
        "parameters": {
            "candidate_labels": candidate_labels,
            "multi_label": multi_label
        }
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

def classify_issue(text: str) -> str:
    result = _zero_shot(text, labels)
    return result["labels"][0]

def calculate_urgency(text: str) -> int:
    result = _zero_shot(text, URGENCY_LEVELS, multi_label=False)
    label_to_weight = dict(zip(URGENCY_LEVELS, URGENCY_WEIGHTS))
    score = sum(
        result["scores"][i] * label_to_weight[result["labels"][i]]
        for i in range(len(result["labels"]))
    )
    return round(score)

def classify_with_confidence(text: str) -> dict:
    result = _zero_shot(text, labels)
    return {
        "type": result["labels"][0],
        "confidence": result["scores"][0]
    }
