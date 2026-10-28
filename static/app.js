/**
 * Mutqan Platform Frontend Application Controller
 * Initiative: مبادرة «مُتقن» | رحلة 30 قصة
 * Program: برنامج حذق — إحدى مبادرات الملهم التربوي (إتقان التربية)
 */

let state = {
  currentView: 'dashboard',
  students: [],
  stories: [],
  currentStudent: null,
  currentStudentId: null,
  activeStoryForModal: null,
  formCriteria: {
    completion: 3,
    sequence: 3,
    main_idea: 3,
    retelling: 3,
    vocab: 3
  },
  settings: {},
  monthlyData: []
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initMobileToggle();
  loadSettings();
  loadDashboard();
  loadStudents().then(() => {
    checkStudentUrlParam();
  });
  loadStories();
});

// Check if student opened via direct link e.g. ?student=STU-001 or ?id=1
function checkStudentUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const stuCode = params.get('student');
  const stuId = params.get('id');

  if (stuCode || stuId) {
    let student = null;
    if (stuCode) {
      student = state.students.find(s => s.stu_code.toLowerCase() === stuCode.toLowerCase());
    } else if (stuId) {
      student = state.students.find(s => String(s.id) === String(stuId));
    }

    if (student) {
      // Enter Student Mode
      enterStudentMode(student);
    }
  }
}

function enterStudentMode(student) {
  state.isStudentMode = true;
  document.body.classList.add('student-portal-mode');
  
  // Hide teacher specific items
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML = `
      <div class="nav-section-title">بوابة الطالب الخاصة</div>
      <a class="nav-item active" onclick="openStudentProfile(${student.id})">
        <span class="nav-icon">👤</span>
        <span>ملفي القرائي وشاراتي</span>
      </a>
      <a class="nav-item" onclick="switchView('arabic-library')">
        <span class="nav-icon">📖</span>
        <span>المكتبة العربية (30)</span>
      </a>
      <a class="nav-item" onclick="switchView('english-library')">
        <span class="nav-icon">🌍</span>
        <span>Reading in English (30)</span>
      </a>
      <a class="nav-item" onclick="showNewReadingModal(${student.id})">
        <span class="nav-icon">✍️</span>
        <span>إرسال قصة جديدة للمعلم</span>
      </a>
      <div style="margin-top: 30px; padding: 12px; background: rgba(255,255,255,0.06); border-radius: var(--radius-md); text-align: center; font-size: 0.8rem; color: #cbd5e1;">
        مرحباً بك يا بطل!<br><strong style="color: #fcd34d;">${student.full_name}</strong>
      </div>
      <div style="margin-top: 10px; text-align: center;">
        <button class="btn btn-sm btn-outline" style="color: #cbd5e1; border-color: rgba(255,255,255,0.2); font-size: 0.72rem;" onclick="exitStudentMode()">دخول المعلم المشرف 🔑</button>
      </div>
    `;
  }

  // Open the student's profile directly
  openStudentProfile(student.id);
  showToast(`أهلاً بك يا ${student.full_name.split(' ')[0]} في رحلة الـ 30 قصة! 🌟`);
}

function exitStudentMode() {
  openLoginModal();
}

function copyStudentLink(studentCode) {
  const origin = window.location.origin;
  const link = `${origin}/?student=${studentCode}`;
  navigator.clipboard.writeText(link).then(() => {
    showToast(`تم نسخ رابط الطالب (${studentCode}) بنجاح! يمكنك إرساله له في واتساب.`);
  }).catch(() => {
    prompt('انسخ الرابط التالي وأرسله للطالب:', link);
  });
}

// Toast Notifications
function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.innerHTML = `<span>${isError ? '⚠️' : '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navigation & View Switching
function initNavigation() {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) {
        switchView(view);
      }
    });
  });
}

function switchView(viewName) {
  state.currentView = viewName;

  // Update active state in sidebar
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Hide all view sections
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.style.display = 'none';
  });

  // Show target section
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) {
    targetSec.style.display = 'block';
  }

  // Update Topbar Title
  const titleEl = document.getElementById('pageTitle');
  const titles = {
    'dashboard': '<span>📊</span><span>لوحة التحكم الرئيسية</span>',
    'students': '<span>👨‍🎓</span><span>سجل جميع الطلاب (15)</span>',
    'student-profile': '<span>👤</span><span>الملف الشخصي للطالب</span>',
    'arabic-library': '<span>📖</span><span>المكتبة العربية (30 قصة فصحى)</span>',
    'english-library': '<span>🌍</span><span>English Story Library (30 Stories)</span>',
    'new-reading': '<span>✍️</span><span>تسجيل واعتماد قراءة جديدة</span>',
    'monthly-tracking': '<span>📅</span><span>المتابعة الشهرية المستقلة</span>',
    'evaluations': '<span>🎯</span><span>التقييمات القرائية ومستوى الفهم</span>',
    'badges': '<span>🏆</span><span>منظومة الشارات والتحفيز التربوي</span>',
    'reports': '<span>📑</span><span>التقارير المعتمدة والتصدير</span>',
    'settings': '<span>⚙️</span><span>إعدادات المبادرة والأهداف</span>',
    'backup': '<span>💾</span><span>النسخ الاحتياطي وحفظ البيانات</span>'
  };
  if (titleEl && titles[viewName]) {
    titleEl.innerHTML = titles[viewName];
  }

  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('mobile-open');

  // Specific view loaders
  if (viewName === 'dashboard') loadDashboard();
  if (viewName === 'students') renderStudentsTable();
  if (viewName === 'arabic-library') renderArabicStories();
  if (viewName === 'english-library') renderEnglishStories();
  if (viewName === 'monthly-tracking') loadMonthlyTrackingData();
  if (viewName === 'evaluations') loadEvaluations();
  if (viewName === 'badges') renderBadgesCatalog();
  if (viewName === 'new-reading') populateReadingFormSelects();
  if (viewName === 'reports') populateReportsStudentSelect();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initMobileToggle() {
  const btn = document.getElementById('mobileToggleBtn');
  const sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

function initSearch() {
  const globalSearch = document.getElementById('globalStudentSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length > 0) {
        if (state.currentView !== 'students') {
          switchView('students');
        }
        const filterInput = document.getElementById('studentsFilterSearch');
        if (filterInput) filterInput.value = q;
        renderStudentsTable(q);
      } else {
        renderStudentsTable();
      }
    });
  }

  const tableSearch = document.getElementById('studentsFilterSearch');
  if (tableSearch) {
    tableSearch.addEventListener('input', (e) => {
      renderStudentsTable(e.target.value.trim().toLowerCase());
    });
  }

  const statusFilter = document.getElementById('studentsFilterStatus');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderStudentsTable();
    });
  }
}

// ==========================================
// API DATA LOADERS
// ==========================================

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    state.settings = await res.json();
    
    // Fill settings form
    if (state.settings.total_goal) document.getElementById('settingTotalGoal').value = state.settings.total_goal;
    if (state.settings.monthly_target) document.getElementById('settingMonthlyTarget').value = state.settings.monthly_target;
    if (state.settings.ar_target_flexible) document.getElementById('settingArTarget').value = state.settings.ar_target_flexible;
    if (state.settings.en_target_flexible) document.getElementById('settingEnTarget').value = state.settings.en_target_flexible;
    if (state.settings.semester_start) document.getElementById('settingSemesterStart').value = state.settings.semester_start;
    if (state.settings.semester_end) document.getElementById('settingSemesterEnd').value = state.settings.semester_end;
    if (state.settings.teacher_pin) document.getElementById('settingTeacherPin').value = state.settings.teacher_pin;
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();

    document.getElementById('dashTotalStudents').innerText = data.total_students;
    document.getElementById('dashApprovedStories').innerText = data.total_approved;
    document.getElementById('dashStoriesBreakdown').innerText = `🇸🇦 ${data.ar_approved} عربي | 🇬🇧 ${data.en_approved} إنجليزي`;
    document.getElementById('dashAvgProgress').innerText = `${data.avg_achievement}%`;
    document.getElementById('dashPendingStories').innerText = data.total_pending;

    document.getElementById('dashOnTrackCount').innerText = data.on_track_count;
    document.getElementById('dashMonthlyGoalAchieved').innerText = data.achieved_monthly_count;
    document.getElementById('dashNeedsSupportCount').innerText = data.needs_support_count;
    document.getElementById('dashNoProgressCount').innerText = data.no_progress_count;

    // Render Dashboard Students Table
    const tbody = document.getElementById('dashboardStudentsTbody');
    if (tbody) {
      tbody.innerHTML = '';
      data.students_summary.forEach((st, idx) => {
        const tr = document.createElement('tr');
        const approved = st.approved_count || 0;
        const pct = Math.min(100, Math.round((approved / (data.target_per_student || 30)) * 100));

        let statusBadge = '<span class="badge badge-gray">لم يبدأ التسجيل</span>';
        if (approved >= 30) statusBadge = '<span class="badge badge-purple">بطل الـ 30 قصة 👑</span>';
        else if (approved >= 10) statusBadge = '<span class="badge badge-emerald">متقدم ومتميز 🚀</span>';
        else if (approved >= 1) statusBadge = '<span class="badge badge-gold">في المسار 📚</span>';

        tr.innerHTML = `
          <td><strong>${idx + 1}</strong></td>
          <td><span class="badge badge-purple">${st.stu_code}</span></td>
          <td><strong style="color: var(--primary-navy); cursor: pointer;" onclick="openStudentProfile(${st.id})">${st.full_name}</strong></td>
          <td><strong style="color: var(--accent-emerald); font-size: 1.05rem;">${approved}</strong> / 30</td>
          <td><span class="badge badge-emerald">🇸🇦 ${st.ar_count || 0}</span></td>
          <td><span class="badge badge-blue">🇬🇧 ${st.en_count || 0}</span></td>
          <td>
            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-fill progress-fill-emerald" style="width: ${pct}%;"></div>
              </div>
              <span class="progress-label">${pct}%</span>
            </div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="openStudentProfile(${st.id})">الملف ↗</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Recent Activities
    const actContainer = document.getElementById('dashRecentActivities');
    if (actContainer) {
      if (!data.recent_activities || data.recent_activities.length === 0) {
        actContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">
            لا توجد أنشطة قراءة مسجلة حتى الآن.<br><br>
            <button class="btn btn-sm btn-primary" onclick="showNewReadingModal()">تسجيل أول قصة الآن ✍️</button>
          </div>
        `;
      } else {
        actContainer.innerHTML = '';
        data.recent_activities.forEach(a => {
          const div = document.createElement('div');
          div.style = "padding: 12px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;";
          div.innerHTML = `
            <div>
              <div style="font-weight: 700; color: var(--primary-navy);">${a.title} (${a.language === 'ar' ? 'عربي 🇸🇦' : 'English 🇬🇧'})</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">الطالب: <strong>${a.student_name}</strong> • ${a.date_read}</div>
            </div>
            <div>
              <span class="badge ${a.status === 'معتمد' ? 'badge-emerald' : 'badge-gold'}">${a.status}</span>
            </div>
          `;
          actContainer.appendChild(div);
        });
      }
    }

  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
}

async function loadStudents() {
  try {
    const res = await fetch('/api/students');
    state.students = await res.json();
    document.getElementById('sidebarStudentCount').innerText = state.students.length;
    renderStudentsTable();
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

function renderStudentsTable(searchQuery = '') {
  const tbody = document.getElementById('allStudentsTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const filterStatus = document.getElementById('studentsFilterStatus')?.value || 'all';

  let list = state.students.filter(s => {
    let matchesSearch = true;
    if (searchQuery) {
      matchesSearch = s.full_name.toLowerCase().includes(searchQuery) || s.stu_code.toLowerCase().includes(searchQuery);
    }
    let matchesStatus = true;
    const app = s.approved_count || 0;
    if (filterStatus === 'needs_support') matchesStatus = (app < 3);
    else if (filterStatus === 'on_track') matchesStatus = (app >= 3);
    else if (filterStatus === 'completed') matchesStatus = (app >= 30);
    else if (filterStatus === 'has_pending') matchesStatus = ((s.pending_count || 0) > 0);

    return matchesSearch && matchesStatus;
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 30px; color: var(--text-muted);">لا توجد نتائج مطابقة لبحثك.</td></tr>`;
    return;
  }

  list.forEach(st => {
    const tr = document.createElement('tr');
    const approved = st.approved_count || 0;
    const pct = st.achievement_pct || 0;

    let statusBadge = '<span class="badge badge-gray">لم يبدأ التسجيل</span>';
    if (approved >= 30) statusBadge = '<span class="badge badge-purple">مكتمل الهدف (30) 👑</span>';
    else if (approved >= 10) statusBadge = '<span class="badge badge-emerald">متقدم 🚀</span>';
    else if (approved >= 1) statusBadge = '<span class="badge badge-gold">في المسار 📚</span>';

    tr.innerHTML = `
      <td><span class="badge badge-purple">${st.stu_code}</span></td>
      <td><strong style="color: var(--primary-navy); cursor: pointer;" onclick="openStudentProfile(${st.id})">${st.full_name}</strong></td>
      <td><strong>${st.total_readings || 0}</strong></td>
      <td><strong style="color: var(--accent-emerald); font-size: 1.1rem;">${approved}</strong> / 30</td>
      <td><span class="badge badge-emerald">🇸🇦 ${st.ar_approved || 0}</span></td>
      <td><span class="badge badge-blue">🇬🇧 ${st.en_approved || 0}</span></td>
      <td><span style="font-weight: 700; color: ${st.remaining > 0 ? '#b45309' : '#047857'}">${st.remaining} قصة</span></td>
      <td>
        <div class="progress-container">
          <div class="progress-track">
            <div class="progress-fill progress-fill-emerald" style="width: ${pct}%;"></div>
          </div>
          <span class="progress-label">${pct}%</span>
        </div>
      </td>
      <td>${st.last_read_date ? `<span style="font-size: 0.8rem;">${st.last_read_date}</span>` : '<span style="color: #94a3b8;">—</span>'}</td>
      <td><span class="badge badge-gold">🏆 ${st.badges_count || 0}</span></td>
      <td>${statusBadge}</td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-sm btn-primary" onclick="openStudentProfile(${st.id})">الملف ↗</button>
          <button class="btn btn-sm btn-gold" onclick="copyStudentLink('${st.stu_code}')" title="نسخ رابط الطالب المباشر لإرساله عبر الواتساب">🔗 رابط</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// STUDENT PROFILE VIEW & TABS
// ==========================================

async function openStudentProfile(studentId) {
  try {
    const res = await fetch(`/api/students/${studentId}`);
    if (!res.ok) {
      showToast('تعذر جلب ملف الطالب', true);
      return;
    }
    const data = await res.json();
    state.currentStudent = data;
    state.currentStudentId = data.id;

    // Header info
    document.getElementById('profAvatar').innerText = data.full_name.charAt(0);
    document.getElementById('profFullName').innerText = data.full_name;
    document.getElementById('profCode').innerText = data.stu_code;
    
    let stBadge = document.getElementById('profStatusBadge');
    stBadge.innerText = data.status || 'لم يبدأ التسجيل';

    document.getElementById('profApprovedCount').innerText = data.approved_count;
    document.getElementById('profRemainingCount').innerText = data.remaining;
    document.getElementById('profAchievementPct').innerText = `${data.achievement_pct}%`;
    document.getElementById('profArCount').innerText = data.ar_count;
    document.getElementById('profEnCount').innerText = data.en_count;
    document.getElementById('profAvgRating').innerText = data.avg_rating ? `${data.avg_rating} / 4` : '—';

    // Overview Tab
    document.getElementById('profProgressLabel').innerText = `${data.approved_count} من أصل 30 قصة (${data.achievement_pct}%)`;
    document.getElementById('profProgressFill').style.width = `${data.achievement_pct}%`;
    document.getElementById('profArSubtext').innerText = `${data.ar_count} قصة معتمدة باللغة العربية`;
    document.getElementById('profEnSubtext').innerText = `${data.en_count} قصة معتمدة باللغة الإنجليزية`;

    // Notes
    document.getElementById('profStrengthsText').innerText = data.strengths || 'لم يتم تسجيل نقاط قوة بعد من قِبل المعلم.';
    document.getElementById('profImprovementsText').innerText = data.improvements || 'لم يتم تسجيل مجالات تحسين بعد.';
    document.getElementById('profRecommendationsText').innerText = data.recommendations || 'لم يتم تسجيل توصيات بعد.';

    document.getElementById('editProfStrengths').value = data.strengths || '';
    document.getElementById('editProfImprovements').value = data.improvements || '';
    document.getElementById('editProfRecommendations').value = data.recommendations || '';

    // Timeline
    renderStudentTimeline(data.logs);

    // Badges
    renderStudentBadges(data.badges);

    // Stories Tab
    renderStudentStories(data.logs);

    // 60 Library Tracker Tab
    renderStudent60LibraryTracker(data.library_tracking);

    // Monthly Tab
    renderStudentMonthlyRecords(data.monthly_records);

    // Criteria Breakdown Tab
    renderStudentCriteriaBreakdown(data.logs);

    // Switch view
    switchView('student-profile');
    switchProfileTab('overview');

  } catch (err) {
    console.error('Error opening student profile:', err);
    showToast('حدث خطأ أثناء تحميل الملف', true);
  }
}

function navigateStudent(dir) {
  if (!state.currentStudent) return;
  const targetId = (dir === 'prev') ? state.currentStudent.prev_student_id : state.currentStudent.next_student_id;
  if (targetId) {
    openStudentProfile(targetId);
  }
}

function switchProfileTab(tabName) {
  document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event?.target?.classList.add('active');

  document.querySelectorAll('.profile-tab-content').forEach(c => {
    c.style.display = 'none';
  });

  const target = document.getElementById(`profTab-${tabName}`);
  if (target) {
    target.style.display = 'block';
  }
}

function renderStudentTimeline(logs) {
  const container = document.getElementById('profTimelineContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!logs || logs.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.88rem; padding: 10px 0;">
        لم تسجل أي أحداث قراءة للطالب حتى الآن. ابدأ بتسجيل أول قصة!
      </div>
    `;
    return;
  }

  logs.forEach(l => {
    const item = document.createElement('div');
    item.style = "position: relative; margin-bottom: 18px;";
    item.innerHTML = `
      <div style="position: absolute; right: -25px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: ${l.status === 'معتمد' ? 'var(--accent-emerald)' : 'var(--accent-gold)'};"></div>
      <div style="font-weight: 700; color: var(--primary-navy);">${l.title} (${l.language === 'ar' ? 'العربية 🇸🇦' : 'English 🇬🇧'})</div>
      <div style="font-size: 0.78rem; color: var(--text-muted);">
        📅 ${l.date_read} • الحالة: <span class="badge ${l.status === 'معتمد' ? 'badge-emerald' : 'badge-gold'}">${l.status}</span>
        ${l.comprehension_rating ? `• التقييم: <strong>${l.comprehension_rating} / 4</strong>` : ''}
      </div>
      ${l.moral_lesson ? `<div style="font-size: 0.82rem; color: var(--accent-purple); margin-top: 3px;">💡 القيمة: ${l.moral_lesson}</div>` : ''}
    `;
    container.appendChild(item);
  });
}

function renderStudentBadges(badges) {
  const container = document.getElementById('profBadgesList');
  if (!container) return;
  container.innerHTML = '';

  if (!badges || badges.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">لم تُفتح أي شارة بعد. تُمنح الشارات تلقائياً مع تسجيل القصص المعتمدة!</div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.style = "display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;";
  badges.forEach(b => {
    const card = document.createElement('div');
    card.style = "background: #faf5ff; border: 1px solid #d8b4fe; border-radius: var(--radius-md); padding: 12px; text-align: center;";
    card.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 4px;">${b.badge_icon}</div>
      <div style="font-weight: 800; font-size: 0.82rem; color: var(--primary-navy);">${b.badge_title}</div>
      <div style="font-size: 0.7rem; color: var(--text-muted);">${b.awarded_date}</div>
    `;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

function renderStudentStories(logs) {
  const tbody = document.getElementById('profStoriesTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 25px; color: var(--text-muted);">لا توجد قصص مسجلة بعد لهذا الطالب.</td></tr>`;
    return;
  }

  logs.forEach((l, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${l.title}</strong></td>
      <td><span class="badge ${l.language === 'ar' ? 'badge-emerald' : 'badge-blue'}">${l.language === 'ar' ? '🇸🇦 عربية' : '🇬🇧 English'}</span></td>
      <td>${l.date_read}</td>
      <td>${l.reading_type}</td>
      <td>${l.comprehension_rating ? `<strong>${l.comprehension_rating}</strong> / 4` : '<span style="color:#94a3b8;">لم يُقيّم</span>'}</td>
      <td><span class="badge ${l.status === 'معتمد' ? 'badge-emerald' : 'badge-gold'}">${l.status}</span></td>
      <td style="font-size: 0.82rem; color: var(--text-muted); max-width: 200px;">${l.teacher_notes || '—'}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          ${l.status !== 'معتمد' ? `<button class="btn btn-sm btn-emerald" onclick="approveReadingLog(${l.id})">اعتماد ✅</button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="deleteReadingLog(${l.id})">حذف</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStudent60LibraryTracker(tracking) {
  const tbody = document.getElementById('profLibraryTrackerTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!tracking || tracking.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;">جاري تحميل جدول القصص الستين...</td></tr>`;
    return;
  }

  tracking.forEach(st => {
    const tr = document.createElement('tr');
    let statusBadge = '<span class="badge badge-gray">لم يبدأ</span>';
    if (st.reading_status === 'معتمد') statusBadge = '<span class="badge badge-emerald">معتمدة ومكتملة ✅</span>';
    else if (st.reading_status === 'بانتظار المراجعة') statusBadge = '<span class="badge badge-gold">بانتظار الاعتماد ⏳</span>';

    tr.innerHTML = `
      <td><strong>#${st.story_number}</strong></td>
      <td><strong style="color: var(--primary-navy);">${st.title}</strong></td>
      <td><span class="badge ${st.language === 'ar' ? 'badge-emerald' : 'badge-blue'}">${st.language === 'ar' ? '🇸🇦 عربية' : '🇬🇧 إنجليزية'}</span></td>
      <td style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">${st.value_theme}</td>
      <td>${statusBadge}</td>
      <td>${st.date_read || '—'}</td>
      <td>${st.comprehension_rating ? `${st.comprehension_rating} / 4` : '—'}</td>
      <td>
        ${!st.reading_id ? `
          <button class="btn btn-sm btn-primary" onclick="quickLogLibraryStory(${st.library_id}, '${st.language}', '${st.title}')">تسجيل قراءة ✍️</button>
        ` : `
          <span style="font-size: 0.8rem; color: #047857; font-weight: 700;">مسجلة بسجل الطالب</span>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStudentMonthlyRecords(monthlyRecords) {
  const container = document.getElementById('profMonthlyContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!monthlyRecords || monthlyRecords.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 30px;">
        لا توجد سجلات شهرية سابقة بعد. يتم توليد السجل الشهري تلقائياً فور اعتماد أول قصة للطالب خلال الشهر.
      </div>
    `;
    return;
  }

  monthlyRecords.forEach(m => {
    const card = document.createElement('div');
    card.style = "background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px;";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 14px;">
        <div style="font-weight: 900; font-size: 1.15rem; color: var(--primary-navy);">
          📅 سجل شهر: ${m.year_month}
        </div>
        <div>
          <span class="badge badge-purple">الهدف الشهري: ${m.monthly_target} قصص</span>
          <span class="badge badge-emerald">نسبة الإنجاز: ${m.achievement_pct}%</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-weight: 900; font-size: 1.3rem; color: var(--accent-emerald);">${m.approved_stories}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">القصص المعتمدة</div>
        </div>
        <div style="background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-weight: 900; font-size: 1.3rem; color: var(--accent-emerald);">${m.ar_stories}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">عربي 🇸🇦</div>
        </div>
        <div style="background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-weight: 900; font-size: 1.3rem; color: var(--accent-blue);">${m.en_stories}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">إنجليزي 🇬🇧</div>
        </div>
        <div style="background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-weight: 900; font-size: 1.3rem; color: var(--accent-gold);">${m.reading_days}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">أيام القراءة</div>
        </div>
        <div style="background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-weight: 900; font-size: 1.3rem; color: var(--accent-purple);">${m.avg_comprehension ? m.avg_comprehension : '—'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">متوسط الفهم (/4)</div>
        </div>
      </div>

      <div style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 8px;">
        📊 <strong>المقارنة بالشهر السابق:</strong> ${m.comparison_prev}
      </div>

      ${m.strengths ? `<div style="font-size: 0.88rem; color: #047857; margin-bottom: 6px;">✨ <strong>نقاط القوة:</strong> ${m.strengths}</div>` : ''}
      ${m.areas_for_improvement ? `<div style="font-size: 0.88rem; color: #b45309; margin-bottom: 6px;">🎯 <strong>مجالات التحسين:</strong> ${m.areas_for_improvement}</div>` : ''}
      ${m.next_month_goal ? `<div style="font-size: 0.88rem; color: #6b21a8; margin-bottom: 6px;">🚀 <strong>هدف الشهر القادم:</strong> ${m.next_month_goal}</div>` : ''}
      ${m.teacher_comment ? `<div style="font-size: 0.88rem; color: #334155; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">💬 <strong>تعليق المعلم:</strong> ${m.teacher_comment}</div>` : ''}
    `;
    container.appendChild(card);
  });
}

function renderStudentCriteriaBreakdown(logs) {
  const container = document.getElementById('profCriteriaBreakdown');
  if (!container) return;
  container.innerHTML = '';

  const approved = (logs || []).filter(l => l.status === 'معتمد');
  if (approved.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); padding: 20px; text-align: center;">لا توجد تقييمات معتمدة بعد لهذا الطالب.</div>`;
    return;
  }

  const c_keys = [
    { key: 'criteria_completion', name: '1. إكمال قراءة القصة' },
    { key: 'criteria_sequence', name: '2. فهم الأحداث وتسلسلها' },
    { key: 'criteria_main_idea', name: '3. تحديد الفكرة الرئيسية والقيمة' },
    { key: 'criteria_retelling', name: '4. إعادة سرد القصة بأسلوب الطالب' },
    { key: 'criteria_vocab', name: '5. اكتساب مفردات جديدة وتوظيفها' },
  ];

  c_keys.forEach(c => {
    const scores = approved.map(l => l[c.key]).filter(v => v !== null && v !== undefined && v > 0);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    const pct = Math.round((avg / 4) * 100);

    const div = document.createElement('div');
    div.style = "margin-bottom: 18px;";
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 6px;">
        <span>${c.name}:</span>
        <span>${avg} / 4 (${pct}%)</span>
      </div>
      <div class="progress-track" style="height: 12px;">
        <div class="progress-fill ${pct >= 75 ? 'progress-fill-emerald' : (pct >= 50 ? 'progress-fill-purple' : 'progress-fill-gold')}" style="width: ${pct}%;"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

async function saveStudentNotes(e) {
  e.preventDefault();
  if (!state.currentStudentId) return;

  const strengths = document.getElementById('editProfStrengths').value.trim();
  const improvements = document.getElementById('editProfImprovements').value.trim();
  const recommendations = document.getElementById('editProfRecommendations').value.trim();

  try {
    const res = await fetch(`/api/students/${state.currentStudentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strengths, improvements, recommendations })
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حفظ ملاحظات وتوصيات الطالب بنجاح');
      openStudentProfile(state.currentStudentId);
    }
  } catch (err) {
    showToast('خطأ في حفظ الملاحظات', true);
  }
}

// ==========================================
// STORIES LIBRARY (30 Arabic + 30 English)
// ==========================================

async function loadStories() {
  try {
    const res = await fetch('/api/stories');
    state.stories = await res.json();
    renderArabicStories();
    renderEnglishStories();
  } catch (err) {
    console.error('Error loading stories:', err);
  }
}

function renderArabicStories(search = '') {
  const grid = document.getElementById('arabicStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const arStories = state.stories.filter(s => s.language === 'ar' && (
    !search || s.title.includes(search) || s.value_theme.includes(search) || String(s.story_number).includes(search)
  ));

  arStories.forEach(s => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <div class="story-card-top">
        <div class="story-num-badge">#${s.story_number}</div>
        <span class="badge badge-emerald">🇸🇦 قصة عربية فصحى</span>
      </div>
      <div class="story-card-title">${s.title}</div>
      <div class="story-card-theme">💎 القيمة: ${s.value_theme}</div>
      <div class="story-card-excerpt">${s.content}</div>
      <div class="story-card-footer">
        <span style="font-size: 0.78rem; color: var(--text-muted);">قرأها <strong>${s.times_read || 0}</strong> طلاب</span>
        <button class="btn btn-sm btn-primary" onclick="openStoryReader(${s.id})">فتح وقراءة 📖</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderEnglishStories(search = '') {
  const grid = document.getElementById('englishStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const enStories = state.stories.filter(s => s.language === 'en' && (
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.value_theme.toLowerCase().includes(search.toLowerCase()) || String(s.story_number).includes(search)
  ));

  enStories.forEach(s => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <div class="story-card-top">
        <div class="story-num-badge">#${s.story_number}</div>
        <span class="badge badge-blue">🇬🇧 English Story</span>
      </div>
      <div class="story-card-title" dir="ltr" style="text-align: left;">${s.title}</div>
      <div class="story-card-theme" dir="ltr" style="text-align: left;">💎 Value: ${s.value_theme}</div>
      <div class="story-card-excerpt" dir="ltr" style="text-align: left;">${s.content}</div>
      <div class="story-card-footer">
        <span style="font-size: 0.78rem; color: var(--text-muted);">Read by <strong>${s.times_read || 0}</strong> students</span>
        <button class="btn btn-sm btn-primary" onclick="openStoryReader(${s.id})">Read Story 📖</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterStories(lang) {
  if (lang === 'ar') {
    const q = document.getElementById('arLibrarySearch')?.value.trim() || '';
    renderArabicStories(q);
  } else {
    const q = document.getElementById('enLibrarySearch')?.value.trim() || '';
    renderEnglishStories(q);
  }
}

// STORY READER MODAL
function openStoryReader(storyId) {
  const story = state.stories.find(s => s.id === storyId);
  if (!story) return;
  state.activeStoryForModal = story;

  document.getElementById('modalStoryNum').innerText = `#${story.story_number}`;
  document.getElementById('modalStoryTitle').innerText = story.title;
  document.getElementById('modalStoryTheme').innerText = `💎 القيمة التربوية: ${story.value_theme}`;

  const contentEl = document.getElementById('modalStoryContent');
  const isEn = story.language === 'en';
  contentEl.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  contentEl.style.textAlign = isEn ? 'left' : 'right';

  // Format paragraphs
  const paragraphs = story.content.split('\n\n').map(p => `<p style="margin-bottom: 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('');
  
  let questionsHtml = '';
  if (story.questions) {
    questionsHtml = `
      <div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: 18px; margin-top: 24px; border: 1px dashed #cbd5e1;">
        <h4 style="margin-bottom: 8px; color: var(--primary-navy);">${isEn ? '💡 Discussion Prompts & Reflection:' : '💡 إضاءات حوارية وتطبيقات عملية (برنامج حذق):'}</h4>
        <div style="white-space: pre-line; font-size: 0.95rem; color: var(--text-main);">${story.questions}</div>
      </div>
    `;
  }

  contentEl.innerHTML = paragraphs + questionsHtml;
  openModal('storyReaderModal');
}

let readerFontSize = 1.05;
function changeReaderFontSize(delta) {
  readerFontSize = Math.max(0.85, Math.min(1.5, readerFontSize + delta * 0.1));
  const el = document.getElementById('modalStoryContent');
  if (el) el.style.fontSize = `${readerFontSize}rem`;
}

function logFromStoryModal() {
  if (!state.activeStoryForModal) return;
  closeModal('storyReaderModal');
  showNewReadingModal(state.currentStudentId || null, state.activeStoryForModal);
}

// ==========================================
// READING REGISTRATION & VALIDATION
// ==========================================

function showNewReadingModal(studentId = null, prefillStory = null) {
  switchView('new-reading');
  populateReadingFormSelects();

  if (studentId) {
    document.getElementById('formStudentId').value = studentId;
  }

  if (prefillStory) {
    document.getElementById('formLanguage').value = prefillStory.language;
    onLanguageChange(prefillStory.language);
    document.getElementById('formLibraryStorySelect').value = prefillStory.id;
    document.getElementById('formTitle').value = prefillStory.title;
    document.getElementById('formMoralLesson').value = prefillStory.value_theme;
  }
}

function openLibraryReadingModalForCurrentStudent() {
  if (!state.currentStudentId) return;
  showNewReadingModal(state.currentStudentId);
}

function quickLogLibraryStory(storyId, lang, title) {
  const story = state.stories.find(s => s.id === storyId);
  showNewReadingModal(state.currentStudentId, story);
}

function populateReadingFormSelects() {
  // Students select
  const studentSelect = document.getElementById('formStudentId');
  if (studentSelect) {
    studentSelect.innerHTML = '<option value="">-- اختر الطالب --</option>';
    state.students.forEach(s => {
      studentSelect.innerHTML += `<option value="${s.id}">${s.stu_code} — ${s.full_name}</option>`;
    });
  }

  // Set default read date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('formDateRead').value = today;

  // Populate library dropdown based on language
  const lang = document.getElementById('formLanguage')?.value || 'ar';
  populateLibraryStoriesDropdown(lang);
}

function onLanguageChange(lang) {
  populateLibraryStoriesDropdown(lang);
}

function populateLibraryStoriesDropdown(lang) {
  const libSelect = document.getElementById('formLibraryStorySelect');
  if (!libSelect) return;
  libSelect.innerHTML = '<option value="">-- اختر قصة من مكتبة مُتقن المعتمدة --</option>';

  const filtered = state.stories.filter(s => s.language === lang);
  filtered.forEach(s => {
    libSelect.innerHTML += `<option value="${s.id}">#${s.story_number} - ${s.title} (${s.value_theme})</option>`;
  });
}

function onSelectLibraryStory(storyId) {
  if (!storyId) return;
  const s = state.stories.find(st => String(st.id) === String(storyId));
  if (s) {
    document.getElementById('formTitle').value = s.title;
    document.getElementById('formMoralLesson').value = s.value_theme;
    document.getElementById('formAuthor').value = 'مبادرة مُتقن — برنامج حذق';
  }
}

function setFormCriterion(criterion, val) {
  state.formCriteria[criterion] = val;
  const group = document.querySelector(`.rating-buttons-group[data-criterion="${criterion}"]`);
  if (group) {
    group.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
  }
}

async function submitReadingLog(e, allowDuplicate = false) {
  e.preventDefault();

  const student_id = parseInt(document.getElementById('formStudentId').value);
  const language = document.getElementById('formLanguage').value;
  const story_id = document.getElementById('formLibraryStorySelect').value ? parseInt(document.getElementById('formLibraryStorySelect').value) : null;
  const title = document.getElementById('formTitle').value.trim();
  const author = document.getElementById('formAuthor').value.trim();
  const date_read = document.getElementById('formDateRead').value;
  const date_logged = new Date().toISOString().split('T')[0];
  const pages_count = parseInt(document.getElementById('formPagesCount').value) || 1;
  const reading_minutes = parseInt(document.getElementById('formReadingMinutes').value) || 10;
  const reading_type = document.getElementById('formReadingType').value;
  const summary = document.getElementById('formSummary').value.trim();
  const characters = document.getElementById('formCharacters').value.trim();
  const moral_lesson = document.getElementById('formMoralLesson').value.trim();
  const new_vocabulary = document.getElementById('formNewVocabulary').value.trim();
  const teacher_notes = document.getElementById('formTeacherNotes').value.trim();
  const status = document.getElementById('formStatus').value;
  const proof_attachment = document.getElementById('formProofUrl').value.trim();

  // Calculate comprehension overall rating
  const c = state.formCriteria;
  const validScores = [c.completion, c.sequence, c.main_idea, c.retelling, c.vocab].filter(v => v !== null && v > 0);
  const comprehension_rating = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;

  const payload = {
    student_id,
    story_id,
    language,
    title,
    author,
    date_read,
    date_logged,
    pages_count,
    reading_minutes,
    reading_type,
    summary,
    characters,
    moral_lesson,
    new_vocabulary,
    comprehension_rating,
    retelling_rating: c.retelling,
    criteria_completion: c.completion,
    criteria_sequence: c.sequence,
    criteria_main_idea: c.main_idea,
    criteria_retelling: c.retelling,
    criteria_vocab: c.vocab,
    teacher_notes,
    status,
    proof_attachment,
    allow_duplicate: allowDuplicate
  };

  try {
    const res = await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status === 409) {
      const conflict = await res.json();
      if (confirm(`تنبيه تكرار: ${conflict.message}\n\nهل ترغب في تسجيل القصة كقراءة إضافية؟`)) {
        return submitReadingLog(e, true);
      }
      return;
    }

    const data = await res.json();
    if (data.success) {
      showToast('تم حفظ واعتماد القصة بنجاح في قاعدة البيانات!');
      resetReadingForm();
      loadStudents();
      loadDashboard();
      if (state.currentStudentId) {
        openStudentProfile(state.currentStudentId);
      } else {
        switchView('dashboard');
      }
    } else {
      showToast(data.error || 'حدث خطأ في التسجيل', true);
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', true);
  }
}

function resetReadingForm() {
  document.getElementById('readingLogForm').reset();
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('formDateRead').value = today;
}

async function approveReadingLog(readingId) {
  try {
    const res = await fetch(`/api/readings/${readingId}/approve`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('تم اعتماد القصة وإضافتها لرصيد الطالب والشارات!');
      if (state.currentStudentId) openStudentProfile(state.currentStudentId);
      loadDashboard();
      loadStudents();
    }
  } catch (err) {
    showToast('تعذر اعتماد القصة', true);
  }
}

async function deleteReadingLog(readingId) {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً؟')) return;
  try {
    const res = await fetch(`/api/readings/${readingId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف السجل بنجاح');
      if (state.currentStudentId) openStudentProfile(state.currentStudentId);
      loadDashboard();
      loadStudents();
    }
  } catch (err) {
    showToast('تعذر الحذف', true);
  }
}

// ==========================================
// MONTHLY TRACKING & EVALUATIONS
// ==========================================

async function loadMonthlyTrackingData(yearMonth = '2026-10') {
  try {
    const res = await fetch('/api/students');
    const students = await res.json();
    const tbody = document.getElementById('monthlyTrackingTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    students.forEach(st => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge badge-purple">${st.stu_code}</span></td>
        <td><strong style="color: var(--primary-navy); cursor: pointer;" onclick="openStudentProfile(${st.id})">${st.full_name}</strong></td>
        <td><strong style="color: var(--accent-emerald); font-size: 1.1rem;">${st.approved_count || 0}</strong></td>
        <td><span class="badge badge-emerald">🇸🇦 ${st.ar_approved || 0}</span></td>
        <td><span class="badge badge-blue">🇬🇧 ${st.en_approved || 0}</span></td>
        <td>${Math.round(((st.approved_count || 0) / 8) * 100)}%</td>
        <td>${st.total_readings || 0} أيام</td>
        <td>—</td>
        <td><span style="font-size: 0.8rem; color: var(--text-muted);">الشهر الأول في الفصل</span></td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${st.recommendations || 'انتظام جيد'}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="openMonthlyNoteModal(${st.id})">تدوين تقرير ✍️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading monthly tracking:', err);
  }
}

function openMonthlyNoteModal(studentId) {
  document.getElementById('modalNoteStudentId').value = studentId;
  openModal('monthlyNoteModal');
}

async function submitMonthlyNote(e) {
  e.preventDefault();
  const student_id = parseInt(document.getElementById('modalNoteStudentId').value);
  const year_month = document.getElementById('modalNoteYearMonth').value;
  const strengths = document.getElementById('modalNoteStrengths').value.trim();
  const areas_for_improvement = document.getElementById('modalNoteImprovements').value.trim();
  const next_month_goal = document.getElementById('modalNoteNextGoal').value.trim();
  const teacher_comment = document.getElementById('modalNoteComment').value.trim();

  try {
    const res = await fetch('/api/monthly/save_note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, year_month, strengths, areas_for_improvement, next_month_goal, teacher_comment })
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حفظ التقرير الشهري بنجاح!');
      closeModal('monthlyNoteModal');
      if (state.currentStudentId) openStudentProfile(state.currentStudentId);
    }
  } catch (err) {
    showToast('خطأ في حفظ التقرير', true);
  }
}

async function loadEvaluations() {
  try {
    const res = await fetch('/api/evaluations');
    const data = await res.json();

    // Render cards for averages
    const cardsContainer = document.getElementById('evalCriteriaCards');
    if (cardsContainer) {
      const avgs = data.averages;
      cardsContainer.innerHTML = `
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 900; color: #047857;">${avgs.completion} / 4</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #065f46;">1. إكمال القراءة</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 900; color: #1d4ed8;">${avgs.sequence} / 4</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #1e40af;">2. تسلسل الأحداث</div>
        </div>
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 14px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 900; color: #7e22ce;">${avgs.main_idea} / 4</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #6b21a8;">3. الفكرة الرئيسية</div>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 14px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 900; color: #b45309;">${avgs.retelling} / 4</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #92400e;">4. إعادة السرد</div>
        </div>
        <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 14px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 900; color: #be185d;">${avgs.vocab} / 4</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #9d174d;">5. الثروة اللغوية</div>
        </div>
      `;
    }

    // Render table
    const tbody = document.getElementById('evaluationsTbody');
    if (tbody) {
      tbody.innerHTML = '';
      data.students.forEach(st => {
        const tr = document.createElement('tr');
        const sc = st.avg_score || 0;
        let badge = '<span class="badge badge-gray">لم يُقيّم بعد</span>';
        if (sc >= 3.5) badge = '<span class="badge badge-emerald">متقن بتميز ⭐</span>';
        else if (sc >= 2.8) badge = '<span class="badge badge-purple">متقن ✅</span>';
        else if (sc >= 2.0) badge = '<span class="badge badge-gold">في طور التطور 🌱</span>';
        else if (sc > 0) badge = '<span class="badge badge-rose">يحتاج دعماً ⚠️</span>';

        tr.innerHTML = `
          <td><span class="badge badge-purple">${st.stu_code}</span></td>
          <td><strong style="color: var(--primary-navy); cursor: pointer;" onclick="openStudentProfile(${st.id})">${st.full_name}</strong></td>
          <td>${st.evaluated_count || 0}</td>
          <td><strong>${st.avg_score ? st.avg_score + ' / 4' : '—'}</strong></td>
          <td>${st.c_completion || '—'}</td>
          <td>${st.c_sequence || '—'}</td>
          <td>${st.c_main_idea || '—'}</td>
          <td>${st.c_retelling || '—'}</td>
          <td>${st.c_vocab || '—'}</td>
          <td>${badge}</td>
        `;
        tbody.appendChild(tr);
      });
    }

  } catch (err) {
    console.error('Error loading evaluations:', err);
  }
}

// ==========================================
// BADGES CATALOG
// ==========================================

function renderBadgesCatalog() {
  const container = document.getElementById('badgesMasterContainer');
  if (!container) return;
  container.innerHTML = '';

  const badges = [
    { icon: '🌱', title: 'قارئ مبتدئ', desc: 'تُمنح للطالب فور إكمال واعتماد أول قصة له في المبادرة بنجاح.' },
    { icon: '🌟', title: 'عشر قصص', desc: 'تُمنح عند إتمام قراءة 10 قصص معتمدة بالعربية أو الإنجليزية.' },
    { icon: '🏆', title: 'عشرون قصة', desc: 'تُمنح عند قطع ثلثي الطريق القرائي وإتمام 20 قصة معتمدة.' },
    { icon: '👑', title: 'بطل الثلاثين قصة', desc: 'الوسام الأسمى للمبادرة عند إتمام الهدف الرسمي كاملاً (30 قصة).' },
    { icon: '📖', title: 'قارئ العربية المتميز', desc: 'تُمنح عند إتقان قراءة 10 قصص فأكثر باللغة العربية الفصحى.' },
    { icon: '🌍', title: 'قارئ الإنجليزية المتميز', desc: 'تُمنح عند إتقان قراءة 10 قصص فأكثر باللغة الإنجليزية.' },
    { icon: '⚡', title: 'الاستمرارية القرائية', desc: 'تُمنح للطالب الذي يسجل نشاط قراءة منتظم عبر أسابيع الفصل.' }
  ];

  badges.forEach(b => {
    const card = document.createElement('div');
    card.className = 'badge-achievement-card unlocked';
    card.innerHTML = `
      <div class="badge-achievement-icon">${b.icon}</div>
      <div class="badge-achievement-title">${b.title}</div>
      <div class="badge-achievement-desc">${b.desc}</div>
      <div style="margin-top: 10px;">
        <span class="badge badge-emerald">شارة معتمدة</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// PRINTABLE CARD & CERTIFICATE
// ==========================================

function openPrintableCardModal() {
  if (!state.currentStudent) return;
  const s = state.currentStudent;
  const container = document.getElementById('printableCardContent');
  if (!container) return;

  const isCompleted30 = (s.approved_count >= 30);

  container.innerHTML = `
    <div class="printable-card-preview">
      <img src="img/logo.png" alt="شعار إتقان التربية" class="certificate-banner-logo">
      <div style="font-size: 0.9rem; color: #6b21a8; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">
        بَرْنَامَجُ حِذْق — مُبَادَرَاتُ المُلْهِم التَّرْبَوِيّ
      </div>
      <h2 style="font-size: 1.85rem; font-weight: 900; color: #0f1e36; margin-bottom: 4px;">
        ${isCompleted30 ? 'شَهَادَةُ إِتْمَامِ وَتَفَوُّقِ قِرَائِيّ' : 'بِطَاقَةُ إِنجَازِ طَالِبٍ مُتْقِن'}
      </h2>
      <div style="font-size: 1.1rem; color: #d97706; font-weight: 800; margin-bottom: 18px;">
        مُبَادَرَةُ «مُتْقَن» | رِحْلَةُ 30 قِصَّة
      </div>
      <p style="font-size: 1rem; color: #334155; line-height: 1.8; margin-bottom: 20px;">
        تَشْهَدُ إدارة المبادرة بأن الطالب النجيب:
        <br>
        <span style="font-size: 1.6rem; font-weight: 900; color: #0f1e36; display: inline-block; padding: 6px 16px; border-bottom: 2px solid #d97706; margin: 8px 0;">
          ${s.full_name}
        </span>
        <br>
        (الرقم التعريفي: <strong>${s.stu_code}</strong> — الصف الرابع الابتدائي)
        <br>
        قد أتم قراءة واعتماد <strong style="color: #059669; font-size: 1.25rem;">${s.approved_count}</strong> قصة
        (🇸🇦 ${s.ar_count} باللغة العربية • 🇬🇧 ${s.en_count} باللغة الإنجليزية)
        بنسبة إنجاز بلغت <strong style="color: #6b21a8; font-size: 1.25rem;">${s.achievement_pct}%</strong> نحو هدف المبادرة.
      </p>

      <div style="display: flex; justify-content: center; gap: 14px; margin-bottom: 24px;">
        ${s.badges && s.badges.length > 0 ? s.badges.map(b => `<span style="font-size: 1.8rem;" title="${b.badge_title}">${b.badge_icon}</span>`).join('') : '<span style="color: #94a3b8;">في طور جمع الشارات</span>'}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 36px; padding: 0 20px; font-weight: 700; color: #475569;">
        <div>
          تاريخ الإصدار:<br>
          <span style="color: #0f1e36;">${new Date().toLocaleDateString('ar-SA')}</span>
        </div>
        <div>
          المعلم المشرف:<br>
          <span style="color: #0f1e36;">معلم مبادرة مُتقن</span>
        </div>
        <div>
          الختم والاعتماد:<br>
          <span style="color: #6b21a8;">إتقان التربية — برنامج حذق</span>
        </div>
      </div>
    </div>
  `;

  openModal('printableCardModal');
}

// ==========================================
// REPORTS GENERATOR
// ==========================================

function populateReportsStudentSelect() {
  const sel = document.getElementById('reportStudentSelect');
  if (!sel) return;
  sel.innerHTML = '';
  state.students.forEach(s => {
    sel.innerHTML += `<option value="${s.id}">${s.stu_code} - ${s.full_name}</option>`;
  });
}

function generateStudentReport() {
  const sel = document.getElementById('reportStudentSelect');
  if (!sel || !sel.value) return;
  openStudentProfile(parseInt(sel.value));
}

function exportStudentsCsv() {
  window.location.href = '/api/export/csv';
}

// ==========================================
// INITIATIVE SETTINGS
// ==========================================

async function saveInitiativeSettings(e) {
  e.preventDefault();
  const payload = {
    total_goal: document.getElementById('settingTotalGoal').value,
    monthly_target: document.getElementById('settingMonthlyTarget').value,
    ar_target_flexible: document.getElementById('settingArTarget').value,
    en_target_flexible: document.getElementById('settingEnTarget').value,
    semester_start: document.getElementById('settingSemesterStart').value,
    semester_end: document.getElementById('settingSemesterEnd').value,
    teacher_pin: document.getElementById('settingTeacherPin').value
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حفظ وتحديث إعدادات المبادرة بنجاح');
      loadSettings();
      loadDashboard();
      loadStudents();
    }
  } catch (err) {
    showToast('خطأ في حفظ الإعدادات', true);
  }
}

// ==========================================
// BACKUP & RESTORE
// ==========================================

async function downloadBackupJson() {
  try {
    const res = await fetch('/api/export/backup');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutqan_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل النسخة الاحتياطية بنجاح');
  } catch (err) {
    showToast('تعذر تنزيل النسخة الاحتياطية', true);
  }
}

async function uploadBackupJson() {
  const fileInput = document.getElementById('backupFileInput');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('يرجى اختيار ملف نسخة احتياطية أولاً (.json)');
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const res = await fetch('/api/import/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        showToast('تم استعادة البيانات بنجاح!');
        loadStudents();
        loadDashboard();
        loadStories();
      } else {
        showToast('تعذر استيراد الملف', true);
      }
    } catch (err) {
      showToast('الملف غير صالح', true);
    }
  };
  reader.readAsText(file);
}

// ==========================================
// ADD STUDENT MODAL
// ==========================================

function showAddStudentModal() {
  openModal('addStudentModal');
}

async function submitAddStudent(e) {
  e.preventDefault();
  const full_name = document.getElementById('addStudentFullName').value.trim();
  if (!full_name) return;

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name })
    });
    const data = await res.json();
    if (data.success) {
      showToast('تمت إضافة الطالب بنجاح');
      closeModal('addStudentModal');
      document.getElementById('addStudentFullName').value = '';
      loadStudents();
      loadDashboard();
    }
  } catch (err) {
    showToast('خطأ في إضافة الطالب', true);
  }
}

// ==========================================
// AUTH / LOGIN
// ==========================================

function openLoginModal() {
  openModal('loginModal');
}

async function performLogin() {
  const pin = document.getElementById('loginPinInput').value.trim();
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم تسجيل الدخول بنجاح كمعلم مشرف');
      closeModal('loginModal');
      document.getElementById('loginPinInput').value = '';
    } else {
      showToast('رمز PIN غير صحيح', true);
    }
  } catch (err) {
    showToast('خطأ في الاتصال', true);
  }
}

// ==========================================
// MODAL HELPERS
// ==========================================

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});
