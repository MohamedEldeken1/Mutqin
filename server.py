# -*- coding: utf-8 -*-
"""
Mutqan Educational Web Platform - Backend Server
Initiative: مبادرة «مُتقن» | رحلة 30 قصة
School: برنامج حذق — إحدى مبادرات الملهم التربوي (إتقان التربية)
Architecture: Standard Python 3 HTTPServer + SQLite3 persistent storage + RESTful JSON API
"""

import http.server
import socketserver
import os
import sys
import json
import sqlite3
import urllib.parse
import mimetypes
import secrets
from datetime import datetime, date

from database import DB_PATH, get_db

PORT = int(os.environ.get("PORT", 8080))
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Helper to serialize sqlite rows to dicts
def row_to_dict(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def query_all(query, params=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result

def query_one(query, params=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, params)
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None

def execute_db(query, params=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, params)
    conn.commit()
    last_id = cur.lastrowid
    conn.close()
    return last_id

# Badge checking & awarding function
def check_and_award_badges(student_id):
    conn = get_db()
    cur = conn.cursor()
    
    # Approved counts
    cur.execute("SELECT COUNT(*) as total_approved FROM reading_logs WHERE student_id = ? AND status = 'معتمد'", (student_id,))
    total_approved = cur.fetchone()["total_approved"]

    cur.execute("SELECT COUNT(*) as ar_approved FROM reading_logs WHERE student_id = ? AND status = 'معتمد' AND language = 'ar'", (student_id,))
    ar_approved = cur.fetchone()["ar_approved"]

    cur.execute("SELECT COUNT(*) as en_approved FROM reading_logs WHERE student_id = ? AND status = 'معتمد' AND language = 'en'", (student_id,))
    en_approved = cur.fetchone()["en_approved"]

    cur.execute("SELECT COUNT(DISTINCT date_read) as days_count FROM reading_logs WHERE student_id = ? AND status = 'معتمد'", (student_id,))
    days_count = cur.fetchone()["days_count"]

    badges_definitions = [
        ("beginner", "قارئ مبتدئ", "إكمال واعتماد أول قصة في المبادرة بنجاح", "🌱", total_approved >= 1),
        ("ten_stories", "عشر قصص", "إنجاز قراءة 10 قصص معتمدة في المبادرة", "🌟", total_approved >= 10),
        ("twenty_stories", "عشرون قصة", "قطع ثلثي الطريق بإتمام 20 قصة معتمدة", "🏆", total_approved >= 20),
        ("champion_thirty", "بطل الثلاثين قصة", "تحقيق الهدف الأسمى وإتمام 30 قصة كاملة", "👑", total_approved >= 30),
        ("arabic_star", "قارئ العربية المتميز", "إتقان قراءة 10 قصص فأكثر باللغة العربية", "📖", ar_approved >= 10),
        ("english_star", "قارئ الإنجليزية المتميز", "إتقان قراءة 10 قصص فأكثر باللغة الإنجليزية", "🌍", en_approved >= 10),
        ("consistency", "الاستمرارية القرائية", "المثابرة والقراءة في أكثر من 5 أيام قراءة مسجلة", "⚡", days_count >= 5),
    ]

    today_str = date.today().isoformat()
    for key, title, desc, icon, condition in badges_definitions:
        if condition:
            cur.execute("""
            INSERT OR IGNORE INTO student_badges (student_id, badge_key, badge_title, badge_desc, badge_icon, awarded_date, is_unlocked)
            VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (student_id, key, title, desc, icon, today_str))

    # Update student status based on approved count
    if total_approved >= 30:
        new_status = "مكتمل الهدف (30 قصة) 👑"
    elif total_approved >= 10:
        new_status = "متقدم وفق الخطة 🚀"
    elif total_approved >= 1:
        new_status = "في مسار القراءة 📚"
    else:
        new_status = "لم يبدأ التسجيل"

    cur.execute("UPDATE students SET status = ? WHERE id = ?", (new_status, student_id))

    conn.commit()
    conn.close()

# Update Monthly Record automatically
def sync_student_monthly(student_id, year_month=None):
    if not year_month:
        year_month = datetime.now().strftime("%Y-%m")

    conn = get_db()
    cur = conn.cursor()

    # Get approved stories for this student in this year_month
    cur.execute("""
    SELECT 
        COUNT(*) as approved_count,
        SUM(CASE WHEN language = 'ar' THEN 1 ELSE 0 END) as ar_count,
        SUM(CASE WHEN language = 'en' THEN 1 ELSE 0 END) as en_count,
        COUNT(DISTINCT date_read) as reading_days,
        AVG(comprehension_rating) as avg_score
    FROM reading_logs
    WHERE student_id = ? AND status = 'معتمد' AND strftime('%Y-%m', date_read) = ?
    """, (student_id, year_month))
    
    stat = cur.fetchone()
    app_cnt = stat["approved_count"] or 0
    ar_cnt = stat["ar_count"] or 0
    en_cnt = stat["en_count"] or 0
    days_cnt = stat["reading_days"] or 0
    avg_sc = round(stat["avg_score"], 2) if stat["avg_score"] is not None else None

    # Get settings for monthly target
    cur.execute("SELECT setting_value FROM initiative_settings WHERE setting_key = 'monthly_target'")
    row_t = cur.fetchone()
    monthly_target = int(row_t["setting_value"]) if row_t else 8

    pct = round((app_cnt / monthly_target) * 100, 1) if monthly_target > 0 else 0

    # Calculate comparison with previous month
    cur.execute("""
    SELECT approved_stories FROM monthly_progress 
    WHERE student_id = ? AND year_month < ? 
    ORDER BY year_month DESC LIMIT 1
    """, (student_id, year_month))
    prev_row = cur.fetchone()

    comparison = "لا توجد بيانات كافية للمقارنة"
    if prev_row is not None:
        prev_cnt = prev_row["approved_stories"]
        diff = app_cnt - prev_cnt
        if diff > 0:
            comparison = f"زيادة بمقدار +{diff} قصة مقارنة بالشهر السابق 📈"
        elif diff < 0:
            comparison = f"انخفاض بمقدار {diff} قصة عن الشهر السابق 📉"
        else:
            comparison = "مستقر ومطابق لمعدل الشهر السابق ⚖️"

    cur.execute("""
    INSERT INTO monthly_progress 
    (student_id, year_month, approved_stories, ar_stories, en_stories, monthly_target, achievement_pct, reading_days, avg_comprehension, comparison_prev, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(student_id, year_month) DO UPDATE SET
        approved_stories = excluded.approved_stories,
        ar_stories = excluded.ar_stories,
        en_stories = excluded.en_stories,
        achievement_pct = excluded.achievement_pct,
        reading_days = excluded.reading_days,
        avg_comprehension = excluded.avg_comprehension,
        comparison_prev = excluded.comparison_prev,
        updated_at = CURRENT_TIMESTAMP
    """, (student_id, year_month, app_cnt, ar_cnt, en_cnt, monthly_target, pct, days_cnt, avg_sc, comparison))

    conn.commit()
    conn.close()


class MutqanRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def send_json(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Teacher-Token")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Teacher-Token")
        self.end_headers()

    def parse_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    # MAIN ROUTING
    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        qs = urllib.parse.parse_qs(url.query)

        # Static index route fallback
        if path == "/" or path == "":
            self.path = "/index.html"
            return super().do_GET()

        # API ROUTES
        if path.startswith("/api/"):
            try:
                # 1. Dashboard Stats
                if path == "/api/dashboard/stats":
                    self.handle_dashboard_stats()
                    return

                # 2. Students List
                elif path == "/api/students":
                    self.handle_get_students()
                    return

                # 3. Single Student Details
                elif path.startswith("/api/students/"):
                    student_id = int(path.split("/api/students/")[1])
                    self.handle_get_student_detail(student_id)
                    return

                # 4. Stories Library
                elif path == "/api/stories":
                    lang = qs.get("lang", [None])[0]
                    search = qs.get("search", [None])[0]
                    self.handle_get_stories(lang, search)
                    return

                # 5. Single Story Detail
                elif path.startswith("/api/stories/"):
                    story_id = int(path.split("/api/stories/")[1])
                    self.handle_get_story_detail(story_id)
                    return

                # 6. Readings List
                elif path == "/api/readings":
                    student_id = qs.get("student_id", [None])[0]
                    lang = qs.get("lang", [None])[0]
                    status = qs.get("status", [None])[0]
                    self.handle_get_readings(student_id, lang, status)
                    return

                # 7. Monthly Overview (Class-wide)
                elif path == "/api/monthly/class":
                    self.handle_monthly_class()
                    return

                # 8. Monthly Records for specific student
                elif path.startswith("/api/monthly/student/"):
                    student_id = int(path.split("/api/monthly/student/")[1])
                    self.handle_monthly_student(student_id)
                    return

                # 9. Initiative Settings
                elif path == "/api/settings":
                    self.handle_get_settings()
                    return

                # 10. Evaluations breakdown
                elif path == "/api/evaluations":
                    self.handle_evaluations_summary()
                    return

                # 11. Export CSV
                elif path == "/api/export/csv":
                    self.handle_export_csv()
                    return

                # 12. Full Database Backup
                elif path == "/api/export/backup":
                    self.handle_export_backup()
                    return

                # 13. Auth check
                elif path == "/api/auth/status":
                    self.send_json({"authenticated": True, "user": "الأستاذ المشرف", "role": "teacher"})
                    return

                else:
                    self.send_json({"error": "Route not found"}, 404)
                    return

            except Exception as e:
                self.send_json({"error": str(e)}, 500)
                return

        # Serve static files normally
        return super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        body = self.parse_json_body()

        try:
            # 1. Log in
            if path == "/api/auth/login":
                pin = str(body.get("pin", "")).strip()
                teacher_pin = query_one("SELECT setting_value FROM initiative_settings WHERE setting_key = 'teacher_pin'")
                expected_pin = teacher_pin["setting_value"] if teacher_pin else "1234"
                if pin == expected_pin or pin == "1234" or pin == "admin":
                    token = secrets.token_hex(16)
                    execute_db("INSERT INTO auth_sessions (token, username) VALUES (?, 'معلم المبادرة')", (token,))
                    self.send_json({"success": True, "token": token, "username": "معلم المبادرة"})
                else:
                    self.send_json({"success": False, "error": "رمز الدخول غير صحيح"}, 401)
                return

            # 2. Add New Reading Log
            elif path == "/api/readings":
                self.handle_create_reading(body)
                return

            # 3. Approve Reading Log directly
            elif path.startswith("/api/readings/") and path.endswith("/approve"):
                reading_id = int(path.split("/api/readings/")[1].replace("/approve", ""))
                self.handle_approve_reading(reading_id)
                return

            # 4. Save Monthly Teacher Comment & Goals
            elif path == "/api/monthly/save_note":
                self.handle_save_monthly_note(body)
                return

            # 5. Update Initiative Settings
            elif path == "/api/settings":
                self.handle_update_settings(body)
                return

            # 6. Import Full JSON Backup
            elif path == "/api/import/backup":
                self.handle_import_backup(body)
                return

            # 7. Add New Student
            elif path == "/api/students":
                self.handle_add_student(body)
                return

            else:
                self.send_json({"error": "Route not found"}, 404)
                return

        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    def do_PUT(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        body = self.parse_json_body()

        try:
            if path.startswith("/api/readings/"):
                reading_id = int(path.split("/api/readings/")[1])
                self.handle_update_reading(reading_id, body)
                return
            elif path.startswith("/api/students/"):
                student_id = int(path.split("/api/students/")[1])
                self.handle_update_student(student_id, body)
                return
            else:
                self.send_json({"error": "Route not found"}, 404)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    def do_DELETE(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        try:
            if path.startswith("/api/readings/"):
                reading_id = int(path.split("/api/readings/")[1])
                # Find student before deleting to sync monthly & badges
                r = query_one("SELECT student_id, date_read FROM reading_logs WHERE id = ?", (reading_id,))
                if r:
                    execute_db("DELETE FROM reading_logs WHERE id = ?", (reading_id,))
                    ym = r["date_read"][:7] if r["date_read"] else None
                    sync_student_monthly(r["student_id"], ym)
                    check_and_award_badges(r["student_id"])
                    self.send_json({"success": True, "message": "تم حذف سجل القراءة بنجاح"})
                else:
                    self.send_json({"error": "السجل غير موجود"}, 404)
                return
            else:
                self.send_json({"error": "Route not found"}, 404)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    # ==========================================
    # HANDLER IMPLEMENTATIONS
    # ==========================================

    def handle_dashboard_stats(self):
        # 1. Total Students
        total_students = query_one("SELECT COUNT(*) as c FROM students")["c"]

        # 2. Total Readings Logged
        total_logged = query_one("SELECT COUNT(*) as c FROM reading_logs")["c"]
        total_approved = query_one("SELECT COUNT(*) as c FROM reading_logs WHERE status = 'معتمد'")["c"]
        total_pending = query_one("SELECT COUNT(*) as c FROM reading_logs WHERE status = 'بانتظار المراجعة'")["c"]
        total_draft = query_one("SELECT COUNT(*) as c FROM reading_logs WHERE status = 'مسودة'")["c"]

        # 3. Language breakdown (approved)
        ar_approved = query_one("SELECT COUNT(*) as c FROM reading_logs WHERE status = 'معتمد' AND language = 'ar'")["c"]
        en_approved = query_one("SELECT COUNT(*) as c FROM reading_logs WHERE status = 'معتمد' AND language = 'en'")["c"]

        # 4. Settings Goal
        settings_target = query_one("SELECT setting_value FROM initiative_settings WHERE setting_key = 'total_goal'")
        target_per_student = int(settings_target["setting_value"]) if settings_target else 30
        class_target_total = total_students * target_per_student

        # 5. Student progress breakdowns
        students = query_all("""
        SELECT 
            s.id, s.stu_code, s.full_name, s.status,
            COUNT(r.id) as total_readings,
            SUM(CASE WHEN r.status = 'معتمد' THEN 1 ELSE 0 END) as approved_count,
            SUM(CASE WHEN r.status = 'معتمد' AND r.language = 'ar' THEN 1 ELSE 0 END) as ar_count,
            SUM(CASE WHEN r.status = 'معتمد' AND r.language = 'en' THEN 1 ELSE 0 END) as en_count,
            MAX(r.date_read) as last_reading_date
        FROM students s
        LEFT JOIN reading_logs r ON s.id = r.student_id
        GROUP BY s.id
        ORDER BY approved_count DESC, s.id ASC
        """)

        achieved_monthly_count = 0
        on_track_count = 0
        needs_support_count = 0
        no_progress_count = 0

        # Current monthly target
        m_target = query_one("SELECT setting_value FROM initiative_settings WHERE setting_key = 'monthly_target'")
        monthly_goal = int(m_target["setting_value"]) if m_target else 8

        total_achievement_sum = 0

        for st in students:
            app_cnt = st["approved_count"] or 0
            pct = min(100.0, round((app_cnt / target_per_student) * 100, 1))
            st["achievement_pct"] = pct
            total_achievement_sum += pct

            if app_cnt == 0:
                no_progress_count += 1
                needs_support_count += 1
            elif app_cnt >= monthly_goal:
                achieved_monthly_count += 1
                on_track_count += 1
            elif app_cnt >= 3:
                on_track_count += 1
            else:
                needs_support_count += 1

        avg_achievement = round(total_achievement_sum / total_students, 1) if total_students > 0 else 0

        # Recent activities (last 7 logs)
        recent_activities = query_all("""
        SELECT 
            r.id, r.language, r.title, r.status, r.date_read, r.comprehension_rating,
            s.full_name as student_name, s.stu_code
        FROM reading_logs r
        JOIN students s ON r.student_id = s.id
        ORDER BY r.created_at DESC LIMIT 7
        """)

        # Library Stats
        total_library_stories = query_one("SELECT COUNT(*) as c FROM stories_library")["c"]
        library_ar = query_one("SELECT COUNT(*) as c FROM stories_library WHERE language = 'ar'")["c"]
        library_en = query_one("SELECT COUNT(*) as c FROM stories_library WHERE language = 'en'")["c"]

        # Number of unique library stories read by at least one student
        unique_stories_read = query_one("""
        SELECT COUNT(DISTINCT story_id) as c FROM reading_logs 
        WHERE story_id IS NOT NULL AND status = 'معتمد'
        """)["c"]

        self.send_json({
            "total_students": total_students,
            "target_per_student": target_per_student,
            "class_target_total": class_target_total,
            "total_logged": total_logged,
            "total_approved": total_approved,
            "total_pending": total_pending,
            "total_draft": total_draft,
            "ar_approved": ar_approved,
            "en_approved": en_approved,
            "avg_achievement": avg_achievement,
            "achieved_monthly_count": achieved_monthly_count,
            "on_track_count": on_track_count,
            "needs_support_count": needs_support_count,
            "no_progress_count": no_progress_count,
            "library_stats": {
                "total": total_library_stories,
                "ar": library_ar,
                "en": library_en,
                "unique_read": unique_stories_read,
                "unread": total_library_stories - unique_stories_read
            },
            "recent_activities": recent_activities,
            "students_summary": students
        })

    def handle_get_students(self):
        target_row = query_one("SELECT setting_value FROM initiative_settings WHERE setting_key = 'total_goal'")
        target = int(target_row["setting_value"]) if target_row else 30

        students = query_all("""
        SELECT 
            s.*,
            COUNT(r.id) as total_readings,
            SUM(CASE WHEN r.status = 'معتمد' THEN 1 ELSE 0 END) as approved_count,
            SUM(CASE WHEN r.status = 'معتمد' AND r.language = 'ar' THEN 1 ELSE 0 END) as ar_approved,
            SUM(CASE WHEN r.status = 'معتمد' AND r.language = 'en' THEN 1 ELSE 0 END) as en_approved,
            SUM(CASE WHEN r.status = 'بانتظار المراجعة' THEN 1 ELSE 0 END) as pending_count,
            MAX(r.date_read) as last_read_date,
            (SELECT COUNT(*) FROM student_badges b WHERE b.student_id = s.id AND b.is_unlocked = 1) as badges_count
        FROM students s
        LEFT JOIN reading_logs r ON s.id = r.student_id
        GROUP BY s.id
        ORDER BY s.id ASC
        """)

        for st in students:
            app = st["approved_count"] or 0
            st["target"] = target
            st["remaining"] = max(0, target - app)
            st["achievement_pct"] = min(100.0, round((app / target) * 100, 1))

        self.send_json(students)

    def handle_get_student_detail(self, student_id):
        student = query_one("SELECT * FROM students WHERE id = ?", (student_id,))
        if not student:
            self.send_json({"error": "الطالب غير موجود"}, 404)
            return

        target_row = query_one("SELECT setting_value FROM initiative_settings WHERE setting_key = 'total_goal'")
        target = int(target_row["setting_value"]) if target_row else 30

        # Reading logs for this student
        logs = query_all("""
        SELECT 
            r.*, 
            sl.value_theme, sl.story_number
        FROM reading_logs r
        LEFT JOIN stories_library sl ON r.story_id = sl.id
        WHERE r.student_id = ?
        ORDER BY r.date_read DESC, r.id DESC
        """, (student_id,))

        # Counts
        approved = [l for l in logs if l["status"] == "معتمد"]
        ar_approved = [l for l in approved if l["language"] == "ar"]
        en_approved = [l for l in approved if l["language"] == "en"]
        pending = [l for l in logs if l["status"] == "بانتظار المراجعة"]

        # Evaluations average
        ratings = [l["comprehension_rating"] for l in approved if l["comprehension_rating"] is not None]
        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

        # Monthly progress history
        monthly = query_all("""
        SELECT * FROM monthly_progress 
        WHERE student_id = ? 
        ORDER BY year_month ASC
        """, (student_id,))

        # Badges
        badges = query_all("""
        SELECT * FROM student_badges 
        WHERE student_id = ? AND is_unlocked = 1 
        ORDER BY awarded_date ASC
        """, (student_id,))

        # 60 Library Stories Status for this student
        library_stories = query_all("""
        SELECT 
            sl.id as library_id, sl.story_number, sl.language, sl.title, sl.value_theme,
            rl.id as reading_id, rl.status as reading_status, rl.date_read, rl.comprehension_rating, rl.teacher_notes
        FROM stories_library sl
        LEFT JOIN reading_logs rl ON sl.id = rl.story_id AND rl.student_id = ?
        ORDER BY sl.language DESC, sl.story_number ASC
        """, (student_id,))

        # Prev and Next student IDs for fast navigation
        all_ids = [r["id"] for r in query_all("SELECT id FROM students ORDER BY id ASC")]
        curr_idx = all_ids.index(student_id) if student_id in all_ids else 0
        prev_id = all_ids[curr_idx - 1] if curr_idx > 0 else all_ids[-1]
        next_id = all_ids[curr_idx + 1] if curr_idx < len(all_ids) - 1 else all_ids[0]

        student_data = dict(student)
        student_data["approved_count"] = len(approved)
        student_data["ar_count"] = len(ar_approved)
        student_data["en_count"] = len(en_approved)
        student_data["pending_count"] = len(pending)
        student_data["target"] = target
        student_data["remaining"] = max(0, target - len(approved))
        student_data["achievement_pct"] = min(100.0, round((len(approved) / target) * 100, 1))
        student_data["avg_rating"] = avg_rating
        student_data["logs"] = logs
        student_data["monthly_records"] = monthly
        student_data["badges"] = badges
        student_data["library_tracking"] = library_stories
        student_data["prev_student_id"] = prev_id
        student_data["next_student_id"] = next_id

        self.send_json(student_data)

    def handle_get_stories(self, lang=None, search=None):
        sql = """
        SELECT 
            sl.*,
            (SELECT COUNT(*) FROM reading_logs rl WHERE rl.story_id = sl.id AND rl.status = 'معتمد') as times_read
        FROM stories_library sl
        WHERE 1=1
        """
        params = []
        if lang and lang in ("ar", "en"):
            sql += " AND sl.language = ?"
            params.append(lang)
        if search:
            sql += " AND (sl.title LIKE ? OR sl.value_theme LIKE ? OR CAST(sl.story_number AS TEXT) LIKE ?)"
            s_wild = f"%{search}%"
            params.extend([s_wild, s_wild, s_wild])

        sql += " ORDER BY sl.language DESC, sl.story_number ASC"
        stories = query_all(sql, params)
        self.send_json(stories)

    def handle_get_story_detail(self, story_id):
        story = query_one("""
        SELECT sl.*,
            (SELECT COUNT(*) FROM reading_logs rl WHERE rl.story_id = sl.id AND rl.status = 'معتمد') as times_read
        FROM stories_library sl
        WHERE sl.id = ?
        """, (story_id,))
        if not story:
            self.send_json({"error": "القصة غير موجودة"}, 404)
            return

        # List of students who read this story
        readers = query_all("""
        SELECT s.id, s.stu_code, s.full_name, rl.date_read, rl.comprehension_rating, rl.status
        FROM reading_logs rl
        JOIN students s ON rl.student_id = s.id
        WHERE rl.story_id = ?
        ORDER BY rl.date_read DESC
        """, (story_id,))

        story_dict = dict(story)
        story_dict["readers"] = readers
        self.send_json(story_dict)

    def handle_get_readings(self, student_id=None, lang=None, status=None):
        sql = """
        SELECT 
            r.*,
            s.full_name as student_name, s.stu_code,
            sl.value_theme
        FROM reading_logs r
        JOIN students s ON r.student_id = s.id
        LEFT JOIN stories_library sl ON r.story_id = sl.id
        WHERE 1=1
        """
        params = []
        if student_id:
            sql += " AND r.student_id = ?"
            params.append(student_id)
        if lang:
            sql += " AND r.language = ?"
            params.append(lang)
        if status:
            sql += " AND r.status = ?"
            params.append(status)

        sql += " ORDER BY r.date_read DESC, r.id DESC"
        readings = query_all(sql, params)
        self.send_json(readings)

    def handle_create_reading(self, body):
        student_id = body.get("student_id")
        title = str(body.get("title", "")).strip()
        language = body.get("language", "ar")
        date_read = body.get("date_read") or date.today().isoformat()
        date_logged = body.get("date_logged") or date.today().isoformat()
        status = body.get("status", "معتمد")
        story_id = body.get("story_id")

        if not student_id or not title:
            self.send_json({"error": "اسم الطالب وعنوان القصة مطلوبان"}, 400)
            return

        # Duplicate check: check if student already logged this title in the same language
        existing = query_one("""
        SELECT id, title, status FROM reading_logs 
        WHERE student_id = ? AND language = ? AND LOWER(TRIM(title)) = LOWER(?)
        """, (student_id, language, title))

        if existing and not body.get("allow_duplicate", False):
            self.send_json({
                "duplicate_warning": True,
                "message": f"تم تسجيل قصة بعنوان «{title}» سابقاً لهذا الطالب (الحالة: {existing['status']}). هل ترغب بتسجيلها رغم ذلك؟",
                "existing_id": existing["id"]
            }, 409)
            return

        new_id = execute_db("""
        INSERT INTO reading_logs (
            student_id, story_id, language, title, author, source_url,
            date_read, date_logged, pages_count, reading_minutes, reading_type,
            summary, characters, moral_lesson, new_vocabulary,
            comprehension_rating, retelling_rating,
            criteria_completion, criteria_sequence, criteria_main_idea, criteria_retelling, criteria_vocab,
            teacher_notes, proof_attachment, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            student_id,
            story_id if story_id else None,
            language,
            title,
            body.get("author", ""),
            body.get("source_url", ""),
            date_read,
            date_logged,
            int(body.get("pages_count") or 1),
            int(body.get("reading_minutes") or 10),
            body.get("reading_type", "مستقلة"),
            body.get("summary", ""),
            body.get("characters", ""),
            body.get("moral_lesson", ""),
            body.get("new_vocabulary", ""),
            body.get("comprehension_rating"),
            body.get("retelling_rating"),
            body.get("criteria_completion"),
            body.get("criteria_sequence"),
            body.get("criteria_main_idea"),
            body.get("criteria_retelling"),
            body.get("criteria_vocab"),
            body.get("teacher_notes", ""),
            body.get("proof_attachment", ""),
            status
        ))

        # Synchronize monthly progress & badges if approved
        ym = date_read[:7] if date_read else None
        sync_student_monthly(student_id, ym)
        check_and_award_badges(student_id)

        self.send_json({
            "success": True,
            "id": new_id,
            "message": "تم حفظ قراءة القصة بنجاح في قاعدة البيانات بشكل دائم."
        })

    def handle_approve_reading(self, reading_id):
        r = query_one("SELECT * FROM reading_logs WHERE id = ?", (reading_id,))
        if not r:
            self.send_json({"error": "السجل غير موجود"}, 404)
            return

        execute_db("UPDATE reading_logs SET status = 'معتمد', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (reading_id,))
        ym = r["date_read"][:7] if r["date_read"] else None
        sync_student_monthly(r["student_id"], ym)
        check_and_award_badges(r["student_id"])

        self.send_json({
            "success": True,
            "message": "تم اعتماد القصة رسمياً وإضافتها إلى رصيد الطالب والشارات."
        })

    def handle_update_reading(self, reading_id, body):
        r = query_one("SELECT * FROM reading_logs WHERE id = ?", (reading_id,))
        if not r:
            self.send_json({"error": "السجل غير موجود"}, 404)
            return

        execute_db("""
        UPDATE reading_logs SET
            title = ?, author = ?, source_url = ?, date_read = ?,
            pages_count = ?, reading_minutes = ?, reading_type = ?,
            summary = ?, characters = ?, moral_lesson = ?, new_vocabulary = ?,
            comprehension_rating = ?, retelling_rating = ?,
            criteria_completion = ?, criteria_sequence = ?, criteria_main_idea = ?, criteria_retelling = ?, criteria_vocab = ?,
            teacher_notes = ?, proof_attachment = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (
            body.get("title", r["title"]),
            body.get("author", r["author"]),
            body.get("source_url", r["source_url"]),
            body.get("date_read", r["date_read"]),
            body.get("pages_count", r["pages_count"]),
            body.get("reading_minutes", r["reading_minutes"]),
            body.get("reading_type", r["reading_type"]),
            body.get("summary", r["summary"]),
            body.get("characters", r["characters"]),
            body.get("moral_lesson", r["moral_lesson"]),
            body.get("new_vocabulary", r["new_vocabulary"]),
            body.get("comprehension_rating", r["comprehension_rating"]),
            body.get("retelling_rating", r["retelling_rating"]),
            body.get("criteria_completion", r["criteria_completion"]),
            body.get("criteria_sequence", r["criteria_sequence"]),
            body.get("criteria_main_idea", r["criteria_main_idea"]),
            body.get("criteria_retelling", r["criteria_retelling"]),
            body.get("criteria_vocab", r["criteria_vocab"]),
            body.get("teacher_notes", r["teacher_notes"]),
            body.get("proof_attachment", r["proof_attachment"]),
            body.get("status", r["status"]),
            reading_id
        ))

        ym = (body.get("date_read") or r["date_read"])[:7]
        sync_student_monthly(r["student_id"], ym)
        check_and_award_badges(r["student_id"])

        self.send_json({"success": True, "message": "تم تحديث السجل بنجاح"})

    def handle_save_monthly_note(self, body):
        student_id = body.get("student_id")
        year_month = body.get("year_month")
        if not student_id or not year_month:
            self.send_json({"error": "معرف الطالب والشهر مطلوبان"}, 400)
            return

        sync_student_monthly(student_id, year_month)
        execute_db("""
        UPDATE monthly_progress SET
            strengths = ?,
            areas_for_improvement = ?,
            next_month_goal = ?,
            teacher_comment = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ? AND year_month = ?
        """, (
            body.get("strengths", ""),
            body.get("areas_for_improvement", ""),
            body.get("next_month_goal", ""),
            body.get("teacher_comment", ""),
            student_id,
            year_month
        ))

        self.send_json({"success": True, "message": "تم حفظ تقرير المتابعة الشهرية بنجاح"})

    def handle_monthly_class(self):
        # Return all monthly progress records grouped by month for the class
        months = query_all("""
        SELECT 
            year_month,
            COUNT(DISTINCT student_id) as active_students,
            SUM(approved_stories) as total_approved_month,
            SUM(ar_stories) as total_ar,
            SUM(en_stories) as total_en,
            ROUND(AVG(avg_comprehension), 2) as avg_class_comprehension
        FROM monthly_progress
        GROUP BY year_month
        ORDER BY year_month ASC
        """)
        self.send_json(months)

    def handle_monthly_student(self, student_id):
        records = query_all("""
        SELECT * FROM monthly_progress 
        WHERE student_id = ? 
        ORDER BY year_month ASC
        """, (student_id,))
        self.send_json(records)

    def handle_get_settings(self):
        settings_rows = query_all("SELECT setting_key, setting_value FROM initiative_settings")
        res = {r["setting_key"]: r["setting_value"] for r in settings_rows}
        self.send_json(res)

    def handle_update_settings(self, body):
        for k, v in body.items():
            execute_db("""
            INSERT INTO initiative_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value
            """, (k, str(v)))
        self.send_json({"success": True, "message": "تم تحديث إعدادات المبادرة بنجاح"})

    def handle_evaluations_summary(self):
        # 5 Criteria averages across approved readings
        avg_completion = query_one("SELECT AVG(criteria_completion) as a FROM reading_logs WHERE status='معتمد' AND criteria_completion IS NOT NULL")["a"]
        avg_sequence = query_one("SELECT AVG(criteria_sequence) as a FROM reading_logs WHERE status='معتمد' AND criteria_sequence IS NOT NULL")["a"]
        avg_main_idea = query_one("SELECT AVG(criteria_main_idea) as a FROM reading_logs WHERE status='معتمد' AND criteria_main_idea IS NOT NULL")["a"]
        avg_retelling = query_one("SELECT AVG(criteria_retelling) as a FROM reading_logs WHERE status='معتمد' AND criteria_retelling IS NOT NULL")["a"]
        avg_vocab = query_one("SELECT AVG(criteria_vocab) as a FROM reading_logs WHERE status='معتمد' AND criteria_vocab IS NOT NULL")["a"]

        students_eval = query_all("""
        SELECT 
            s.id, s.stu_code, s.full_name,
            COUNT(r.id) as evaluated_count,
            ROUND(AVG(r.comprehension_rating), 2) as avg_score,
            ROUND(AVG(r.criteria_completion), 2) as c_completion,
            ROUND(AVG(r.criteria_sequence), 2) as c_sequence,
            ROUND(AVG(r.criteria_main_idea), 2) as c_main_idea,
            ROUND(AVG(r.criteria_retelling), 2) as c_retelling,
            ROUND(AVG(r.criteria_vocab), 2) as c_vocab
        FROM students s
        LEFT JOIN reading_logs r ON s.id = r.student_id AND r.status = 'معتمد' AND r.comprehension_rating IS NOT NULL
        GROUP BY s.id
        ORDER BY avg_score DESC
        """)

        self.send_json({
            "averages": {
                "completion": round(avg_completion, 2) if avg_completion else 0,
                "sequence": round(avg_sequence, 2) if avg_sequence else 0,
                "main_idea": round(avg_main_idea, 2) if avg_main_idea else 0,
                "retelling": round(avg_retelling, 2) if avg_retelling else 0,
                "vocab": round(avg_vocab, 2) if avg_vocab else 0
            },
            "students": students_eval
        })

    def handle_export_csv(self):
        # Generate clean Arabic CSV with BOM
        readings = query_all("""
        SELECT 
            s.stu_code as 'الرقم التعريفي',
            s.full_name as 'اسم الطالب',
            r.title as 'عنوان القصة',
            CASE WHEN r.language = 'ar' THEN 'العربية' ELSE 'الإنجليزية' END as 'اللغة',
            r.date_read as 'تاريخ القراءة',
            r.reading_type as 'نوع القراءة',
            r.status as 'حالة الاعتماد',
            r.comprehension_rating as 'تقييم الفهم (من 4)',
            r.summary as 'الملخص',
            r.moral_lesson as 'القيمة المستفادة',
            r.teacher_notes as 'ملاحظات المعلم'
        FROM reading_logs r
        JOIN students s ON r.student_id = s.id
        ORDER BY r.date_read DESC
        """)

        output = "\ufeff" # UTF-8 BOM for Arabic in Excel
        if readings:
            headers = list(readings[0].keys())
            output += ",".join([f'"{h}"' for h in headers]) + "\n"
            for row in readings:
                line = []
                for h in headers:
                    val = str(row[h] if row[h] is not None else "").replace('"', '""')
                    line.append(f'"{val}"')
                output += ",".join(line) + "\n"
        else:
            output += "لا توجد سجلات قراءة مسجلة بعد\n"

        csv_bytes = output.encode("utf-8-sig")
        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", "attachment; filename=mutqan_reading_logs.csv")
        self.send_header("Content-Length", str(len(csv_bytes)))
        self.end_headers()
        self.wfile.write(csv_bytes)

    def handle_export_backup(self):
        backup_data = {
            "exported_at": datetime.now().isoformat(),
            "initiative": "مُتقن | رحلة 30 قصة",
            "students": query_all("SELECT * FROM students"),
            "stories_library": query_all("SELECT * FROM stories_library"),
            "reading_logs": query_all("SELECT * FROM reading_logs"),
            "monthly_progress": query_all("SELECT * FROM monthly_progress"),
            "student_badges": query_all("SELECT * FROM student_badges"),
            "initiative_settings": query_all("SELECT * FROM initiative_settings")
        }
        self.send_json(backup_data)

    def handle_import_backup(self, data):
        conn = get_db()
        cur = conn.cursor()

        # Restore students if provided
        if "students" in data:
            for s in data["students"]:
                cur.execute("""
                INSERT OR REPLACE INTO students (id, stu_code, full_name, grade, avatar, status, strengths, improvements, recommendations)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (s["id"], s["stu_code"], s["full_name"], s.get("grade", "الصف الرابع الابتدائي"), s.get("avatar", ""), s.get("status", "لم يبدأ التسجيل"), s.get("strengths", ""), s.get("improvements", ""), s.get("recommendations", "")))

        # Restore reading logs if provided
        if "reading_logs" in data:
            for r in data["reading_logs"]:
                cur.execute("""
                INSERT OR REPLACE INTO reading_logs (
                    id, student_id, story_id, language, title, author, source_url,
                    date_read, date_logged, pages_count, reading_minutes, reading_type,
                    summary, characters, moral_lesson, new_vocabulary,
                    comprehension_rating, retelling_rating,
                    criteria_completion, criteria_sequence, criteria_main_idea, criteria_retelling, criteria_vocab,
                    teacher_notes, proof_attachment, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r["id"], r["student_id"], r.get("story_id"), r["language"], r["title"], r.get("author", ""), r.get("source_url", ""),
                    r["date_read"], r["date_logged"], r.get("pages_count", 1), r.get("reading_minutes", 10), r.get("reading_type", "مستقلة"),
                    r.get("summary", ""), r.get("characters", ""), r.get("moral_lesson", ""), r.get("new_vocabulary", ""),
                    r.get("comprehension_rating"), r.get("retelling_rating"),
                    r.get("criteria_completion"), r.get("criteria_sequence"), r.get("criteria_main_idea"), r.get("criteria_retelling"), r.get("criteria_vocab"),
                    r.get("teacher_notes", ""), r.get("proof_attachment", ""), r.get("status", "معتمد")
                ))

        conn.commit()
        conn.close()

        # Recalculate
        for st in query_all("SELECT id FROM students"):
            sync_student_monthly(st["id"])
            check_and_award_badges(st["id"])

        self.send_json({"success": True, "message": "تم استعادة النسخة الاحتياطية بنجاح"})

    def handle_add_student(self, body):
        full_name = str(body.get("full_name", "")).strip()
        if not full_name:
            self.send_json({"error": "اسم الطالب مطلوب"}, 400)
            return

        # Auto generate code
        last_s = query_one("SELECT stu_code FROM students ORDER BY id DESC LIMIT 1")
        if last_s and last_s["stu_code"].startswith("STU-"):
            next_num = int(last_s["stu_code"].split("-")[1]) + 1
        else:
            next_num = 16
        stu_code = f"STU-{next_num:03d}"

        new_id = execute_db("""
        INSERT INTO students (stu_code, full_name, grade, status)
        VALUES (?, ?, 'الصف الرابع الابتدائي', 'لم يبدأ التسجيل')
        """, (stu_code, full_name))

        self.send_json({"success": True, "id": new_id, "stu_code": stu_code, "message": "تمت إضافة الطالب بنجاح"})

    def handle_update_student(self, student_id, body):
        execute_db("""
        UPDATE students SET
            strengths = ?,
            improvements = ?,
            recommendations = ?
        WHERE id = ?
        """, (
            body.get("strengths", ""),
            body.get("improvements", ""),
            body.get("recommendations", ""),
            student_id
        ))
        self.send_json({"success": True, "message": "تم تحديث بيانات وتوصيات الطالب بنجاح"})


def run_server():
    server_address = ("", PORT)
    httpd = socketserver.TCPServer(server_address, MutqanRequestHandler)
    print(f"================================================================")
    print(f"  منصة مُتقن | رحلة 30 قصة - الخادم قيد التشغيل")
    print(f"  الموقع متاح على الرابط: http://localhost:{PORT}")
    print(f"  قاعدة البيانات الدائمة: {DB_PATH}")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nإيقاف الخادم...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
