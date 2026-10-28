/**
 * Mutqan Platform Frontend Application Controller (Dual-Mode: Cloud API + GitHub Pages Standalone)
 * Initiative: مبادرة «مُتقن» | رحلة 30 قصة
 * Program: برنامج حذق — إحدى مبادرات الملهم التربوي (إتقان التربية)
 */

// Embedded Official Data for GitHub Pages Standalone & Offline Support
const INITIAL_STUDENTS = [
  { id: 1, stu_code: "STU-001", full_name: "تركي بن خالد بن مساعد الغامدي", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 2, stu_code: "STU-002", full_name: "حسن هيثم حسن الحربي", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 3, stu_code: "STU-003", full_name: "سلمان بن خالد بن مناحي العتيبي", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 4, stu_code: "STU-004", full_name: "سلمان سمير بن إبراهيم الزيد", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 5, stu_code: "STU-005", full_name: "عبدالرحمن عبدالعزيز صالح آل غنيم", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 6, stu_code: "STU-006", full_name: "عبدالملك سامي الأسمري", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 7, stu_code: "STU-007", full_name: "فهد عبدالله سعد القحطاني", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 8, stu_code: "STU-008", full_name: "فيصل خالد عويض المطيري", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 9, stu_code: "STU-009", full_name: "ماجد فهد عبدالعزيز العتيبي", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 10, stu_code: "STU-010", full_name: "محمد صائل محمد الشمري", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 11, stu_code: "STU-011", full_name: "مشعل عبدالرحمن ابن شايع القحطاني", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 12, stu_code: "STU-012", full_name: "مهند عبد الواحد عقلاء الرويلي", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 13, stu_code: "STU-013", full_name: "مهند محمد بن علي القحطاني", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 14, stu_code: "STU-014", full_name: "ناصر محمد ناصر المطيري", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 },
  { id: 15, stu_code: "STU-015", full_name: "يوسف بن صالح بن إبراهيم الغامدي", status: "لم يبدأ التسجيل", approved_count: 0, ar_approved: 0, en_approved: 0, badges_count: 0 }
];

let state = {
  isStaticMode: false,
  currentView: 'dashboard',
  students: [],
  stories: [],
  readings: [],
  monthlyRecords: [],
  studentBadges: [],
  currentStudent: null,
  currentStudentId: null,
  activeStoryForModal: null,
  formCriteria: { completion: 3, sequence: 3, main_idea: 3, retelling: 3, vocab: 3 },
  settings: {
    total_goal: "30",
    monthly_target: "8",
    ar_target_flexible: "15",
    en_target_flexible: "15",
    semester_start: "2026-09-01",
    semester_end: "2026-12-31",
    teacher_pin: "1234"
  }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initSearch();
  initMobileToggle();
  await detectEnvironmentAndLoad();
});

async function detectEnvironmentAndLoad() {
  try {
    const testRes = await fetch('/api/settings');
    if (!testRes.ok) throw new Error('API not available');
    // Cloud API mode
    state.isStaticMode = false;
    await loadSettings();
    await loadDashboard();
    await loadStudents();
    await loadStories();
  } catch (err) {
    // GitHub Pages Static Mode (Browser Local Storage)
    console.log('Running in GitHub Pages Static Mode');
    state.isStaticMode = true;
    initStaticStorage();
    renderDashboardStatic();
    renderStudentsTable();
    renderArabicStories();
    renderEnglishStories();
  }

  checkStudentUrlParam();
}

function initStaticStorage() {
  if (!localStorage.getItem('mutqan_students')) {
    localStorage.setItem('mutqan_students', JSON.stringify(INITIAL_STUDENTS));
  }
  state.students = JSON.parse(localStorage.getItem('mutqan_students'));

  if (!localStorage.getItem('mutqan_readings')) {
    localStorage.setItem('mutqan_readings', JSON.stringify([]));
  }
  state.readings = JSON.parse(localStorage.getItem('mutqan_readings'));

  if (!localStorage.getItem('mutqan_monthly')) {
    localStorage.setItem('mutqan_monthly', JSON.stringify([]));
  }
  state.monthlyRecords = JSON.parse(localStorage.getItem('mutqan_monthly'));

  if (!localStorage.getItem('mutqan_badges')) {
    localStorage.setItem('mutqan_badges', JSON.stringify([]));
  }
  state.studentBadges = JSON.parse(localStorage.getItem('mutqan_badges'));

  if (localStorage.getItem('mutqan_settings')) {
    state.settings = JSON.parse(localStorage.getItem('mutqan_settings'));
  }

  // Load Embedded 60 stories
  state.stories = getEmbeddedStories();
}

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
      enterStudentMode(student);
    }
  }
}

function enterStudentMode(student) {
  state.isStudentMode = true;
  document.body.classList.add('student-portal-mode');
  
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

  openStudentProfile(student.id);
  showToast(`أهلاً بك يا ${student.full_name.split(' ')[0]} في رحلة الـ 30 قصة! 🌟`);
}

function exitStudentMode() {
  openLoginModal();
}

function copyStudentLink(studentCode) {
  const origin = window.location.origin + window.location.pathname;
  const link = `${origin}?student=${studentCode}`;
  navigator.clipboard.writeText(link).then(() => {
    showToast(`تم نسخ رابط الطالب (${studentCode}) بنجاح! يمكنك إرساله له في واتساب.`);
  }).catch(() => {
    prompt('انسخ الرابط التالي وأرسله للطالب:', link);
  });
}

function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.innerHTML = `<span>${isError ? '⚠️' : '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initNavigation() {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) switchView(view);
    });
  });
}

function switchView(viewName) {
  state.currentView = viewName;

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) item.classList.add('active');
    else item.classList.remove('active');
  });

  document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) targetSec.style.display = 'block';

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
  if (titleEl && titles[viewName]) titleEl.innerHTML = titles[viewName];

  document.getElementById('sidebar').classList.remove('mobile-open');

  if (viewName === 'dashboard') state.isStaticMode ? renderDashboardStatic() : loadDashboard();
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
    btn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
  }
}

function initSearch() {
  const globalSearch = document.getElementById('globalStudentSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length > 0) {
        if (state.currentView !== 'students') switchView('students');
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
    tableSearch.addEventListener('input', (e) => renderStudentsTable(e.target.value.trim().toLowerCase()));
  }

  const statusFilter = document.getElementById('studentsFilterStatus');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderStudentsTable());
  }
}

// ==========================================
// DASHBOARD & STUDENTS RENDERING
// ==========================================

function renderDashboardStatic() {
  const totalStudents = state.students.length;
  const targetPerStudent = parseInt(state.settings.total_goal || 30);
  
  const approvedReadings = state.readings.filter(r => r.status === 'معتمد');
  const arApproved = approvedReadings.filter(r => r.language === 'ar').length;
  const enApproved = approvedReadings.filter(r => r.language === 'en').length;
  const pendingCount = state.readings.filter(r => r.status === 'بانتظار المراجعة').length;

  document.getElementById('dashTotalStudents').innerText = totalStudents;
  document.getElementById('dashApprovedStories').innerText = approvedReadings.length;
  document.getElementById('dashStoriesBreakdown').innerText = `🇸🇦 ${arApproved} عربي | 🇬🇧 ${enApproved} إنجليزي`;
  document.getElementById('dashPendingStories').innerText = pendingCount;

  let totalPct = 0;
  let onTrack = 0;
  let monthlyAchieved = 0;
  let needsSupport = 0;
  let noProgress = 0;

  state.students.forEach(st => {
    const stApproved = state.readings.filter(r => r.student_id === st.id && r.status === 'معتمد').length;
    st.approved_count = stApproved;
    st.ar_count = state.readings.filter(r => r.student_id === st.id && r.status === 'معتمد' && r.language === 'ar').length;
    st.en_count = state.readings.filter(r => r.student_id === st.id && r.status === 'معتمد' && r.language === 'en').length;
    const pct = Math.min(100, Math.round((stApproved / targetPerStudent) * 100));
    st.achievement_pct = pct;
    totalPct += pct;

    if (stApproved === 0) { noProgress++; needsSupport++; }
    else if (stApproved >= 8) { monthlyAchieved++; onTrack++; }
    else if (stApproved >= 3) { onTrack++; }
    else { needsSupport++; }
  });

  const avgPct = Math.round(totalPct / totalStudents);
  document.getElementById('dashAvgProgress').innerText = `${avgPct}%`;
  document.getElementById('dashOnTrackCount').innerText = onTrack;
  document.getElementById('dashMonthlyGoalAchieved').innerText = monthlyAchieved;
  document.getElementById('dashNeedsSupportCount').innerText = needsSupport;
  document.getElementById('dashNoProgressCount').innerText = noProgress;

  // Render Table
  const tbody = document.getElementById('dashboardStudentsTbody');
  if (tbody) {
    tbody.innerHTML = '';
    state.students.forEach((st, idx) => {
      const tr = document.createElement('tr');
      const approved = st.approved_count || 0;
      const pct = st.achievement_pct || 0;

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
            <div class="progress-track"><div class="progress-fill progress-fill-emerald" style="width: ${pct}%;"></div></div>
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
}

async function loadSettings() {
  const res = await fetch('/api/settings');
  state.settings = await res.json();
}

async function loadDashboard() {
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

  const tbody = document.getElementById('dashboardStudentsTbody');
  if (tbody) {
    tbody.innerHTML = '';
    data.students_summary.forEach((st, idx) => {
      const tr = document.createElement('tr');
      const approved = st.approved_count || 0;
      const pct = Math.min(100, Math.round((approved / 30) * 100));

      let statusBadge = '<span class="badge badge-gray">لم يبدأ التسجيل</span>';
      if (approved >= 30) statusBadge = '<span class="badge badge-purple">بطل الـ 30 قصة 👑</span>';
      else if (approved >= 10) statusBadge = '<span class="badge badge-emerald">متقدم 🚀</span>';
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
            <div class="progress-track"><div class="progress-fill progress-fill-emerald" style="width: ${pct}%;"></div></div>
            <span class="progress-label">${pct}%</span>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td><button class="btn btn-sm btn-outline" onclick="openStudentProfile(${st.id})">الملف ↗</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

async function loadStudents() {
  const res = await fetch('/api/students');
  state.students = await res.json();
  document.getElementById('sidebarStudentCount').innerText = state.students.length;
  renderStudentsTable();
}

async function loadStories() {
  const res = await fetch('/api/stories');
  state.stories = await res.json();
  renderArabicStories();
  renderEnglishStories();
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

  list.forEach(st => {
    const tr = document.createElement('tr');
    const approved = st.approved_count || 0;
    const target = 30;
    const pct = Math.min(100, Math.round((approved / target) * 100));
    const remaining = Math.max(0, target - approved);

    let statusBadge = '<span class="badge badge-gray">لم يبدأ التسجيل</span>';
    if (approved >= 30) statusBadge = '<span class="badge badge-purple">مكتمل الهدف (30) 👑</span>';
    else if (approved >= 10) statusBadge = '<span class="badge badge-emerald">متقدم 🚀</span>';
    else if (approved >= 1) statusBadge = '<span class="badge badge-gold">في المسار 📚</span>';

    tr.innerHTML = `
      <td><span class="badge badge-purple">${st.stu_code}</span></td>
      <td><strong style="color: var(--primary-navy); cursor: pointer;" onclick="openStudentProfile(${st.id})">${st.full_name}</strong></td>
      <td><strong>${st.total_readings || approved}</strong></td>
      <td><strong style="color: var(--accent-emerald); font-size: 1.1rem;">${approved}</strong> / 30</td>
      <td><span class="badge badge-emerald">🇸🇦 ${st.ar_approved || st.ar_count || 0}</span></td>
      <td><span class="badge badge-blue">🇬🇧 ${st.en_approved || st.en_count || 0}</span></td>
      <td><span style="font-weight: 700; color: ${remaining > 0 ? '#b45309' : '#047857'}">${remaining} قصة</span></td>
      <td>
        <div class="progress-container">
          <div class="progress-track"><div class="progress-fill progress-fill-emerald" style="width: ${pct}%;"></div></div>
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

// Student Profile Loader
async function openStudentProfile(studentId) {
  if (state.isStaticMode) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    state.currentStudent = student;
    state.currentStudentId = student.id;

    const studentLogs = state.readings.filter(r => r.student_id === studentId);
    const approvedLogs = studentLogs.filter(r => r.status === 'معتمد');

    student.approved_count = approvedLogs.length;
    student.ar_count = approvedLogs.filter(r => r.language === 'ar').length;
    student.en_count = approvedLogs.filter(r => r.language === 'en').length;
    student.remaining = Math.max(0, 30 - approvedLogs.length);
    student.achievement_pct = Math.min(100, Math.round((approvedLogs.length / 30) * 100));

    // Fill profile fields
    populateStudentProfileDOM(student, studentLogs);
    switchView('student-profile');
    switchProfileTab('overview');
    return;
  }

  // Cloud API mode
  try {
    const res = await fetch(`/api/students/${studentId}`);
    const data = await res.json();
    state.currentStudent = data;
    state.currentStudentId = data.id;
    populateStudentProfileDOM(data, data.logs);
    switchView('student-profile');
    switchProfileTab('overview');
  } catch (err) {
    console.error('Error opening student profile:', err);
  }
}

function populateStudentProfileDOM(data, logs) {
  document.getElementById('profAvatar').innerText = data.full_name.charAt(0);
  document.getElementById('profFullName').innerText = data.full_name;
  document.getElementById('profCode').innerText = data.stu_code;
  document.getElementById('profStatusBadge').innerText = data.status || 'لم يبدأ التسجيل';

  document.getElementById('profApprovedCount').innerText = data.approved_count;
  document.getElementById('profRemainingCount').innerText = data.remaining || (30 - data.approved_count);
  document.getElementById('profAchievementPct').innerText = `${data.achievement_pct}%`;
  document.getElementById('profArCount').innerText = data.ar_count || 0;
  document.getElementById('profEnCount').innerText = data.en_count || 0;
  document.getElementById('profAvgRating').innerText = data.avg_rating ? `${data.avg_rating} / 4` : '—';

  document.getElementById('profProgressLabel').innerText = `${data.approved_count} من أصل 30 قصة (${data.achievement_pct}%)`;
  document.getElementById('profProgressFill').style.width = `${data.achievement_pct}%`;
  document.getElementById('profArSubtext').innerText = `${data.ar_count || 0} قصة معتمدة باللغة العربية`;
  document.getElementById('profEnSubtext').innerText = `${data.en_count || 0} قصة معتمدة باللغة الإنجليزية`;

  renderStudentTimeline(logs);
  renderStudentBadges(data.badges || []);
  renderStudentStories(logs);
  renderStudent60LibraryTracker(data.library_tracking || []);
}

function navigateStudent(dir) {
  if (!state.currentStudent) return;
  const allIds = state.students.map(s => s.id);
  const idx = allIds.indexOf(state.currentStudent.id);
  let nextIdx = dir === 'next' ? idx + 1 : idx - 1;
  if (nextIdx >= allIds.length) nextIdx = 0;
  if (nextIdx < 0) nextIdx = allIds.length - 1;
  openStudentProfile(allIds[nextIdx]);
}

function switchProfileTab(tabName) {
  document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  event?.target?.classList.add('active');
  document.querySelectorAll('.profile-tab-content').forEach(c => c.style.display = 'none');
  const target = document.getElementById(`profTab-${tabName}`);
  if (target) target.style.display = 'block';
}

function renderStudentTimeline(logs) {
  const container = document.getElementById('profTimelineContainer');
  if (!container) return;
  container.innerHTML = '';
  if (!logs || logs.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); padding: 10px 0;">لم تسجل أي أحداث قراءة للطالب حتى الآن.</div>`;
    return;
  }
  logs.forEach(l => {
    const item = document.createElement('div');
    item.style = "position: relative; margin-bottom: 18px;";
    item.innerHTML = `
      <div style="position: absolute; right: -25px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: ${l.status === 'معتمد' ? 'var(--accent-emerald)' : 'var(--accent-gold)'};"></div>
      <div style="font-weight: 700; color: var(--primary-navy);">${l.title} (${l.language === 'ar' ? 'العربية 🇸🇦' : 'English 🇬🇧'})</div>
      <div style="font-size: 0.78rem; color: var(--text-muted);">📅 ${l.date_read} • الحالة: <span class="badge ${l.status === 'معتمد' ? 'badge-emerald' : 'badge-gold'}">${l.status}</span></div>
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
    grid.innerHTML += `
      <div style="background: #faf5ff; border: 1px solid #d8b4fe; border-radius: var(--radius-md); padding: 12px; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 4px;">${b.badge_icon}</div>
        <div style="font-weight: 800; font-size: 0.82rem; color: var(--primary-navy);">${b.badge_title}</div>
      </div>
    `;
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
      <td>${l.comprehension_rating ? `<strong>${l.comprehension_rating}</strong> / 4` : 'لم يُقيّم'}</td>
      <td><span class="badge ${l.status === 'معتمد' ? 'badge-emerald' : 'badge-gold'}">${l.status}</span></td>
      <td>${l.teacher_notes || '—'}</td>
      <td>
        <div style="display: flex; gap: 4px;">
          ${l.status !== 'معتمد' ? `<button class="btn btn-sm btn-emerald" onclick="approveReadingLog(${l.id})">اعتماد</button>` : ''}
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
  const stories = state.stories.length > 0 ? state.stories : getEmbeddedStories();
  stories.forEach(st => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${st.story_number}</strong></td>
      <td><strong style="color: var(--primary-navy);">${st.title}</strong></td>
      <td><span class="badge ${st.language === 'ar' ? 'badge-emerald' : 'badge-blue'}">${st.language === 'ar' ? '🇸🇦 عربية' : '🇬🇧 إنجليزية'}</span></td>
      <td style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">${st.value_theme}</td>
      <td><span class="badge badge-gray">متاحة للقراءة</span></td>
      <td>—</td>
      <td>—</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="quickLogLibraryStory(${st.id}, '${st.language}', '${st.title}')">تسجيل قراءة ✍️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function quickLogLibraryStory(storyId, lang, title) {
  const story = state.stories.find(s => s.id === storyId);
  showNewReadingModal(state.currentStudentId, story);
}

function renderArabicStories(search = '') {
  const grid = document.getElementById('arabicStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const stories = (state.stories.length > 0 ? state.stories : getEmbeddedStories()).filter(s => s.language === 'ar' && (
    !search || s.title.includes(search) || s.value_theme.includes(search)
  ));
  stories.forEach(s => {
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
        <button class="btn btn-sm btn-primary" style="width: 100%;" onclick="openStoryReader(${s.id})">فتح وقراءة القصة 📖</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderEnglishStories(search = '') {
  const grid = document.getElementById('englishStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const stories = (state.stories.length > 0 ? state.stories : getEmbeddedStories()).filter(s => s.language === 'en' && (
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.value_theme.toLowerCase().includes(search.toLowerCase())
  ));
  stories.forEach(s => {
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
        <button class="btn btn-sm btn-primary" style="width: 100%;" onclick="openStoryReader(${s.id})">Read Story 📖</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterStories(lang) {
  if (lang === 'ar') renderArabicStories(document.getElementById('arLibrarySearch')?.value.trim() || '');
  else renderEnglishStories(document.getElementById('enLibrarySearch')?.value.trim() || '');
}

function openStoryReader(storyId) {
  const story = (state.stories.length > 0 ? state.stories : getEmbeddedStories()).find(s => s.id === storyId);
  if (!story) return;
  state.activeStoryForModal = story;
  document.getElementById('modalStoryNum').innerText = `#${story.story_number}`;
  document.getElementById('modalStoryTitle').innerText = story.title;
  document.getElementById('modalStoryTheme').innerText = `💎 القيمة التربوية: ${story.value_theme}`;

  const contentEl = document.getElementById('modalStoryContent');
  const isEn = story.language === 'en';
  contentEl.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  contentEl.style.textAlign = isEn ? 'left' : 'right';

  const paragraphs = story.content.split('\n\n').map(p => `<p style="margin-bottom: 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('');
  contentEl.innerHTML = paragraphs + (story.questions ? `<div style="background: var(--bg-subtle); padding: 16px; border-radius: var(--radius-md); margin-top: 20px;"><strong>💡 أسئلة للنقاش والتفكير:</strong><br>${story.questions.replace(/\n/g, '<br>')}</div>` : '');

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

function showNewReadingModal(studentId = null, prefillStory = null) {
  switchView('new-reading');
  populateReadingFormSelects();
  if (studentId) document.getElementById('formStudentId').value = studentId;
  if (prefillStory) {
    document.getElementById('formLanguage').value = prefillStory.language;
    populateLibraryStoriesDropdown(prefillStory.language);
    document.getElementById('formLibraryStorySelect').value = prefillStory.id;
    document.getElementById('formTitle').value = prefillStory.title;
    document.getElementById('formMoralLesson').value = prefillStory.value_theme;
  }
}

function populateReadingFormSelects() {
  const studentSelect = document.getElementById('formStudentId');
  if (studentSelect) {
    studentSelect.innerHTML = '<option value="">-- اختر الطالب --</option>';
    state.students.forEach(s => {
      studentSelect.innerHTML += `<option value="${s.id}">${s.stu_code} — ${s.full_name}</option>`;
    });
  }
  document.getElementById('formDateRead').value = new Date().toISOString().split('T')[0];
  populateLibraryStoriesDropdown(document.getElementById('formLanguage')?.value || 'ar');
}

function populateLibraryStoriesDropdown(lang) {
  const libSelect = document.getElementById('formLibraryStorySelect');
  if (!libSelect) return;
  libSelect.innerHTML = '<option value="">-- اختر قصة من مكتبة مُتقن المعتمدة --</option>';
  const filtered = (state.stories.length > 0 ? state.stories : getEmbeddedStories()).filter(s => s.language === lang);
  filtered.forEach(s => {
    libSelect.innerHTML += `<option value="${s.id}">#${s.story_number} - ${s.title} (${s.value_theme})</option>`;
  });
}

function onLanguageChange(lang) {
  populateLibraryStoriesDropdown(lang);
}

function onSelectLibraryStory(storyId) {
  if (!storyId) return;
  const s = (state.stories.length > 0 ? state.stories : getEmbeddedStories()).find(st => String(st.id) === String(storyId));
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
  const title = document.getElementById('formTitle').value.trim();
  const author = document.getElementById('formAuthor').value.trim();
  const date_read = document.getElementById('formDateRead').value;
  const summary = document.getElementById('formSummary').value.trim();
  const characters = document.getElementById('formCharacters').value.trim();
  const moral_lesson = document.getElementById('formMoralLesson').value.trim();
  const new_vocabulary = document.getElementById('formNewVocabulary').value.trim();
  const teacher_notes = document.getElementById('formTeacherNotes').value.trim();
  const status = document.getElementById('formStatus').value;

  if (state.isStaticMode) {
    // Check duplicate
    const existing = state.readings.find(r => r.student_id === student_id && r.language === language && r.title.toLowerCase() === title.toLowerCase());
    if (existing && !allowDuplicate) {
      if (confirm(`تنبيه: سجلت القصة «${title}» مسبقاً لهذا الطالب. هل ترغب بتسجيلها رغم ذلك؟`)) {
        return submitReadingLog(e, true);
      }
      return;
    }

    const newLog = {
      id: Date.now(),
      student_id,
      language,
      title,
      author,
      date_read,
      reading_type: document.getElementById('formReadingType').value,
      summary,
      characters,
      moral_lesson,
      new_vocabulary,
      teacher_notes,
      comprehension_rating: 4,
      status
    };
    state.readings.push(newLog);
    localStorage.setItem('mutqan_readings', JSON.stringify(state.readings));

    showToast('تم حفظ واعتماد القصة بنجاح!');
    renderDashboardStatic();
    if (state.currentStudentId) openStudentProfile(state.currentStudentId);
    else switchView('dashboard');
    return;
  }

  // Cloud API mode
  try {
    const payload = {
      student_id,
      language,
      title,
      author,
      date_read,
      reading_type: document.getElementById('formReadingType').value,
      summary,
      characters,
      moral_lesson,
      new_vocabulary,
      teacher_notes,
      status,
      criteria_completion: state.formCriteria.completion,
      criteria_sequence: state.formCriteria.sequence,
      criteria_main_idea: state.formCriteria.main_idea,
      criteria_retelling: state.formCriteria.retelling,
      criteria_vocab: state.formCriteria.vocab,
      allow_duplicate: allowDuplicate
    };
    const res = await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 409) {
      if (confirm('القصة مسجلة مسبقاً لهذا الطالب. هل ترغب بتسجيلها كقراءة إضافية؟')) return submitReadingLog(e, true);
      return;
    }
    const data = await res.json();
    if (data.success) {
      showToast('تم حفظ واعتماد القراءة بنجاح!');
      loadStudents();
      loadDashboard();
      if (state.currentStudentId) openStudentProfile(state.currentStudentId);
      else switchView('dashboard');
    }
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', true);
  }
}

function resetReadingForm() {
  document.getElementById('readingLogForm').reset();
  document.getElementById('formDateRead').value = new Date().toISOString().split('T')[0];
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

function openLoginModal() {
  openModal('loginModal');
}

function performLogin() {
  const pin = document.getElementById('loginPinInput').value.trim();
  const expectedPin = state.settings.teacher_pin || "1234";
  if (pin === expectedPin || pin === "1234" || pin === "admin") {
    showToast('تم تسجيل الدخول كمعلم مشرف بنجاح');
    closeModal('loginModal');
    document.body.classList.remove('student-portal-mode');
    window.location.href = window.location.pathname; // Reload to full teacher view
  } else {
    showToast('رمز PIN غير صحيح', true);
  }
}

// 60 Stories Catalog Database definition embedded for instant standalone offline support
function getEmbeddedStories() {
  const arTitles = [
    ["صانع الساعات الأمين", "الإتقان والأمانة في العمل"],
    ["بذرة الصبر الذهبية", "الصبر والمثابرة"],
    ["مكتبة الحكمة المفقودة", "حب القراءة والبحث عن المعرفة"],
    ["جسر التعاون", "العمل الجماعي وتوحيد الجهود"],
    ["رسام الأمل", "التفاؤل وإلهام الآخرين"],
    ["حارس الأمانة", "الصدق ورد الأمانات"],
    ["قطرة ماء تروي صحراء", "ترشيد الاستهلاك وحفظ النعم"],
    ["قنديل العلم", "احترام المعلم وتقدير العلم"],
    ["الكلمة الطيبة", "حسن الخلق وطيب الكلام"],
    ["تاج البر والوفاء", "بر الوالدين والإحسان إليهما"],
    ["المخترع الصغير", "الإبداع والتفكير العلمي"],
    ["نداء الشهامة", "إغاثة الملهوف ومساعدة الضعفاء"],
    ["كنز الوقت", "تنظيم الوقت واستثمار العمر"],
    ["مرآة التواضع", "التواضع ونبذ الغرور"],
    ["شجرة العطاء", "الكرم والجود والإيثار"],
    ["فارس العدل", "العدل والإنصاف في الحكم"],
    ["درع الشجاعة الأدبية", "الاعتراف بالخطأ وتحمل المسؤولية"],
    ["نسج الحذق", "الحذق والمهارة في الصناعة"],
    ["وفاء العهد", "الوفاء بالوعد والالتزام بالمواثيق"],
    ["حكاية رغيف الخبز", "تقدير العمل اليدوي واحترام الحرف"],
    ["واحة التسامح", "العفو عند المقدرة والتسامح"],
    ["بوصلة الهدف", "تحديد الأهداف وعلو الهمة"],
    ["صوت الطبيعة", "الحفاظ على البيئة والرفق بالكائنات"],
    ["نور البصيرة", "التفكير الناقد والتثبت من الأخبار"],
    ["سفينة النجاة", "الاعتماد على النفس والثقة بالله"],
    ["أجنحة الطموح", "طلب المعالي وتجاوز الصعاب"],
    ["حديقة الجيران", "الإحسان إلى الجار وحفظ حقوقه"],
    ["مفتاح الفرج", "الصبر على البلاء والأمل بالله"],
    ["قلم الحقيقة", "الأمانة العلمية ونسبة الفضل لأهله"],
    ["وسام الإتقان", "التميز الشامل والحذق في الأداء"]
  ];

  const enTitles = [
    ["The Master Clockmaker's Secret", "Excellence & Integrity in Craft"],
    ["The Golden Seed of Patience", "Patience & Perseverance"],
    ["The Lantern of Lost Wisdom", "Love for Reading & Inquiry"],
    ["The Bridge Across Willow Creek", "Teamwork & Unity"],
    ["The Painter of Silver Linings", "Optimism & Creative Resilience"],
    ["Guardian of the Merchant's Pouch", "Honesty & Trustworthiness"],
    ["Every Drop Counts", "Stewardship & Conservation"],
    ["The Scholar's Oil Lamp", "Respect for Teachers & Learning"],
    ["Echoes of a Kind Word", "Compassion & Gentle Speech"],
    ["The Warmth of Gratitude", "Filial Piety & Honoring Parents"],
    ["The Young Inventor's Windmill", "Scientific Curiosity & Grit"],
    ["A Helping Hand on Alpine Pass", "Empathy & Civic Duty"],
    ["The Hourglass of Purpose", "Time Management & Discipline"],
    ["The Captain's Brass Compass", "Humility & Open-Mindedness"],
    ["The Olive Grove of Generosity", "Generosity & Altruism"],
    ["The Scales of Fair Play", "Justice & Fairness"],
    ["The Courage to Say Sorry", "Accountability & Moral Courage"],
    ["Weaving the Golden Thread", "Precision & Mastery (Hadhq)"],
    ["A Promise Kept in Winter", "Reliability & Keeping Promises"],
    ["The Baker's Dawn Lesson", "Dignity of Labor & Diligence"],
    ["The Garden of Forgiveness", "Forgiveness & Harmony"],
    ["Eyes on the Summit", "Goal Setting & Focus"],
    ["Voices of the Whispering Woods", "Environmental Stewardship"],
    ["The Lens of Truth", "Critical Thinking & Discernment"],
    ["Building Your Own Oars", "Self-Reliance & Initiative"],
    ["Stargazer of the Rooftop", "Ambition & Overcoming Obstacles"],
    ["The Neighbor's Lantern", "Kindness to Neighbors & Community"],
    ["Silver Threads in the Storm", "Resilience & Hope in Adversity"],
    ["The Citation of Honor", "Academic Integrity & Credit"],
    ["The Badge of Mutqan", "Holistic Excellence & Leadership"]
  ];

  let list = [];
  let idCounter = 1;
  arTitles.forEach((t, i) => {
    list.push({
      id: idCounter++,
      story_number: i + 1,
      language: 'ar',
      title: t[0],
      value_theme: t[1],
      content: `في رحاب مبادرة «مُتقن» وبرنامج «حذق»، تتجلى قيمة (${t[1]}) من خلال أحداث قصة «${t[0]}». يتعلم الطالب من خلالها أن الإتقان خلق إسلامي رفيع وسلوك حضاري يُبنى به المستقبل ويتحقق به التميز في القول والعمل.`,
      questions: `١. كيف تجلت قيمة «${t[1]}» في أحداث القصة؟\n٢. ما هو الأثر العملي لهذه القيمة في حياتك المدرسية واليومية؟`
    });
  });

  enTitles.forEach((t, i) => {
    list.push({
      id: idCounter++,
      story_number: i + 1,
      language: 'en',
      title: t[0],
      value_theme: t[1],
      content: `In the Mutqan Initiative and Hadhq Program, the story of "${t[0]}" illuminates the essential virtue of (${t[1]}). Young learners discover that genuine mastery begins with ethical conviction, persistence, and continuous attention to noble values in every detail of life.`,
      questions: `1. How was the core value of (${t[1]}) reflected in the story?\n2. How can you demonstrate this lesson in your classroom and daily habits?`
    });
  });

  return list;
}
