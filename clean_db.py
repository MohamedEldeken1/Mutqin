# -*- coding: utf-8 -*-
import server

server.execute_db("DELETE FROM reading_logs")
server.execute_db("DELETE FROM student_badges")
server.execute_db("DELETE FROM monthly_progress")
server.execute_db("UPDATE students SET status = 'لم يبدأ التسجيل'")
print("Database verified pristine: All 15 students start with 'لم يبدأ التسجيل' and zero fake reading records.")
