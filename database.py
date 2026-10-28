# -*- coding: utf-8 -*-
"""
Database Schema and Initialization for Mutqan Platform.
Initiative: مبادرة «مُتقن» | رحلة 30 قصة
School / Program: برنامج حذق — الملهم التربوي / إتقان التربية
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mutqan.db")

STUDENTS_LIST = [
    ("STU-001", "تركي بن خالد بن مساعد الغامدي"),
    ("STU-002", "حسن هيثم حسن الحربي"),
    ("STU-003", "سلمان بن خالد بن مناحي العتيبي"),
    ("STU-004", "سلمان سمير بن إبراهيم الزيد"),
    ("STU-005", "عبدالرحمن عبدالعزيز صالح آل غنيم"),
    ("STU-006", "عبدالملك سامي الأسمري"),
    ("STU-007", "فهد عبدالله سعد القحطاني"),
    ("STU-008", "فيصل خالد عويض المطيري"),
    ("STU-009", "ماجد فهد عبدالعزيز العتيبي"),
    ("STU-010", "محمد صائل محمد الشمري"),
    ("STU-011", "مشعل عبدالرحمن ابن شايع القحطاني"),
    ("STU-012", "مهند عبد الواحد عقلاء الرويلي"),
    ("STU-013", "مهند محمد بن علي القحطاني"),
    ("STU-014", "ناصر محمد ناصر المطيري"),
    ("STU-015", "يوسف بن صالح بن إبراهيم الغامدي"),
]

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    # 1. Students Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stu_code TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        grade TEXT DEFAULT 'الصف الرابع الابتدائي',
        avatar TEXT DEFAULT '',
        status TEXT DEFAULT 'لم يبدأ التسجيل',
        strengths TEXT DEFAULT '',
        improvements TEXT DEFAULT '',
        recommendations TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Stories Library Table (60 stories: 30 Arabic, 30 English)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS stories_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        story_number INTEGER NOT NULL,
        language TEXT NOT NULL, -- 'ar' or 'en'
        title TEXT NOT NULL,
        value_theme TEXT NOT NULL,
        content TEXT NOT NULL,
        questions TEXT DEFAULT '',
        reading_time_min INTEGER DEFAULT 5,
        target_grade TEXT DEFAULT 'الصف الرابع',
        pdf_page INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        UNIQUE(story_number, language)
    );
    """)

    # 3. Reading Logs Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reading_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        story_id INTEGER,
        language TEXT NOT NULL, -- 'ar' or 'en'
        title TEXT NOT NULL,
        author TEXT DEFAULT '',
        source_url TEXT DEFAULT '',
        date_read DATE NOT NULL,
        date_logged DATE NOT NULL,
        pages_count INTEGER DEFAULT 1,
        reading_minutes INTEGER DEFAULT 10,
        reading_type TEXT DEFAULT 'مستقلة', -- 'مستقلة', 'بمساعدة', 'قراءة مشتركة'
        summary TEXT DEFAULT '',
        characters TEXT DEFAULT '',
        moral_lesson TEXT DEFAULT '',
        new_vocabulary TEXT DEFAULT '',
        comprehension_rating INTEGER DEFAULT NULL, -- 1 to 4
        retelling_rating INTEGER DEFAULT NULL,     -- 1 to 4
        criteria_completion INTEGER DEFAULT NULL,  -- 1 to 4
        criteria_sequence INTEGER DEFAULT NULL,    -- 1 to 4
        criteria_main_idea INTEGER DEFAULT NULL,   -- 1 to 4
        criteria_retelling INTEGER DEFAULT NULL,   -- 1 to 4
        criteria_vocab INTEGER DEFAULT NULL,       -- 1 to 4
        teacher_notes TEXT DEFAULT '',
        proof_attachment TEXT DEFAULT '',
        status TEXT DEFAULT 'مسودة', -- 'مسودة', 'بانتظار المراجعة', 'معتمد', 'يحتاج تعديل'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (story_id) REFERENCES stories_library(id) ON DELETE SET NULL
    );
    """)

    # 4. Monthly Progress Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS monthly_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        year_month TEXT NOT NULL, -- e.g. '2026-10' or 'الشهر الأول'
        approved_stories INTEGER DEFAULT 0,
        ar_stories INTEGER DEFAULT 0,
        en_stories INTEGER DEFAULT 0,
        monthly_target INTEGER DEFAULT 8,
        achievement_pct REAL DEFAULT 0,
        reading_days INTEGER DEFAULT 0,
        avg_comprehension REAL DEFAULT NULL,
        comparison_prev TEXT DEFAULT 'لا توجد بيانات كافية للمقارنة',
        strengths TEXT DEFAULT '',
        areas_for_improvement TEXT DEFAULT '',
        next_month_goal TEXT DEFAULT '',
        teacher_comment TEXT DEFAULT '',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, year_month),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # 5. Badges Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        badge_key TEXT NOT NULL,
        badge_title TEXT NOT NULL,
        badge_desc TEXT NOT NULL,
        badge_icon TEXT NOT NULL,
        awarded_date DATE NOT NULL,
        is_unlocked INTEGER DEFAULT 1,
        UNIQUE(student_id, badge_key),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # 6. Initiative Settings Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS initiative_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL
    );
    """)

    # 7. Teacher / Admin Auth Sessions Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS auth_sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT DEFAULT 'teacher',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Populate Default Settings if not exist
    default_settings = [
        ("initiative_name", "مُتقن | رحلة 30 قصة"),
        ("initiative_slogan", "نقرأ لنتعلم، ونتعلم لنتقن"),
        ("initiative_umbrella", "برنامج حذق — إحدى مبادرات الملهم التربوي (إتقان التربية)"),
        ("target_grade", "الصف الرابع الابتدائي"),
        ("total_goal", "30"),
        ("ar_target_flexible", "15"),
        ("en_target_flexible", "15"),
        ("semester_start", "2026-09-01"),
        ("semester_end", "2026-12-31"),
        ("monthly_target", "8"),
        ("weekly_target", "2"),
        ("teacher_pin", "1234"), # Easy access PIN for demo, can be changed
        ("months_list", json.dumps(["الشهر الأول (سبتمبر)", "الشهر الثاني (أكتوبر)", "الشهر الثالث (نوفمبر)", "الشهر الرابع (ديسمبر)"], ensure_ascii=False))
    ]
    for key, val in default_settings:
        cur.execute("INSERT OR IGNORE INTO initiative_settings (setting_key, setting_value) VALUES (?, ?)", (key, val))

    # Populate Students if table empty
    cur.execute("SELECT COUNT(*) as count FROM students")
    if cur.fetchone()["count"] == 0:
        for stu_code, full_name in STUDENTS_LIST:
            cur.execute("""
            INSERT INTO students (stu_code, full_name, grade, status)
            VALUES (?, ?, 'الصف الرابع الابتدائي', 'لم يبدأ التسجيل')
            """, (stu_code, full_name))

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
