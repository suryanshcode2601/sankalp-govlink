from transformers import pipeline

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

labels = [
    "Roads", "Electricity", "Water",
    "Safety", "Healthcare", "Infrastructure"
]

# Urgency levels with weights
URGENCY_LEVELS = [
    "life threatening emergency requiring immediate action",
    "serious issue causing significant public harm",
    "moderate issue affecting daily life",
    "minor inconvenience with low impact",
]
URGENCY_WEIGHTS = [100, 75, 40, 10]

def classify_issue(text: str) -> str:
    result = classifier(text, labels)
    return result["labels"][0]

def calculate_urgency(text: str) -> int:
    result = classifier(text, URGENCY_LEVELS, multi_label=False)

    # Map each label back to its weight
    label_to_weight = dict(zip(URGENCY_LEVELS, URGENCY_WEIGHTS))

    # Weighted sum using model confidence scores
    score = sum(
        result["scores"][i] * label_to_weight[result["labels"][i]]
        for i in range(len(result["labels"]))
    )

    return round(score)  

def classify_with_confidence(text: str) -> dict:
    result = classifier(text, labels)
    return {
        "type": result["labels"][0],
        "confidence": result["scores"][0]
    }