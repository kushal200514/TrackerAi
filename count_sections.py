import json
from collections import defaultdict

with open('d:/Projects/Dsa tracker/rsc_dump.txt', 'r', encoding='utf-8') as f:
    rsc = f.read()

lines = rsc.split('\n')
l146 = lines[146]
colon_idx = l146.find(':')
json_str = l146[colon_idx+1:]
obj = json.loads(json_str)
data = obj[3]['data']
sheet = data['sheet']
syllabus = sheet['sheet_syllabus']
fields = syllabus['fields']
rows = syllabus['rows']
roots = syllabus['roots']

def get_row_dict(idx):
    row = rows[idx]
    field_def = fields[row[0]]
    d = dict(zip(field_def, row[1:]))
    d['_row_idx'] = idx
    return d

def count_items_in_tree(row_idx):
    row_d = get_row_dict(row_idx)
    t = row_d.get('type')
    if t == 'item':
        return [row_idx]
    items = []
    # If category or contest
    children = row_d.get('children', [])
    for c in children:
        items.extend(count_items_in_tree(c))
    return items

print("Section counts:")
root_results = {}
total_extracted = 0

for r_idx in roots:
    r_d = get_row_dict(r_idx)
    label = r_d.get('label')
    slug = r_d.get('slug')
    item_indices = count_items_in_tree(r_idx)
    total_extracted += len(item_indices)
    root_results[slug] = {
        'label': label,
        'count': len(item_indices),
        'items': item_indices
    }
    print(f"  {label} ({slug}): {len(item_indices)} items")

print(f"\nTotal extracted across roots: {total_extracted}")
