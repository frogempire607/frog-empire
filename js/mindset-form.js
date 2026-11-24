// Mindset Training inquiry form (Tyler Lehmann's page only).
// Sends to the Google Apps Script web app set in js/config.js.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mindsetForm');
  if (!form) return;

  const url = ((window.FROG_CONFIG && window.FROG_CONFIG.mindsetIntakeUrl) || '').trim();
  const program = form.elements.program;
  const groupField = document.getElementById('groupMembersField');
  const groupInput = form.elements.groupMembers;
  const phone = form.elements.parentPhone;
  const email = form.elements.parentEmail;
  const btn = form.querySelector('button[type="submit"]');
  const status = document.getElementById('mindsetStatus');
  const btnText = btn.textContent;
  const TIMEOUT_MS = 45000;

  let submissionId = null;
  let sending = false;
  btn.disabled = false;

  // ---- Group field only shows for Group Mindset ----
  function syncGroupField() {
    const show = program.value === 'Group Mindset';
    groupField.hidden = !show;
    groupInput.disabled = !show;
  }
  program.addEventListener('change', syncGroupField);
  syncGroupField();
  // Browsers can restore a previous choice after the page loads
  window.addEventListener('pageshow', syncGroupField);

  // ---- Pricing buttons preselect a program (the link itself scrolls) ----
  document.querySelectorAll('[data-mindset-program]').forEach(link => {
    link.addEventListener('click', () => {
      if (sending) return;
      program.value = link.dataset.mindsetProgram;
      program.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  // ---- Validation (the Apps Script checks everything again) ----
  function phoneProblem(value) {
    const v = value.trim();
    if (!v) return '';
    const digits = v.replace(/\D/g, '');
    const okChars = /^\+?[\d\s().-]+$/.test(v);
    const okLength = v.startsWith('+')
      ? digits.length >= 8 && digits.length <= 15
      : digits.length === 10 || (digits.length === 11 && digits[0] === '1');
    return okChars && okLength ? '' : 'Please enter a full phone number with area code, like (607) 555-0123.';
  }
  function emailProblem(value) {
    const v = value.trim();
    if (!v) return '';
    return /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(v) ? '' : 'Please enter a full email address, like name@example.com.';
  }
  function requiredProblem(input) {
    return input.value.trim() ? '' : 'Please fill out this field.';
  }
  function checkField(input) {
    if (input === phone) input.setCustomValidity(requiredProblem(input) || phoneProblem(input.value));
    else if (input === email) input.setCustomValidity(requiredProblem(input) || emailProblem(input.value));
    else if (input === form.elements.athleteName || input === form.elements.parentName) {
      input.setCustomValidity(requiredProblem(input));
    }
  }

  form.addEventListener('input', (e) => {
    checkField(e.target);
    submissionId = null; // edited answers count as a new submission
    if (!sending) showStatus('', '');
  });

  function showStatus(type, message) {
    status.className = 'mindset-status' + (type ? ' mindset-status--' + type : '');
    status.textContent = message;
  }

  function newId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  // ---- Submit ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    [...form.elements].forEach(checkField);
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    submissionId = submissionId || newId();
    data.submissionId = submissionId;

    sending = true;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    showStatus('', '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      if (!url) throw new Error('mindsetIntakeUrl is empty in js/config.js');
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || 'Request failed');
      form.reset();
      [...form.elements].forEach(el => el.setCustomValidity && el.setCustomValidity(''));
      syncGroupField();
      submissionId = null;
      showStatus('success', 'Thanks! Tyler will reach out soon.');
    } catch (err) {
      console.error('Mindset form:', err);
      showStatus('error', 'Sorry, we couldn’t confirm your form was sent. Your answers are still here, so please try again. If it keeps happening, email info@frogempire607.com or call (501) 594-3764.');
    } finally {
      clearTimeout(timer);
      sending = false;
      btn.disabled = false;
      btn.textContent = btnText;
    }
  });
});
