"""
File Name: backend/summariser.py

Local NLP Summarizer for Lectura Faculty Review System.
Uses only Python standard library — no transformers, no external APIs.
Analyzes full review objects, weighs common themes by frequency,
and generates a human-readable faculty summary paragraph.
"""

import sys
import json
import re
from collections import Counter

# ─── Stop words to ignore when extracting keywords from feedback ───
STOP_WORDS = {
    "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "its",
    "they", "them", "their", "this", "that", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "shall", "should", "may", "might", "can", "could", "a", "an", "the", "and",
    "but", "or", "nor", "not", "so", "if", "of", "at", "by", "for", "with",
    "about", "between", "through", "during", "before", "after", "above", "below",
    "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "no", "only", "own", "same", "than", "too", "very",
    "just", "because", "as", "until", "while", "also", "into", "what", "which",
    "who", "whom", "these", "those", "am", "does", "don", "doesn", "didn",
    "won", "isn", "aren", "wasn", "weren", "hasn", "haven", "hadn",
    "sir", "one", "get", "got", "like", "really", "much", "lot", "many",
    "even", "still", "well", "take", "go", "going", "make", "makes",
    "thing", "things", "way", "say", "says", "said", "yes", "no", "dont",
    "will", "t", "s", "re", "ve", "ll", "d", "m"
}

# ─── Positive / Negative sentiment keywords for basic scoring ───
POSITIVE_WORDS = {
    "good", "great", "excellent", "best", "amazing", "awesome", "fantastic",
    "helpful", "clear", "easy", "kind", "supportive", "brilliant", "perfect",
    "wonderful", "love", "nice", "fair", "recommend", "understanding",
    "knowledgeable", "engaging", "interactive", "approachable", "friendly",
    "motivating", "inspiring", "marks", "grade", "grades"
}

NEGATIVE_WORDS = {
    "bad", "worst", "terrible", "boring", "strict", "tough", "difficult",
    "hard", "poor", "unfair", "rude", "biased", "bias", "harsh", "confusing",
    "unclear", "useless", "slow", "lazy", "scary", "intimidating",
    "partial", "partiality", "favouritism", "favoritism", "attendance",
    "bunk", "no concept", "mood", "moody", "unpredictable"
}


def extract_keywords(text):
    """Extract meaningful words from feedback text, excluding stop words."""
    words = re.findall(r'[a-z]+', text.lower())
    return [w for w in words if w not in STOP_WORDS and len(w) > 2]


def analyze_reviews(reviews):
    """
    Analyze an array of full review objects and return a structured analysis.
    """
    total = len(reviews)
    if total == 0:
        return None

    # ── Recommendation breakdown ──
    rec_counts = Counter()
    for r in reviews:
        rec = (r.get("recommend") or "").strip()
        if "yes" in rec.lower():
            rec_counts["yes"] += 1
        elif "no" in rec.lower():
            rec_counts["no"] += 1
        else:
            rec_counts["depends"] += 1

    # ── Attendance breakdown ──
    att_counts = Counter()
    for r in reviews:
        att = (r.get("attendance") or "").strip()
        att_counts[att] += 1

    # ── Satisfaction average ──
    satisfaction_scores = [r.get("satisfaction", 0) for r in reviews if r.get("satisfaction")]
    avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0

    # ── Strengths and Improvements frequency ──
    strength_counter = Counter()
    improvement_counter = Counter()
    for r in reviews:
        ctx = r.get("context") or {}
        for s in (ctx.get("strengths") or []):
            if s.strip():
                strength_counter[s.strip()] += 1
        for i in (ctx.get("improvements") or []):
            if i.strip():
                improvement_counter[i.strip()] += 1

    # ── Feedback keyword extraction and sentiment ──
    keyword_counter = Counter()
    positive_score = 0
    negative_score = 0
    feedback_texts = []

    for r in reviews:
        fb = (r.get("feedback") or "").strip()
        if not fb:
            continue
        feedback_texts.append(fb)
        keywords = extract_keywords(fb)
        keyword_counter.update(keywords)

        # Basic sentiment via word matching
        fb_lower = fb.lower()
        for pw in POSITIVE_WORDS:
            if pw in fb_lower:
                positive_score += 1
        for nw in NEGATIVE_WORDS:
            if nw in fb_lower:
                negative_score += 1

    return {
        "total": total,
        "rec_counts": rec_counts,
        "att_counts": att_counts,
        "avg_satisfaction": avg_satisfaction,
        "top_strengths": strength_counter.most_common(5),
        "top_improvements": improvement_counter.most_common(5),
        "top_keywords": keyword_counter.most_common(10),
        "positive_score": positive_score,
        "negative_score": negative_score,
        "feedback_count": len(feedback_texts),
    }


def build_summary(analysis):
    """
    Synthesize a human-readable summary paragraph from the structured analysis.
    Weighs points by frequency — the more a theme appears, the more prominent
    it is in the summary.
    """
    total = analysis["total"]
    rec = analysis["rec_counts"]
    strengths = analysis["top_strengths"]
    improvements = analysis["top_improvements"]
    avg_sat = analysis["avg_satisfaction"]
    pos = analysis["positive_score"]
    neg = analysis["negative_score"]

    parts = []

    # ── 1. Recommendation overview (most impactful signal) ──
    yes_pct = (rec.get("yes", 0) / total) * 100 if total else 0
    no_pct = (rec.get("no", 0) / total) * 100 if total else 0
    depends_pct = (rec.get("depends", 0) / total) * 100 if total else 0

    if yes_pct >= 70:
        parts.append(f"A strong majority ({int(yes_pct)}%) of students recommend this faculty.")
    elif yes_pct >= 50:
        parts.append(f"Most students ({int(yes_pct)}%) recommend this faculty, though opinions are mixed.")
    elif no_pct >= 50:
        parts.append(f"A majority ({int(no_pct)}%) of students do not recommend this faculty.")
    elif depends_pct >= 40:
        parts.append("Student opinions are divided — many feel it depends on personal preference.")
    else:
        parts.append("Student recommendations are mixed with no clear consensus.")

    # ── 2. Satisfaction context ──
    if avg_sat >= 4.0:
        parts.append(f"Overall satisfaction is high at {avg_sat:.1f}/5.")
    elif avg_sat >= 3.0:
        parts.append(f"Overall satisfaction is moderate at {avg_sat:.1f}/5.")
    elif avg_sat > 0:
        parts.append(f"Overall satisfaction is below average at {avg_sat:.1f}/5.")

    # ── 3. Strengths (weighted by frequency) ──
    if strengths:
        top_strength_tags = []
        for tag, count in strengths[:3]:
            if count > 1:
                top_strength_tags.append(f"{tag} (mentioned by {count} students)")
            else:
                top_strength_tags.append(tag)
        parts.append("Key strengths include: " + ", ".join(top_strength_tags) + ".")

    # ── 4. Improvements (weighted by frequency) ──
    if improvements:
        top_improvement_tags = []
        for tag, count in improvements[:3]:
            if count > 1:
                top_improvement_tags.append(f"{tag} (noted by {count} students)")
            else:
                top_improvement_tags.append(tag)
        parts.append("Areas for improvement: " + ", ".join(top_improvement_tags) + ".")

    # ── 5. Sentiment-weighted feedback insight ──
    if pos > 0 or neg > 0:
        sentiment_total = pos + neg
        if pos > neg * 2:
            parts.append("Student feedback is overwhelmingly positive in tone.")
        elif pos > neg:
            parts.append("Feedback leans positive overall, though some concerns are raised.")
        elif neg > pos * 2:
            parts.append("Feedback carries a notably critical tone across multiple reviews.")
        elif neg > pos:
            parts.append("Feedback leans negative, with recurring concerns in student comments.")
        else:
            parts.append("Feedback sentiment is balanced between praise and criticism.")

    return " ".join(parts)


def main():
    try:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print("Not enough feedback to summarize.", flush=True)
            return

        reviews = json.loads(input_data)

        if not isinstance(reviews, list) or len(reviews) == 0:
            print("Not enough feedback to summarize.", flush=True)
            return

        analysis = analyze_reviews(reviews)

        if analysis is None:
            print("Not enough feedback to summarize.", flush=True)
            return

        summary = build_summary(analysis)
        print(summary.strip(), flush=True)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()