import json
from collections import Counter

with open('d:/Projects/Dsa tracker/data/sheet.json', 'r', encoding='utf-8') as f:
    problems = json.load(f)

print(f"Total problems loaded: {len(problems)}")

# Expected counts from user prompt
expected = {
    "Strings (Basic/Medium)": 7,
    "Recursion": 22,
    "Linked List": 49,
    "Bit Manipulation": 14,
    "Greedy": 14,
    "Sliding Window": 13,
    "Stack/Queues": 31,
    "Binary Trees": 32,
    "BST": 15,
    "Heaps": 20,
    "Graphs": 46,
    "DP": 53,
    "Tries": 7,
    "Strings (Advanced)": 9,
    "Maths": 3,
    "Sorting": 7,
    "Arrays": 32,
    "Hashing": 6,
    "Binary Search": 32,
    "Beginner Problems": 83,
}

topic_counts = Counter(p['topic'].strip() for p in problems)

print("\nTopic mapping check:")
for t, c in topic_counts.items():
    print(f"  '{t}': {c}")

mapping = {
    "Strings (Basic/Medium)": "Strings (Basic and Medium)",
    "Recursion": "Recursion",
    "Linked List": "Linked-List",
    "Bit Manipulation": "Bit Manipulation",
    "Greedy": "Greedy Algorithms",
    "Sliding Window": "Sliding Window / 2 Pointer",
    "Stack/Queues": "Stack / Queues",
    "Binary Trees": "Binary Trees",
    "BST": "Binary Search Trees",
    "Heaps": "Heaps",
    "Graphs": "Graphs",
    "DP": "Dynamic Programming",
    "Tries": "Tries",
    "Strings (Advanced)": "Strings (Advanced Algo)",
    "Maths": "Maths",
    "Sorting": "Sorting",
    "Arrays": "Arrays",
    "Hashing": "Hashing",
    "Binary Search": "Binary Search",
    "Beginner Problems": "Beginner Problems"
}

print("\n" + "="*65)
print(f"{'Section':<28} | {'Expected':<10} | {'Extracted':<10} | {'Match'}")
print("="*65)

all_match = True
for section, exp_cnt in expected.items():
    actual_key = mapping.get(section, section)
    act_cnt = topic_counts.get(actual_key, 0)
    match_str = "PASS" if exp_cnt == act_cnt else "FAIL"
    if exp_cnt != act_cnt:
        all_match = False
    print(f"{section:<28} | {exp_cnt:<10} | {act_cnt:<10} | {match_str}")

print("="*65)
print(f"Overall status: {'ALL 20 SECTIONS MATCH 100%' if all_match else 'MISMATCH DETECTED'}")
