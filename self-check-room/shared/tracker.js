/* ────────────────────────────────────────────────
   EAIM 학습 기록 트래커 (공통 스크립트) — 과학 셀프체크룸
   - 학생은 "반 + 번호"로 구분한다(공통규칙 4-3). 이름은 화면 표시용이며 가려서(구**) 저장한다.
     이름을 기록을 찾는 기준으로 쓰지 않는다 — 동명이인이 합쳐지거나 남의 기록이 보이는 문제 방지.
   - 반·번호를 한 번 물어보고 이 브라우저(기기)에 저장한다.
   - 각 소단원 페이지에서 EAIM.logActivity(...)를 호출하면
     활동 기록이 이 브라우저 안에 계속 쌓인다(보조용 기록, 공통규칙 5-2).
   - self-check-room/my-record.html 에서 쌓인 기록을 모아
     보여주고 인쇄(=PDF 저장) 할 수 있다.
   - 기기 저장 이름은 eaim_science_ 로 시작한다(공통규칙 10-1). 2026-09-25 변경.
   ──────────────────────────────────────────────── */
(function () {
  const STUDENT_KEY = 'eaim_science_student';        // { classNo:'1-3', studentNo:7, displayName:'구**' }
  const LOG_KEY = 'eaim_science_activity_log';
  const OLD_NAME_KEY = 'eaim_student_name';           // 예전 이름 방식 — 더 쓰지 않음
  const OLD_LOG_KEY = 'eaim_activity_log';

  // 예전 기록(이 기기에 쌓인 활동 기록)은 새 이름으로 한 번 옮긴다. 예전 이름 정보는 지운다.
  try {
    if (localStorage.getItem(LOG_KEY) === null && localStorage.getItem(OLD_LOG_KEY) !== null) {
      localStorage.setItem(LOG_KEY, localStorage.getItem(OLD_LOG_KEY));
      localStorage.removeItem(OLD_LOG_KEY);
    }
    localStorage.removeItem(OLD_NAME_KEY);
  } catch (e) {}

  // 이름 가리기: 첫 글자만 보이고 나머지는 * (예: 구민수 → 구**)
  function maskName(name) {
    const n = String(name || '').trim();
    if (!n) return '';
    return n.charAt(0) + '*'.repeat(Math.max(1, Math.min(n.length - 1, 3)));
  }

  // "1학년 3반", "1 - 3", "1-3" → "1-3"
  function normalizeClass(v) {
    const s = String(v || '').replace(/\s/g, '');
    const m = s.match(/^(\d{1,2})(?:학년|-|\.|\/)?(\d{1,2})반?$/);
    if (m) return `${parseInt(m[1], 10)}-${parseInt(m[2], 10)}`;
    return s;
  }

  function askStudentInfo() {
    let classNo = '';
    while (!classNo) {
      const v = prompt('반을 적어 주세요. (예: 1학년 3반 → 1-3)');
      if (v === null) return null;
      classNo = normalizeClass(v);
    }
    let studentNo = 0;
    while (!(studentNo >= 1 && studentNo <= 99)) {
      const v = prompt('번호를 적어 주세요. (숫자만, 예: 7)');
      if (v === null) return null;
      studentNo = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    }
    const nm = prompt('이름(선택) — 화면에는 첫 글자만 보여요. 비워 둬도 돼요.') || '';
    return { classNo, studentNo, displayName: maskName(nm) };
  }

  function getStudentInfo() {
    try {
      const saved = JSON.parse(localStorage.getItem(STUDENT_KEY) || 'null');
      if (saved && saved.classNo && saved.studentNo) return saved;
    } catch (e) {}
    const info = askStudentInfo();
    if (!info) return { classNo: '', studentNo: 0, displayName: '' };
    try { localStorage.setItem(STUDENT_KEY, JSON.stringify(info)); } catch (e) {}
    return info;
  }

  // 화면 표시용 이름표 (예: "1-3 7번 구**")
  function studentLabel(info) {
    const i = info || getStudentInfo();
    if (!i.classNo) return '반·번호 미입력';
    return `${i.classNo} ${i.studentNo}번${i.displayName ? ' ' + i.displayName : ''}`;
  }

  // 예전 코드와 맞추기 위해 남겨 둔 이름 — 이제는 "반 번호 표시용이름" 이름표를 돌려준다
  function getStudentName() { return studentLabel(); }

  function resetStudent() {
    try { localStorage.removeItem(STUDENT_KEY); } catch (e) {}
  }

  function logActivity(unit, subunit, type, result) {
    try {
      const info = getStudentInfo();
      const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      log.push({
        classNo: info.classNo,
        studentNo: info.studentNo,
        unit,
        subunit,
        type,
        result,
        time: new Date().toISOString(),
      });
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch (e) {
      console.warn('EAIM 기록 저장 실패:', e);
    }
  }

  function getAllLogs() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function clearAllLogs() {
    localStorage.removeItem(LOG_KEY);
  }

  window.EAIM = { getStudentInfo, getStudentName, studentLabel, resetStudent, maskName, logActivity, getAllLogs, clearAllLogs };
})();
