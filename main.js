const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");
const continueBtn = document.getElementById("continueBtn");

const subjectsByClass = {
  "5th": ["math","science","arabic"],
  "6th": ["math","science","arabic"],
  "7th": ["math","physics","arabic"],
  "8th": ["math","physics","chemistry"],
  "9th": ["math","physics","chemistry","english"],
  "10a": ["math","physics","chemistry","biology"],
  "10b": ["math","arabic","history"],
  "11a": ["math","physics","chemistry","biology"],
  "11b": ["math","arabic","history"],
  "12a": ["math","physics","chemistry","biology"],
  "12b": ["math","arabic","history"]
};

classSelect.addEventListener("change", () => {
  const selectedClass = classSelect.value;
  subjectSelect.innerHTML = '<option value="">اختر المادة</option>';
  
  if (subjectsByClass[selectedClass]) {
    subjectsByClass[selectedClass].forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subjectSelect.appendChild(opt);
    });
  }
});

document.getElementById("continueBtn").addEventListener("click", () => {
  const c = document.getElementById("classSelect").value;
  const p = document.getElementById("periodSelect").value;
  const s = document.getElementById("subjectSelect").value;
  const q = document.getElementById("questionsSelect").value;

  if (!c || !p || !s || !q) {
    alert("يرجى اختيار جميع الحقول قبل المتابعة.");
    return;
  }
  const exData = { class: c, period: p, subject: s, questions: parseInt(q, 10) };
  const exEncoded = encodeURIComponent(JSON.stringify(exData));
  window.location.href = `exam/index.html?ex=${exEncoded}`;
});