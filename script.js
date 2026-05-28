// ==========================
// 投稿データ（localStorage対応）
// ==========================
let posts = [];
try {
    const savedPosts = localStorage.getItem("posts");
    posts = savedPosts ? JSON.parse(savedPosts) : [
        {
            id: 1,
            image: "https://via.placeholder.com/200",
            dishName: "オムライス",
            feedback: "卵がふわふわにできた！",
            date: "2026-05-20"
        },
        {
            id: 2,
            image: "https://via.placeholder.com/200",
            dishName: "サバの塩焼き",
            feedback: "皮がパリパリ。",
            date: "2026-05-19"
        },
        {
            id: 3,
            image: "https://via.placeholder.com/200",
            dishName: "味噌汁",
            feedback: "いつもの味。",
            date: "2026-05-18"
        }
    ];
} catch (e) {
    console.error("Failed to load posts:", e);
    posts = [];
}


// ==========================
// 編集状態管理
// ==========================
let editingId = null;


// ==========================
// DOM取得（安全に取得）
// ==========================
const getEl = (id) => document.getElementById(id);
const postForm = getEl("postForm");
const latestPostSection = getEl("latest-post");
const calendarGrid = getEl("calendarGrid");
const calendarMonthDisplay = getEl("calendar-month");
const prevMonthBtn = getEl("prevMonth");
const nextMonthBtn = getEl("nextMonth");

// モーダル
const modal = getEl("editModal");
const editImagePreview = getEl("editImagePreview");
const editDishName = getEl("editDishName");
const editFeedback = getEl("editFeedback");
const saveEditBtn = getEl("saveEditBtn");
const deleteEditBtn = getEl("deleteEditBtn");
const closeModalBtn = getEl("closeModalBtn");

// タブ
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// 表示中のカレンダーの年月
let calendarDate = new Date();


// ==========================
// タブ切り替え
// ==========================
tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        const target = getEl(targetTab);
        if (target) target.classList.add("active");
    });
});


// ==========================
// カレンダーナビゲーション
// ==========================
if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });
}

if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });
}


// ==========================
// 表示更新
// ==========================
function renderPosts() {
    // 履歴タブの更新
    const pastPostsContainer = document.querySelector("#past-posts .post-grid");
    if (pastPostsContainer) {
        pastPostsContainer.innerHTML = "";
        const allPosts = [...posts].reverse();
        allPosts.forEach(post => {
            const article = document.createElement("article");
            article.innerHTML = `
                <img src="${post.image}" alt="${post.dishName}">
                <h4>${post.dishName}</h4>
                <p>${post.feedback}</p>
                <p><small>${post.date}</small></p>
                <div class="btn-container">
                    <button onclick="startEdit(${post.id})">編集</button>
                    <button onclick="deletePost(${post.id})">削除</button>
                </div>
            `;
            pastPostsContainer.appendChild(article);
        });
    }

    // TODAYセクションの更新
    if (latestPostSection) {
        const contentBody = latestPostSection.querySelector(".content-body");
        if (contentBody) {
            const latest = posts[posts.length - 1];
            if (latest) {
                contentBody.innerHTML = `
                    <img src="${latest.image}" alt="${latest.dishName}" width="100%">
                    <h3><strong>Dish:</strong> ${latest.dishName}</h3>
                    <p><strong>Comment:</strong> ${latest.feedback}</p>
                    <p><small>${latest.date}</small></p>
                `;
            } else {
                contentBody.innerHTML = "<p>まだ投稿がありません</p>";
            }
        }
    }

    renderCalendar();
}


// ==========================
// カレンダー生成
// ==========================
function renderCalendar() {
    if (!calendarGrid || !calendarMonthDisplay) return;

    calendarGrid.innerHTML = "";

    const days = ["日", "月", "火", "水", "木", "金", "土"];
    days.forEach(day => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day-header";
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    calendarMonthDisplay.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dateStrAlt = `${year}/${String(month + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}`;

        const cell = document.createElement("div");
        cell.className = "calendar-day";

        const dateNum = document.createElement("span");
        dateNum.className = "calendar-date-number";
        dateNum.textContent = d;
        cell.appendChild(dateNum);

        const postOnDate = posts.find(p => p.date === dateStr || p.date === dateStrAlt);
        if (postOnDate) {
            const thumb = document.createElement("img");
            thumb.src = postOnDate.image;
            thumb.className = "calendar-thumb";
            cell.appendChild(thumb);
            cell.onclick = () => startEdit(postOnDate.id);
        }

        const today = new Date();
        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add("today");
        }
        calendarGrid.appendChild(cell);
    }
}


// ==========================
// 投稿作成
// ==========================
function createPost(imageData) {
    const dishNameEl = getEl("dish-name");
    const feedbackEl = getEl("feedback");
    const postDateEl = getEl("post-date");

    if (!dishNameEl || !feedbackEl || !postDateEl) return;

    const dishName = dishNameEl.value;
    const feedback = feedbackEl.value;
    const dateInput = postDateEl.value;

    const date = dateInput || new Date().toISOString().split('T')[0];

    const newPost = {
        id: Date.now(),
        image: imageData,
        dishName,
        feedback,
        date
    };

    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
    
    if (postForm) postForm.reset();
    postDateEl.valueAsDate = new Date();
}


// ==========================
// 投稿送信
// ==========================
if (postForm) {
    postForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const imageEl = getEl("image");
        const imageFile = imageEl ? imageEl.files[0] : null;

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => createPost(event.target.result);
            reader.readAsDataURL(imageFile);
        } else {
            createPost("https://via.placeholder.com/200");
        }
    });
}


// ==========================
// 削除機能
// ==========================
function deletePost(id) {
    if (!confirm("この投稿を削除しますか？")) return;
    posts = posts.filter(post => post.id !== id);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}


// ==========================
// 編集開始（モーダル表示）
// ==========================
function startEdit(id) {
    const post = posts.find(p => p.id === id);
    if (!post || !modal) return;

    editingId = id;
    if (editImagePreview) editImagePreview.src = post.image;
    if (editDishName) editDishName.value = post.dishName;
    if (editFeedback) editFeedback.value = post.feedback;

    modal.style.display = "flex";
}


// ==========================
// 編集保存
// ==========================
if (saveEditBtn) {
    saveEditBtn.addEventListener("click", () => {
        const post = posts.find(p => p.id === editingId);
        if (post) {
            post.dishName = editDishName.value;
            post.feedback = editFeedback.value;
            localStorage.setItem("posts", JSON.stringify(posts));
            renderPosts();
        }
        if (modal) modal.style.display = "none";
        editingId = null;
    });
}


// ==========================
// 編集モーダル内からの削除
// ==========================
if (deleteEditBtn) {
    deleteEditBtn.addEventListener("click", () => {
        if (editingId) {
            deletePost(editingId);
            if (modal) modal.style.display = "none";
            editingId = null;
        }
    });
}


// ==========================
// モーダル閉じる
// ==========================
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        if (modal) modal.style.display = "none";
        editingId = null;
    });
}


// ==========================
// 初期表示
// ==========================
renderPosts();
const postDateEl = getEl("post-date");
if (postDateEl) postDateEl.valueAsDate = new Date();
