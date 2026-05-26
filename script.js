// ==========================
// 投稿データ（localStorage対応）
// ==========================
let posts = JSON.parse(localStorage.getItem("posts")) || [
    {
        id: 1,
        image: "https://via.placeholder.com/200",
        dishName: "オムライス",
        feedback: "卵がふわふわにできた！",
        date: "2026/05/20"
    },
    {
        id: 2,
        image: "https://via.placeholder.com/200",
        dishName: "サバの塩焼き",
        feedback: "皮がパリパリ。",
        date: "2026/05/19"
    },
    {
        id: 3,
        image: "https://via.placeholder.com/200",
        dishName: "味噌汁",
        feedback: "いつもの味。",
        date: "2026/05/18"
    }
];


// ==========================
// 編集状態管理
// ==========================
let editingId = null;


// ==========================
// DOM取得
// ==========================
const postForm = document.getElementById("postForm");
const postGrid = document.querySelector(".post-grid");
const latestPostSection = document.getElementById("latest-post");

// モーダル
const modal = document.getElementById("postModal");
const modalViewMode = document.getElementById("modalViewMode");
const modalEditMode = document.getElementById("modalEditMode");

const viewImage = document.getElementById("viewImage");
const viewDishName = document.getElementById("viewDishName");
const viewFeedback = document.getElementById("viewFeedback");
const viewDate = document.getElementById("viewDate");

const editDishName = document.getElementById("editDishName");
const editFeedback = document.getElementById("editFeedback");

const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeModalBtnTop = document.getElementById("closeModalBtnTop");
const switchToEditBtn = document.getElementById("switchToEditBtn");


// ==========================
// カレンダー管理
// ==========================
let currentViewDate = new Date();

const currentMonthElement = document.getElementById("currentMonth");
const calendarGrid = document.getElementById("calendar-grid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

function renderCalendar() {
    calendarGrid.innerHTML = "";
    
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    currentMonthElement.textContent = `${year}年 ${month + 1}月`;
    
    // 曜日のヘッダー
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    days.forEach(day => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day-header";
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    // 空白を埋める
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day";
        calendarGrid.appendChild(emptyCell);
    }
    
    // 日付を埋める
    const today = new Date();
    for (let date = 1; date <= lastDate; date++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";
        
        const dateNumber = document.createElement("span");
        dateNumber.className = "calendar-date-number";
        dateNumber.textContent = date;
        dayCell.appendChild(dateNumber);
        
        if (year === today.getFullYear() && month === today.getMonth() && date === today.getDate()) {
            dayCell.classList.add("today");
        }
        
        // その日の投稿を探す
        const dayPosts = posts.filter(p => {
            const pDate = new Date(p.date);
            return pDate.getFullYear() === year && pDate.getMonth() === month && pDate.getDate() === date;
        });
        
        if (dayPosts.length > 0) {
            dayCell.classList.add("has-post");
            
            // 写真を表示
            const img = document.createElement("img");
            img.src = dayPosts[0].image;
            img.className = "calendar-thumb";
            dayCell.appendChild(img);
            
            // クリックイベント
            dayCell.onclick = () => openViewModal(dayPosts[0].id);
        }
        
        calendarGrid.appendChild(dayCell);
    }
}

prevMonthBtn.addEventListener("click", () => {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar();
});


// ==========================
// タブ切り替え
// ==========================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.getAttribute('onclick').includes(tabId)
    );
    if (activeBtn) activeBtn.classList.add('active');
}


// ==========================
// モーダル管理（表示・編集）
// ==========================
function openViewModal(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    editingId = id;

    // 表示モードのセット
    viewImage.src = post.image;
    viewDishName.textContent = post.dishName;
    viewFeedback.textContent = post.feedback;
    viewDate.textContent = post.date;

    modalViewMode.style.display = "block";
    modalEditMode.style.display = "none";
    modal.style.display = "flex";
}

switchToEditBtn.onclick = () => {
    const post = posts.find(p => p.id === editingId);
    if (!post) return;

    editDishName.value = post.dishName;
    editFeedback.value = post.feedback;

    modalViewMode.style.display = "none";
    modalEditMode.style.display = "block";
};

function closeModal() {
    modal.style.display = "none";
    editingId = null;
}

closeModalBtnTop.onclick = closeModal;

saveEditBtn.onclick = () => {
    const post = posts.find(p => p.id === editingId);
    if (!post) return;

    post.dishName = editDishName.value;
    post.feedback = editFeedback.value;

    localStorage.setItem("posts", JSON.stringify(posts));

    renderPosts();
    closeModal();
};

cancelEditBtn.onclick = () => {
    modalViewMode.style.display = "block";
    modalEditMode.style.display = "none";
};

window.onclick = (event) => {
    if (event.target == modal) closeModal();
};


// ==========================
// 表示更新
// ==========================
function renderPosts() {
    renderCalendar();
    postGrid.innerHTML = "";

    const pastPosts = posts.slice(0, -1).reverse();

    pastPosts.forEach(post => {
        const article = document.createElement("article");

        article.innerHTML = `
            <img src="${post.image}" alt="${post.dishName}">
            <h4>${post.dishName}</h4>
            <p>${post.feedback}</p>
            <p><small>${post.date}</small></p>

            <div class="btn-container">
                <button onclick="openViewModal(${post.id})">表示</button>
                <button onclick="deletePost(${post.id})">削除</button>
            </div>
        `;

        postGrid.appendChild(article);
    });

    const latest = posts[posts.length - 1];
    if (latest) {
        latestPostSection.querySelector("article").innerHTML = `
            <img src="${latest.image}" alt="${latest.dishName}">
            <h3>今日の料理：${latest.dishName}</h3>
            <p><strong>感想：</strong> ${latest.feedback}</p>
            <p><small>${latest.date}</small></p>
            <div class="btn-container">
                <button onclick="openViewModal(${latest.id})">表示</button>
                <button onclick="deletePost(${latest.id})">削除</button>
            </div>
        `;
    }
}


// ==========================
// 投稿作成（画像なし対応）
// ==========================
function createPost(imageData) {
    const dishName = document.getElementById("dish-name").value;
    const feedback = document.getElementById("feedback").value;
    const date = new Date().toLocaleDateString("ja-JP");

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
    postForm.reset();
}


// ==========================
// 投稿送信
// ==========================
postForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const imageFile = document.getElementById("image").files[0];

    if (imageFile) {
        const reader = new FileReader();

        reader.onload = function (event) {
            createPost(event.target.result);
        };

        reader.readAsDataURL(imageFile);
    } else {
        createPost("https://via.placeholder.com/200");
    }
});


// ==========================
// 削除機能
// ==========================
function deletePost(id) {
    posts = posts.filter(post => post.id !== id);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}


// ==========================
// 初期表示
// ==========================
renderPosts();
