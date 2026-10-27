import json
from datetime import datetime, timedelta

def generate_daily_plan(
    sheet_path='d:/Projects/Dsa tracker/data/sheet.json',
    contests_path='d:/Projects/Dsa tracker/data/contests.json',
    start_date_str='2026-10-28',
    problems_per_day=3,
    rest_day_name='Sunday'
):
    with open(sheet_path, 'r', encoding='utf-8') as f:
        problems = json.load(f)
        
    with open(contests_path, 'r', encoding='utf-8') as f:
        contests = json.load(f)

    # Map each topic to its contest (if any)
    contests_by_topic = {c['topic']: c for c in contests}
    
    # Organize problems by topic to know when topic ends
    # We want to insert the contest block at the end of its topic
    # Let's inspect the order of items to insert contest right after topic's last problem
    topic_last_order = {}
    for p in problems:
        topic_last_order[p['topic']] = p['order']

    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    rest_day_num = day_names.index(rest_day_name) # 6 for Sunday

    current_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    plan = []
    
    prob_idx = 0
    total_probs = len(problems)
    day_number = 1
    study_day_count = 0 # To count every 7th day for revision
    
    # We also track pending contest to insert
    pending_contests = []

    while prob_idx < total_probs or pending_contests:
        date_str = current_date.strftime('%Y-%m-%d')
        weekday = current_date.weekday() # 0 = Monday, 6 = Sunday
        
        # Check if rest day
        if weekday == rest_day_num:
            plan.append({
                'date': date_str,
                'dayNumber': day_number,
                'dayOfWeek': day_names[weekday],
                'type': 'rest',
                'problemIds': [],
                'title': f'Rest Day ({day_names[weekday]})',
                'description': 'Take a break, rest, and recharge!'
            })
            day_number += 1
            current_date += timedelta(days=1)
            continue
            
        study_day_count += 1
        
        # Every 7th study day is a revision day
        if study_day_count % 7 == 0:
            # Revision day
            plan.append({
                'date': date_str,
                'dayNumber': day_number,
                'dayOfWeek': day_names[weekday],
                'type': 'revision',
                'problemIds': [],
                'title': f'Revision Day (Week {study_day_count // 7})',
                'description': 'Review starred problems, difficult concepts, and recent weak topics.'
            })
            day_number += 1
            current_date += timedelta(days=1)
            continue
            
        # Regular study day: assign problems
        day_problem_ids = []
        day_contest = None
        
        # If there are pending contests from yesterday, include or schedule
        while prob_idx < total_probs and len(day_problem_ids) < problems_per_day:
            cur_prob = problems[prob_idx]
            day_problem_ids.append(cur_prob['id'])
            
            # Check if this problem is the last problem of its topic
            if cur_prob['order'] == topic_last_order.get(cur_prob['topic']):
                if cur_prob['topic'] in contests_by_topic:
                    c = contests_by_topic[cur_prob['topic']]
                    pending_contests.append(c)
            prob_idx += 1

        # If a contest ended today or was pending, attach it to today's schedule
        if pending_contests and (len(day_problem_ids) == problems_per_day or prob_idx >= total_probs):
            day_contest = pending_contests.pop(0)

        plan_entry = {
            'date': date_str,
            'dayNumber': day_number,
            'dayOfWeek': day_names[weekday],
            'type': 'new',
            'problemIds': day_problem_ids,
            'title': f"Day {day_number}: {len(day_problem_ids)} Problems",
            'description': f"Practice problems from {problems[problems_per_day * 0]['topic']}" if day_problem_ids else ""
        }
        if day_contest:
            plan_entry['contest'] = {
                'id': day_contest['id'],
                'title': f"{day_contest['topic']} Contest",
                'problemCount': day_contest['problemCount'],
                'estimatedTime': day_contest['estimatedTime'],
                'practiceUrl': day_contest['practiceUrl']
            }
            
        plan.append(plan_entry)
        day_number += 1
        current_date += timedelta(days=1)

    return plan

if __name__ == '__main__':
    plan = generate_daily_plan()
    with open('d:/Projects/Dsa tracker/data/plan.json', 'w', encoding='utf-8') as f:
        json.dump(plan, f, indent=2)
        
    print(f"Total days generated: {len(plan)}")
    new_days = [d for d in plan if d['type'] == 'new']
    rev_days = [d for d in plan if d['type'] == 'revision']
    rest_days = [d for d in plan if d['type'] == 'rest']
    contest_days = [d for d in plan if 'contest' in d]
    
    total_assigned_probs = sum(len(d['problemIds']) for d in new_days)
    print(f"  New problem days: {len(new_days)}")
    print(f"  Revision days: {len(rev_days)}")
    print(f"  Rest days: {len(rest_days)}")
    print(f"  Contests scheduled: {len(contest_days)}")
    print(f"  Total problems assigned: {total_assigned_probs} / 495")
    print(f"  First day: {plan[0]['date']} ({plan[0]['dayOfWeek']})")
    print(f"  Final day: {plan[-1]['date']} ({plan[-1]['dayOfWeek']})")
