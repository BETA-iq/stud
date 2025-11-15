const loader = document.getElementById("loader");
const quizArea = document.getElementById("quizArea");
const quizTitle = document.getElementById("examTitle");
const metaDiv = document.getElementById("meta");
const questionCard = document.getElementById("questionCard");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const prevQ = document.getElementById("prevQ");
const nextQ = document.getElementById("nextQ");
const resultArea = document.getElementById("resultArea");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const retryWrap = document.getElementById("retryWrap");
const finishBtn = document.getElementById("finishBtn");
const backBtn = document.getElementById("backBtn");

let state = {
  allQuestions: [],
  examList: [],
  index: 0,
  answers: [],
  reaskRound: false,
  reaskList: [],
  userData: null
};
function getExFromUrl(){
  const params = new URLSearchParams(window.location.search);
  const ex = params.get("ex");
  if(!ex) return null;
  try {
    return JSON.parse(decodeURIComponent(ex));
  } catch(e){
    console.error("Invalid ex param", e);
    return null;
  }
}
async function loadDatabaseFile(userData){
  const urlParams = new URLSearchParams(window.location.search);

  const className = urlParams.get("class");
  const subject = urlParams.get("subject");
  const period = urlParams.get("period");

  const filePath = `https://edu.karbala.cc/ex/database/${className}/${subject}/${period}.json`;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error("File not found");
    }

    const data = await response.json();
    console.log("Questions Loaded:", data);

    startExam(data);

  } catch (e) {
    console.error(e);
    document.body.innerHTML =
      "<h2 style='color:red;text-align:center;margin-top:50px;'>⚠ الملف غير موجود</h2>";
  }
}


function pickRandom(arr, n){
  const copy = arr.slice();
  const out = [];
  while(out.length < n && copy.length){
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx,1)[0]);
  }
  return out;
}

async function prepareExam(){
  const ex = getExFromUrl();
  if(!ex){
    loader.innerText = "البيانات مفقودة أو رابط الاختبار غير صحيح.";
    return;
  }
  state.userData = ex;
  quizTitle.innerText = `اختبار — ${ex.class} · ${ex.subject} · ${ex.period}`;
  metaDiv.innerText = `${ex.questions} سؤال · وضع الاختبار`;
  const db = await loadDatabaseFile(ex);
  if(!db || db.length === 0){
    loader.innerHTML = `لا توجد أسئلة لهذا الاختيار حالياً.<br>إذا عندك ملفات أرسل واتساب: <strong>07855321655</strong>`;
    return;
  }
  const n = Math.min(ex.questions, db.length);
  state.allQuestions = db;
  state.examList = pickRandom(db, n);
  state.index = 0;
  state.answers = [];
  loader.classList.add("hidden");
  quizArea.classList.remove("hidden");
  renderQuestion();
  updateProgress();
}
function renderQuestion(){
  const qObj = state.examList[state.index];
  questionCard.innerHTML = ""; 
  if(!qObj) return;
  const title = document.createElement("div");
  title.className = "q-title";
  title.innerText = `السؤال ${state.index + 1}:`;

  const body = document.createElement("div");
  body.className = "q-body";
  body.innerHTML = qObj.question || "";

  questionCard.appendChild(title);
  questionCard.appendChild(body);
  const inputs = document.createElement("div");
  inputs.className = "choices";
  const type = qObj.type || "mcq";
  if(type === "mcq"){
    (qObj.choices || []).forEach((ch, i) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerText = ch;
      btn.addEventListener("click", () => {
        Array.from(inputs.children).forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        state.answers[state.index] = { qid: state.index, given: ch, correct: qObj.answer };
      });
      inputs.appendChild(btn);
    });
  } else if(type === "truefalse"){
    ["صح","خطأ"].forEach(val => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerText = val;
      btn.addEventListener("click", () => {
        Array.from(inputs.children).forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        state.answers[state.index] = { qid: state.index, given: val, correct: qObj.answer };
      });
      inputs.appendChild(btn);
    });
  } else if(type === "fill"){
    const inp = document.createElement("input");
    inp.className = "input-fill";
    inp.placeholder = "اكتب الإجابة هنا...";
    inp.value = state.answers[state.index]?.given || "";
    inp.addEventListener("input", () => {
      state.answers[state.index] = { qid: state.index, given: inp.value.trim(), correct: qObj.answer };
    });
    inputs.appendChild(inp);
  } else if(type === "definition"){
    const ta = document.createElement("textarea");
    ta.className = "input-fill";
    ta.style.minHeight = "100px";
    ta.placeholder = "اكتب تعريفك أو إجابتك ...";
    ta.value = state.answers[state.index]?.given || "";
    ta.addEventListener("input", () => {
      state.answers[state.index] = { qid: state.index, given: ta.value.trim(), correct: qObj.answer };
    });
    inputs.appendChild(ta);
  } else if(type === "match"){
    const left = qObj.left || [];
    const right = qObj.right || [];
    left.forEach((L, i) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.alignItems = "center";
      const leftLabel = document.createElement("div");
      leftLabel.style.minWidth = "35%";
      leftLabel.innerText = L;
      const sel = document.createElement("select");
      sel.className = "input-fill";
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.innerText = "اختر";
      sel.appendChild(emptyOpt);
      right.forEach(r => {
        const o = document.createElement("option");
        o.value = r;
        o.innerText = r;
        sel.appendChild(o);
      });
      sel.addEventListener("change", () => {
        const cur = state.answers[state.index]?.given || {};
        cur[L] = sel.value;
        state.answers[state.index] = { qid: state.index, given: cur, correct: qObj.pairs || qObj.answer };
      });
      row.appendChild(leftLabel);
      row.appendChild(sel);
      inputs.appendChild(row);
    });
  } else {
    const inp = document.createElement("input");
    inp.className = "input-fill";
    inp.value = state.answers[state.index]?.given || "";
    inp.addEventListener("input", () => {
      state.answers[state.index] = { qid: state.index, given: inp.value.trim(), correct: qObj.answer };
    });
    inputs.appendChild(inp);
  }

  questionCard.appendChild(inputs);
}

function isAnswerCorrect(qObj, userAns){
  if(userAns === undefined || userAns === null) return false;
  const type = qObj.type || "mcq";
  const correct = qObj.answer;
  if(type === "mcq" || type === "truefalse"){
    return String(userAns.given).trim().toLowerCase() === String(correct).trim().toLowerCase();
  } else if(type === "fill" || type === "definition"){
    return String(userAns.given).trim().toLowerCase() === String(correct).trim().toLowerCase();
  } else if(type === "match"){
    const pairs = qObj.pairs || correct;
    if(!pairs || typeof pairs !== "object") return false;
    for(const k of Object.keys(pairs)){
      if(!userAns.given || userAns.given[k] !== pairs[k]) return false;
    }
    return true;
  } else {
    return String(userAns.given).trim().toLowerCase() === String(correct).trim().toLowerCase();
  }
}
function checkCurrentAndNext(){
  const idx = state.index;
  const qObj = state.examList[idx];
  const u = state.answers[idx];
  if(!u || u.given === "" || u.given === null || u.given === undefined || (typeof u.given === "object" && Object.keys(u.given).length===0)){
    const confirmSkip = confirm("لم تجب على السؤال. هل تريد تخطيه؟ (سيُعدّ خاطئًا إذا استمرت)");
    if(!confirmSkip) return;
  }
  const correct = isAnswerCorrect(qObj, state.answers[idx]);
  state.answers[idx] = Object.assign({}, state.answers[idx], { correct: correct });
  if(state.index < state.examList.length - 1){
    state.index++;
    renderQuestion();
    updateProgress();
  } else {
    finalizeRound();
  }
}

function updateProgress(){
  const total = state.examList.length;
  progressText.innerText = `السؤال ${state.index + 1} / ${total}`;
  const pct = Math.round(((state.index) / Math.max(total-1,1)) * 100);
  progressFill.style.width = `${pct}%`;
}

prevQ.addEventListener("click", () => {
  if(state.index > 0){
    state.index--;
    renderQuestion();
    updateProgress();
  }
});

nextQ.addEventListener("click", () => {
  checkCurrentAndNext();
});

function finalizeRound(){
  const total = state.examList.length;
  const correctCount = state.answers.filter(a => a && a.correct).length;
  const percent = Math.round((correctCount / total) * 100);

  if(percent < 50 && !state.reaskRound){
    state.reaskRound = true;
    state.reaskList = state.examList.filter((q, i) => !(state.answers[i] && state.answers[i].correct));
    if(state.reaskList.length === 0){
      showResult(percent, total, correctCount);
      return;
    }
    loader.classList.remove("hidden");
    quizArea.classList.add("hidden");
    loader.innerHTML = `نسبةك ${percent}%. سنعيد ${state.reaskList.length} سؤالاً خاطئًا لإعادتك وتحسين نتيجتك...`;
    setTimeout(() => {
      state.examList = state.reaskList;
      state.index = 0;
      state.answers = [];
      loader.classList.add("hidden");
      quizArea.classList.remove("hidden");
      renderQuestion();
      updateProgress();
    }, 1500);
    return;
  }

  const finalCorrect = state.answers.filter(a => a && a.correct).length;
  const finalTotal = state.examList.length + (state.reaskRound ? 0 : 0); 
  let overallPercent = percent;
  if(state.reaskRound){
    // Combine previous correct from initial round + correct from reask round.
    // For simplicity: إذا كانت إعادة تمت، سنعرض نتيجة من نسبة الأسئلة الصحيحة من مجموع الأسئلة الأصلية.
    // للحصول على هذه القيمة، يجب أن نحتفظ بنتائج الجولة الأولى.
    // (لكن لأننا أعدنا state.answers، سنستخرج من مكان سابق ما إذا أردنا تعقيد)
    // هنا نبقي عرضًا بسيطًا:
    overallPercent = percent; // تقريبي
  }

  showResult(percent, total, correctCount);
}
function showResult(percent, total, correctCount){
  quizArea.classList.add("hidden");
  resultArea.classList.remove("hidden");
  resultTitle.innerText = `نسبتك: ${percent}%`;
  let level = "ممتاز";
  if(percent < 50) level = "يحتاج تحسين";
  else if(percent < 75) level = "متوسط";
  else if(percent < 90) level = "جيد";
  resultSummary.innerHTML = `أجبت ${correctCount} من ${total}، مستوى: <strong>${level}</strong>.`;
  retryWrap.innerHTML = "";
  if(state.reaskList && state.reaskList.length){
    const btn = document.createElement("button");
    btn.className = "primary";
    btn.innerText = `أعد الأخطاء (${state.reaskList.length})`;
    btn.addEventListener("click", () => {
      state.examList = state.reaskList;
      state.index = 0;
      state.answers = [];
      state.reaskRound = true;
      resultArea.classList.add("hidden");
      quizArea.classList.remove("hidden");
      renderQuestion();
      updateProgress();
    });
    retryWrap.appendChild(btn);
  }
  finishBtn.onclick = () => {
    window.location.href = "../index.html";
  };
}
backBtn.addEventListener("click", () => {
  window.history.back();
});
prepareExam();

