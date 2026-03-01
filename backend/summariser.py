import sys
import json
from transformers import pipeline

# Load once (important for performance)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def main():
    input_data = sys.stdin.read()
    comments = json.loads(input_data)


    combined_text = " ".join(comments)

    if len(combined_text) < 50:
        print("Not enough detailed feedback to summarize.")
        return

    result = summarizer(
        combined_text[:1024],  # BART token limit safety
        max_length=120,
        min_length=40,
        do_sample=False
    )

    print(result[0]['summary_text'])

if __name__ == "__main__":
    main()