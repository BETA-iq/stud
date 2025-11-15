const classSelect = document.getElementById("classSelect");
const periodSelect = document.getElementById("periodSelect");
const subjectSelect = document.getElementById("subjectSelect");
const exampleImage = document.getElementById("exampleImage");
const imageDetails = document.getElementById("imageDetails");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

let images = [];
let currentIndex = 0;
const noImagesMessage = "لا يوجد حاليًا، إذا عندك وحاب ترفعهم تواصل مع 07855321655 واتساب";

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

// اخفاء العناصر بالبداية
hideAll();

classSelect.addEventListener("change", updateSubjects);
periodSelect.addEventListener("change", loadImages);
subjectSelect.addEventListener("change", loadImages);

prevBtn.addEventListener("click", () => { changeImage(-1); });
nextBtn.addEventListener("click", () => { changeImage(1); });

downloadBtn.addEventListener("click", () => {
  if(images.length === 0) return;
  const link = document.createElement("a");
  link.href = images[currentIndex].src;
  link.download = images[currentIndex].src.split("/").pop();
  link.click();
});

shareBtn.addEventListener("click", () => {
  if(images.length === 0) return;
  const shareUrl = `${window.location.origin}${window.location.pathname}?class=${classSelect.value}&period=${periodSelect.value}&subject=${subjectSelect.value}&index=${currentIndex}`;
  navigator.clipboard.writeText(shareUrl);
  alert("تم نسخ رابط المشاركة، ارسله لأي شخص لفتح نفس الصورة.");
});

// جلب الرابط إذا موجود
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const c = params.get("class");
  const p = params.get("period");
  const s = params.get("subject");
  const idx = parseInt(params.get("index"));

  if(c && p && s && !isNaN(idx)) {
    classSelect.value = c;
    updateSubjects();
    subjectSelect.value = s;
    periodSelect.value = p;
    loadImages(() => {
      if(images.length > 0 && images[idx]) currentIndex = idx;
      displayImage();
    });
  }
});

// Functions
function hideAll() {
  exampleImage.style.display = "none";
  imageDetails.style.display = "none";
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
  downloadBtn.style.display = "none";
  shareBtn.style.display = "none";
}

function updateSubjects() {
  const selectedClass = classSelect.value;
  subjectSelect.innerHTML = '<option value="">اختر المادة</option>';
  if(subjectsByClass[selectedClass]){
    subjectsByClass[selectedClass].forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subjectSelect.appendChild(opt);
    });
  }
  loadImages();
}

function loadImages(callback) {
  const selectedClass = classSelect.value;
  const selectedPeriod = periodSelect.value;
  const selectedSubject = subjectSelect.value;

  if(!selectedClass || !selectedPeriod || !selectedSubject){
    hideAll();
    return;
  }

  let promises = [];
  images = [];
  for(let i=1; i<=5; i++){
    const path = `${selectedClass}/${selectedSubject}/${selectedPeriod}/${i}.png`;
    promises.push(new Promise(res=>{
      const img = new Image();
      img.onload = ()=>res({src:path, details:`تفاصيل الصورة رقم ${i} للمادة ${selectedSubject}`});
      img.onerror = ()=>res(null);
      img.src = path;
    }));
  }

  Promise.all(promises).then(results => {
    images = results.filter(i=>i!==null);
    if(images.length === 0){
      hideAll();
      imageDetails.style.display = "block";
      imageDetails.textContent = noImagesMessage;
      return;
    }
    currentIndex = 0;
    exampleImage.style.display = "block";
    imageDetails.style.display = "block";
    prevBtn.style.display = "inline-block";
    nextBtn.style.display = "inline-block";
    downloadBtn.style.display = "inline-block";
    shareBtn.style.display = "inline-block";
    displayImage();
    if(callback) callback();
  });
}

function displayImage() {
  if(images.length === 0) return;
  exampleImage.src = images[currentIndex].src;
  imageDetails.textContent = images[currentIndex].details;
}

function changeImage(dir) {
  if(images.length === 0) return;
  currentIndex = (currentIndex + dir + images.length) % images.length;
  displayImage();
}
