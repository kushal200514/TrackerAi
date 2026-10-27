import json
import os

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

problems = []
contests = []
seen_ids = set()

def traverse(idx, topic_label, topic_slug, subtopic_label, subtopic_slug):
    d = get_row_dict(idx)
    t = d.get('type')
    
    if t == 'item':
        slug = d.get('slug', '').strip()
        # Ensure unique id
        prob_id = slug
        if prob_id in seen_ids:
            prob_id = f"{slug}-{subtopic_slug or topic_slug}"
        seen_ids.add(prob_id)
        
        diff_raw = d.get('difficulty')
        diff_mapped = None
        if diff_raw == 'basic':
            diff_mapped = 'Basic'
        elif diff_raw == 'core':
            diff_mapped = 'Core'
        elif diff_raw == 'pro':
            diff_mapped = 'Pro'
        
        layout = d.get('layoutType', 'practice')
        if layout == 'learning':
            practice_url = f"https://takeuforward.org/learning/dsa/{slug}"
        else:
            practice_url = f"https://takeuforward.org/practice/dsa/{slug}"
            
        blog = d.get('free_blog_link')
        article_url = None
        if blog:
            article_url = blog if blog.startswith('http') else f"https://takeuforward.org{blog}"
            
        leetcode_url = d.get('leetcode_link') or None
        video_url = d.get('yt_video') or None
        
        problems.append({
            'id': prob_id,
            'slug': slug,
            'title': d.get('label', '').strip(),
            'topic': topic_label,
            'topicSlug': topic_slug,
            'subtopic': subtopic_label,
            'subtopicSlug': subtopic_slug,
            'difficulty': diff_mapped,
            'rawDifficulty': diff_raw,
            'layoutType': layout,
            'duration': d.get('duration'),
            'practiceUrl': practice_url,
            'articleUrl': article_url,
            'leetcodeUrl': leetcode_url,
            'videoUrl': video_url,
            'order': len(problems) + 1
        })
    elif t == 'contest':
        slug = d.get('slug', '').strip()
        contest_id = f"{slug}-{topic_slug}"
        contests.append({
            'id': contest_id,
            'slug': slug,
            'title': d.get('label', 'Contest').strip(),
            'topic': topic_label,
            'topicSlug': topic_slug,
            'problemCount': d.get('problem_count', 3),
            'estimatedTime': d.get('estmd_time', '2 hours'),
            'practiceUrl': f"https://takeuforward.org/practice/dsa/contest/{slug}",
            'afterOrder': len(problems) # order of last problem in topic
        })
    elif t == 'category':
        cur_topic = topic_label or d.get('label')
        cur_topic_slug = topic_slug or d.get('slug')
        cur_subtopic = d.get('label') if topic_label else subtopic_label
        cur_subtopic_slug = d.get('slug') if topic_slug else subtopic_slug
        for c in d.get('children', []):
            traverse(c, cur_topic, cur_topic_slug, cur_subtopic, cur_subtopic_slug)

for r in roots:
    r_d = get_row_dict(r)
    traverse(r, r_d.get('label'), r_d.get('slug'), '', '')

os.makedirs('d:/Projects/Dsa tracker/data', exist_ok=True)

# Save sheet.json as array of 495 problems
with open('d:/Projects/Dsa tracker/data/sheet.json', 'w', encoding='utf-8') as f:
    json.dump(problems, f, indent=2)

# Save contests.json
with open('d:/Projects/Dsa tracker/data/contests.json', 'w', encoding='utf-8') as f:
    json.dump(contests, f, indent=2)

print(f"Saved {len(problems)} problems to data/sheet.json")
print(f"Saved {len(contests)} contests to data/contests.json")

# Verification
basic_cnt = sum(1 for p in problems if p['difficulty'] == 'Basic')
core_cnt = sum(1 for p in problems if p['difficulty'] == 'Core')
pro_cnt = sum(1 for p in problems if p['difficulty'] == 'Pro')
none_cnt = sum(1 for p in problems if p['difficulty'] is None)

print(f"Verification: Total: {len(problems)}")
print(f"  Basic: {basic_cnt}")
print(f"  Core: {core_cnt}")
print(f"  Pro: {pro_cnt}")
print(f"  Uncategorized/Theory: {none_cnt}")
