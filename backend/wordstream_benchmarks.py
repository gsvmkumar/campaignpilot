"""Static WordStream benchmark reference data for Domain Intelligence Engine."""

from __future__ import annotations

USD_TO_INR = 83.0

BENCHMARKS_USD = {
    "Arts & Entertainment": {"ctr": 13.04, "cvr": 10.81, "cpc": 1.72, "cpl": 30.27},
    "Animals & Pets": {"ctr": 8.10, "cvr": 12.03, "cpc": 2.58, "cpl": 31.82},
    "Apparel & Fashion": {"ctr": 6.30, "cvr": 3.60, "cpc": 1.55, "cpl": 43.75},
    "Attorneys & Legal": {"ctr": 5.30, "cvr": 6.98, "cpc": 8.94, "cpl": 131.63},
    "Automotive Repair": {"ctr": 7.98, "cvr": 12.96, "cpc": 3.42, "cpl": 28.50},
    "Automotive Sales": {"ctr": 6.89, "cvr": 6.03, "cpc": 2.47, "cpl": 41.02},
    "Beauty & Personal Care": {"ctr": 7.38, "cvr": 8.02, "cpc": 2.89, "cpl": 36.91},
    "Business Services": {"ctr": 6.02, "cvr": 4.73, "cpc": 3.84, "cpl": 103.54},
    "Career & Employment": {"ctr": 6.72, "cvr": 6.14, "cpc": 3.11, "cpl": 50.68},
    "Dental Services": {"ctr": 5.38, "cvr": 6.82, "cpc": 6.82, "cpl": 89.34},
    "Education": {"ctr": 6.10, "cvr": 7.21, "cpc": 3.52, "cpl": 48.73},
    "Finance & Insurance": {"ctr": 7.75, "cvr": 5.10, "cpc": 5.16, "cpl": 101.12},
    "Furniture": {"ctr": 6.48, "cvr": 2.56, "cpc": 2.94, "cpl": 121.51},
    "Health & Fitness": {"ctr": 7.14, "cvr": 8.44, "cpc": 2.63, "cpl": 31.16},
    "Home Improvement": {"ctr": 5.59, "cvr": 9.46, "cpc": 6.96, "cpl": 73.58},
    "Industrial & Commercial": {"ctr": 6.01, "cvr": 5.78, "cpc": 4.13, "cpl": 71.49},
    "Personal Services": {"ctr": 7.21, "cvr": 9.74, "cpc": 3.28, "cpl": 33.65},
    "Physicians & Surgeons": {"ctr": 6.44, "cvr": 11.06, "cpc": 3.97, "cpl": 35.90},
    "Real Estate": {"ctr": 9.20, "cvr": 5.33, "cpc": 2.10, "cpl": 39.41},
    "Restaurants & Food": {"ctr": 7.59, "cvr": 9.14, "cpc": 1.95, "cpl": 30.27},
    "Shopping & Retail": {"ctr": 6.88, "cvr": 4.71, "cpc": 1.89, "cpl": 40.13},
    "Sports & Recreation": {"ctr": 9.66, "cvr": 7.86, "cpc": 2.33, "cpl": 29.62},
    "Travel": {"ctr": 7.83, "cvr": 4.54, "cpc": 1.92, "cpl": 44.07},
    "AVERAGE": {"ctr": 6.42, "cvr": 6.96, "cpc": 4.66, "cpl": 66.69},
}


def get_benchmark(industry: str) -> dict[str, float]:
    """Return benchmark values normalized into the app's INR-based units."""

    source = BENCHMARKS_USD.get(industry, BENCHMARKS_USD["AVERAGE"])
    return {
        "ctr": float(source["ctr"]),
        "cvr": float(source["cvr"]),
        "cpc": round(float(source["cpc"]) * USD_TO_INR, 2),
        "cpl": round(float(source["cpl"]) * USD_TO_INR, 2),
    }
