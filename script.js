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


// 編集用（どの投稿を編集してるか）
let editId = null;


// ==========================
// DOM取得
// ==========================
const postForm = document.getElementById('postForm');
const latestPostSection = document.getElementById('latest-post');
const postGrid = document.querySelector('.post-grid');


// ==========================
// 投稿表示
// ==========================
function renderPosts() {
    postGrid.innerHTML = '';

    const pastPosts = posts.slice(0, -1).reverse();

    pastPosts.forEach(post => {
        const article = document.createElement('article');

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
        latestPostSection.querySelector('article').innerHTML = `
            <img src="${latest.image}" alt="${latest.dishName}" width="100%">
            <h3>今日の料理：${latest.dishName}</h3>
            <p><strong>感想：</strong> ${latest.feedback}</p>
            <p><small>投稿日：${latest.date}</small></p>
        `;
    }
}


// ==========================
// 投稿作成（画像なし対応）
// ==========================
function createPost(imageData) {
    const dishName = document.getElementById('dish-name').value;
    const feedback = document.getElementById('feedback').value;
    const date = new Date().toLocaleDateString('ja-JP');

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
// フォーム送信（新規 or 編集）
// ==========================
postForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const imageFile = document.getElementById('image').files[0];

    const savePost = (imageData) => {
        const dishName = document.getElementById('dish-name').value;
        const feedback = document.getElementById('feedback').value;

        if (editId !== null) {
            // 編集モード
            const index = posts.findIndex(p => p.id === editId);

            if (index !== -1) {
                posts[index].dishName = dishName;
                posts[index].feedback = feedback;
                posts[index].image = imageData;
            }

            editId = null;

        } else {
            // 新規投稿
            const newPost = {
                id: Date.now(),
                image: imageData,
                dishName,
                feedback,
                date: new Date().toLocaleDateString('ja-JP')
            };

            posts.push(newPost);
        }

        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
        postForm.reset();
    };

    if (imageFile) {
        const reader = new FileReader();

        reader.onload = function(event) {
            savePost(event.target.result);
        };

        reader.readAsDataURL(imageFile);

    } else {
        savePost("https://via.placeholder.com/200");
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
// 編集開始
// ==========================
function startEdit(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    editId = id;

    document.getElementById('dish-name').value = post.dishName;
    document.getElementById('feedback').value = post.feedback;

    // 画像はリセット（再選択方式）
    document.getElementById('image').value = '';
}


// ==========================
// 初期表示
// ==========================
renderPosts();
