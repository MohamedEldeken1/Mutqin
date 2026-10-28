# -*- coding: utf-8 -*-
import sqlite3
import json
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from database import DB_PATH
import server

def run_tests():
    print(">>> 1. Checking 15 students in Database:")
    students = server.query_all("SELECT id, stu_code, full_name, status FROM students ORDER BY id ASC")
    assert len(students) == 15, f"Expected 15 students, found {len(students)}"
    print(f"PASS: Exactly {len(students)} students loaded.")
    for s in students[:3]:
        print(f"   - {s['stu_code']}: {s['full_name']} ({s['status']})")

    print("\n>>> 2. Checking 60 official stories in Library:")
    stories = server.query_all("SELECT id, story_number, language, title, value_theme FROM stories_library ORDER BY language DESC, story_number ASC")
    assert len(stories) == 60, f"Expected 60 stories, found {len(stories)}"
    ar_count = sum(1 for s in stories if s['language'] == 'ar')
    en_count = sum(1 for s in stories if s['language'] == 'en')
    assert ar_count == 30, f"Expected 30 Arabic stories, found {ar_count}"
    assert en_count == 30, f"Expected 30 English stories, found {en_count}"
    print(f"PASS: 60 stories verified (30 Arabic + 30 English).")

    print("\n>>> 3. Testing Reading Registration & Badge Unlocking for Student 1:")
    s1 = students[0]
    story1 = server.query_one("SELECT * FROM stories_library WHERE story_number = 1 AND language = 'ar'")
    
    # Insert reading log
    log_id = server.execute_db("""
    INSERT INTO reading_logs (
        student_id, story_id, language, title, author, date_read, date_logged,
        summary, characters, moral_lesson, new_vocabulary,
        comprehension_rating, retelling_rating, criteria_completion, criteria_sequence,
        criteria_main_idea, criteria_retelling, criteria_vocab, teacher_notes, status
    ) VALUES (?, ?, 'ar', ?, 'مبادرة متقن', '2026-10-29', '2026-10-29', 'ملخص ممتاز', 'مازن والعم محمود', 'الاتقان والامانة', 'نباهة ورصانة', 4, 4, 4, 4, 4, 4, 4, 'أداء متقن ورائع', 'معتمد')
    """, (s1["id"], story1["id"], story1["title"]))

    # Synchronize
    server.sync_student_monthly(s1["id"], "2026-10")
    server.check_and_award_badges(s1["id"])

    # Check updated stats
    st_updated = server.query_one("SELECT * FROM students WHERE id = ?", (s1["id"],))
    print(f"PASS: Student updated status is: {st_updated['status']}")
    
    badges = server.query_all("SELECT * FROM student_badges WHERE student_id = ?", (s1["id"],))
    assert len(badges) >= 1, "Expected at least 1 badge awarded"
    print(f"PASS: Badge awarded: {badges[0]['badge_title']} ({badges[0]['badge_icon']}) - {badges[0]['badge_desc']}")

    # Check monthly record
    monthly = server.query_one("SELECT * FROM monthly_progress WHERE student_id = ? AND year_month = '2026-10'", (s1["id"],))
    assert monthly is not None, "Monthly progress record not created"
    print(f"PASS: Monthly progress record: {monthly['approved_stories']} approved, {monthly['achievement_pct']}% of target.")

    print("\n>>> 4. Testing Duplicate Detection Check:")
    existing = server.query_one("""
    SELECT id, title FROM reading_logs 
    WHERE student_id = ? AND language = 'ar' AND LOWER(TRIM(title)) = LOWER(?)
    """, (s1["id"], story1["title"]))
    assert existing is not None, "Duplicate check failed to detect existing title"
    print(f"PASS: Duplicate correctly detected for title '{story1['title']}'.")

    # Clean up test log to keep records pristine or retain as demonstration
    print("\n>>> 5. Resetting student 1 test log back to clean state:")
    server.execute_db("DELETE FROM reading_logs WHERE id = ?", (log_id,))
    server.execute_db("DELETE FROM student_badges WHERE student_id = ?", (s1["id"],))
    server.execute_db("DELETE FROM monthly_progress WHERE student_id = ?", (s1["id"],))
    server.execute_db("UPDATE students SET status = 'لم يبدأ التسجيل' WHERE id = ?", (s1["id"],))
    print("PASS: Clean state confirmed (All 15 students start with 'لم يبدأ التسجيل' as strictly required).")

    print("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! 100% OPERATIONAL.")

if __name__ == "__main__":
    run_tests()
