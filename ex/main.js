const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");
const continueBtn = document.getElementById("continueBtn");

const subjectsByClass = {
  "5th": ["الاسلاميه ","القراءة","الانكليزي","الرياضيات","العلوم","الاجتماعيات"], 
  "6th": ["الاسلاميه ","القراءة","القواعد","الانكليزي","الرياضيات","العلوم","الاجتماعيات"], 
  "7th": ["الاسلاميه ","العربي","الاحياء","الكيمياء","الفيزياء","الحاسوب","الفرنسي","التربيه الاخلاقية","الانكليزي","الرياضيات","الاجتماعيات"], 
  "8th": ["الاسلاميه ","العربي","الاحياء","الكيمياء","الفيزياء","الحاسوب","الفرنسي","التربيه الاخلاقية","الانكليزي","الرياضيات","الاجتماعيات"], 
  "9th": ["الاسلاميه ","العربي","الاحياء","الكيمياء","الفيزياء","الحاسوب","الفرنسي","الانكليزي","الرياضيات","الاجتماعيات"], 
  "10a": ["الاسلاميه ","العربي","الاحياء","الكيمياء","الفيزياء","الحاسوب","الفرنسي","الكردي","جرائم حزب البعث","الانكليزي","الرياضيات"], 
  "10b": ["الاسلاميه ","العربي","التاريخ","الجغرافية","علم الاجتماع","الحاسوب","الفرنسي","الكردي","جرائم حزب البعث","الانكليزي","الرياضيات"], 
  "11a": ["الاسلاميه ","العربي","الاحياء","الكيمياء","الفيزياء","الحاسوب","الفرنسي","الكردي","الانكليزي","الرياضيات"],
  "11b": ["الاسلاميه ","العربي","التاريخ","الجغرافية","الفلسفه","الاقتصاد","الحاسوب","الفرنسي","الفلسفه","الكردي","الانكليزي","الرياضيات"],
  "12a":  ["الاسلاميه ","العربي","الاحياء","الكيمياء","الفيزياء","الفرنسي","الانكليزي","الرياضيات"],
  "12b":  ["الاسلاميه ","العربي","التاريخ","الجغرافية","الاقتصاد","الانكليزي","الرياضيات"],
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
