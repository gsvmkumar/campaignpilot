"""Domain and industry classification helpers for the intelligence engine."""

from __future__ import annotations

from difflib import SequenceMatcher

KEYWORD_MAP = {
    "shop": "Shopping & Retail",
    "buy": "Shopping & Retail",
    "store": "Shopping & Retail",
    "sale": "Shopping & Retail",
    "retail": "Shopping & Retail",
    "health": "Health & Fitness",
    "fitness": "Health & Fitness",
    "gym": "Health & Fitness",
    "workout": "Health & Fitness",
    "travel": "Travel",
    "hotel": "Travel",
    "flight": "Travel",
    "vacation": "Travel",
    "food": "Restaurants & Food",
    "restaurant": "Restaurants & Food",
    "diet": "Restaurants & Food",
    "meal": "Restaurants & Food",
    "law": "Attorneys & Legal",
    "attorney": "Attorneys & Legal",
    "legal": "Attorneys & Legal",
    "lawyer": "Attorneys & Legal",
    "car": "Automotive Sales",
    "auto": "Automotive Sales",
    "vehicle": "Automotive Sales",
    "dealer": "Automotive Sales",
    "repair": "Automotive Repair",
    "garage": "Automotive Repair",
    "home": "Home Improvement",
    "remodel": "Home Improvement",
    "furniture": "Furniture",
    "finance": "Finance & Insurance",
    "insurance": "Finance & Insurance",
    "loan": "Finance & Insurance",
    "education": "Education",
    "course": "Education",
    "learn": "Education",
    "school": "Education",
    "beauty": "Beauty & Personal Care",
    "salon": "Beauty & Personal Care",
    "fashion": "Apparel & Fashion",
    "clothes": "Apparel & Fashion",
    "pet": "Animals & Pets",
    "animal": "Animals & Pets",
    "real estate": "Real Estate",
    "property": "Real Estate",
    "dental": "Dental Services",
    "teeth": "Dental Services",
    "physician": "Physicians & Surgeons",
    "doctor": "Physicians & Surgeons",
    "medical": "Physicians & Surgeons",
    "business": "Business Services",
    "software": "Business Services",
    "saas": "Business Services",
    "industrial": "Industrial & Commercial",
}

KNOWN_INDUSTRIES = {
    "Arts & Entertainment",
    "Animals & Pets",
    "Apparel & Fashion",
    "Attorneys & Legal",
    "Automotive Repair",
    "Automotive Sales",
    "Beauty & Personal Care",
    "Business Services",
    "Career & Employment",
    "Dental Services",
    "Education",
    "Finance & Insurance",
    "Furniture",
    "Health & Fitness",
    "Home Improvement",
    "Industrial & Commercial",
    "Personal Services",
    "Physicians & Surgeons",
    "Real Estate",
    "Restaurants & Food",
    "Shopping & Retail",
    "Sports & Recreation",
    "Travel",
}


def _best_known_industry(text: str) -> str | None:
    lowered = text.strip().lower()
    if not lowered:
        return None

    for industry in KNOWN_INDUSTRIES:
        if industry.lower() == lowered:
            return industry

    scored = sorted(
        (
            SequenceMatcher(None, lowered, industry.lower()).ratio(),
            industry,
        )
        for industry in KNOWN_INDUSTRIES
    )
    best_score, best_industry = scored[-1]
    if best_score >= 0.7:
        return best_industry
    return None


def classify_domain(
    *,
    manual_input: str | None = None,
    benchmark_category: str | None = None,
    keywords: str | None = None,
    channel: str | None = None,
    landing_page_url: str | None = None,
) -> str:
    """Pick the strongest matching benchmark industry from available hints."""

    for candidate in (manual_input, benchmark_category):
        if candidate:
            matched = _best_known_industry(candidate)
            if matched:
                return matched

    haystack = " ".join(filter(None, [keywords, channel, landing_page_url])).lower()
    for keyword, industry in KEYWORD_MAP.items():
        if keyword in haystack:
            return industry

    return "AVERAGE"
