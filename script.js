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
const modal = document.getElementById("editModal");
const editDishName = document.getElementById("editDishName");
const editFeedback = document.getElementById("editFeedback");
const saveEditBtn = document.getElementById("saveEditBtn");
const closeModalBtn = document.getElementById("closeModalBtn");


// ==========================
// 表示更新
// ==========================
function renderPosts() {
    postGrid.innerHTML = "";

    const pastPosts = posts.slice(0, -1).reverse();

    pastPosts.forEach(post => {
        const article = document.createElement("article");

        article.innerHTML = `
            <img src="${post.image}" alt="${post.dishName}">
            <h4>${post.dishName}</h4>
            <p>${post.feedback}</p>
            <p><small>${post.date}</small></p>

            <button onclick="startEdit(${post.id})">編集</button>
            <button onclick="deletePost(${post.id})">削除</button>
        `;

        postGrid.appendChild(article);
    });

    const latest = posts[posts.length - 1];
    if (latest) {
        latestPostSection.querySelector("article").innerHTML = `
            <img src="${latest.image}" alt="${latest.dishName}" width="100%">
            <h3>今日の料理：${latest.dishName}</h3>
            <p><strong>感想：</strong> ${latest.feedback}</p>
            <p><small>${latest.date}</small></p>
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
// 編集開始（モーダル表示）
// ==========================
function startEdit(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    editingId = id;

    editDishName.value = post.dishName;
    editFeedback.value = post.feedback;

    modal.style.display = "flex";
}


// ==========================
// 編集保存
// ==========================
saveEditBtn.addEventListener("click", () => {
    const post = posts.find(p => p.id === editingId);
    if (!post) return;

    post.dishName = editDishName.value;
    post.feedback = editFeedback.value;

    localStorage.setItem("posts", JSON.stringify(posts));

    renderPosts();
    modal.style.display = "none";
    editingId = null;
});


// ==========================
// モーダル閉じる
// ==========================
closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    editingId = null;
});


// ==========================
// 初期表示
// ==========================
renderPosts();
