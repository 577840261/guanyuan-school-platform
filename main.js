import { supabase, checkUser, getUserProfile } from './supabase.js';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 检查用户登录状态
    await checkAndUpdateUserStatus();
    
    // 初始化导航栏滚动效果
    initNavbarScrollEffect();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化回到顶部按钮
    initBackToTop();
    
    // 初始化内容切换功能
    initContentToggle();
});

// 检查并更新用户状态
async function checkAndUpdateUserStatus() {
    const user = await checkUser();
    
    if (user) {
        // 用户已登录，获取并显示用户资料
        const profile = await getUserProfile(user.id);
        updateUIForLoggedInUser(profile);
    } else {
        // 用户未登录，显示登录按钮
        updateUIForGuestUser();
    }
}

// 更新已登录用户的UI
function updateUIForLoggedInUser(profile) {
    const userMenu = document.getElementById('user-menu');
    
    // 如果用户有头像，使用用户头像，否则使用默认头像
    const avatarUrl = profile?.avatar_url || `https://picsum.photos/id/${profile?.id?.charCodeAt(0)}/40/40`;
    
    // 更新用户头像
    userMenu.innerHTML = `
        <div class="relative group">
            <button class="flex items-center space-x-2">
                <img src="${avatarUrl}" alt="用户头像" class="w-8 h-8 rounded-full object-cover border-2 border-primary">
                <i class="fa fa-chevron-down text-xs text-gray-500 group-hover:rotate-180 transition-transform"></i>
            </button>
            <!-- 用户下拉菜单 -->
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 hidden group-hover:block">
                <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fa fa-user mr-2"></i>个人中心
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fa fa-cog mr-2"></i>设置
                </a>
                <div class="border-t border-gray-100 my-1"></div>
                <button id="logout-button" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <i class="fa fa-sign-out mr-2"></i>退出登录
                </button>
            </div>
        </div>
    `;
    
    // 添加退出登录事件监听
    document.getElementById('logout-button').addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out: - main.js:69', error);
        } else {
            window.location.reload();
        }
    });
    
    // 发布按钮点击事件
    document.getElementById('post-button').addEventListener('click', () => {
        window.location.href = 'post.html';
    });
}

// 更新游客用户的UI
function updateUIForGuestUser() {
    const userMenu = document.getElementById('user-menu');
    userMenu.innerHTML = `
        <div class="flex space-x-2">
            <a href="login.html" class="px-3 py-1 text-sm border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors">
                登录
            </a>
            <a href="register.html" class="px-3 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                注册
            </a>
        </div>
    `;
    
    // 发布按钮点击事件 - 未登录时跳转到登录页
    document.getElementById('post-button').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

// 初始化导航栏滚动效果
function initNavbarScrollEffect() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.remove('bg-white/80');
            navbar.classList.add('bg-white', 'shadow');
        } else {
            navbar.classList.add('bg-white/80');
            navbar.classList.remove('bg-white', 'shadow');
        }
    });
}

// 初始化移动端菜单
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// 初始化回到顶部按钮
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.remove('opacity-0', 'invisible');
            backToTopButton.classList.add('opacity-100', 'visible');
        } else {
            backToTopButton.classList.add('opacity-0', 'invisible');
            backToTopButton.classList.remove('opacity-100', 'visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 初始化内容切换功能（本校/全平台）
function initContentToggle() {
    const schoolToggle = document.getElementById('school-toggle');
    const allToggle = document.getElementById('all-toggle');
    const currentSchoolText = document.getElementById('current-school');
    
    // 本校按钮点击事件
    schoolToggle.addEventListener('click', () => {
        schoolToggle.classList.add('bg-primary/10');
        allToggle.classList.remove('bg-primary/10');
        currentSchoolText.textContent = '本校';
        
        // 这里可以添加切换到本校内容的逻辑
        loadContent('school');
    });
    
    // 全平台按钮点击事件
    allToggle.addEventListener('click', () => {
        allToggle.classList.add('bg-primary/10');
        schoolToggle.classList.remove('bg-primary/10');
        currentSchoolText.textContent = '全平台';
        
        // 这里可以添加切换到全平台内容的逻辑
        loadContent('all');
    });
}

// 加载内容（根据范围）
function loadContent(scope) {
    // 这里只是示例，实际应该从Supabase加载数据
    console.log(`加载${scope === 'school' ? '本校' : '全平台'}内容 - main.js:178`);
    
    // 可以在这里添加加载动画
    // 然后根据scope参数从Supabase获取对应的数据
    // 最后更新页面内容
}
// 加载内容（根据范围）
async function loadContent(scope) {
    // 显示加载动画
    const feedContainer = document.querySelector('.space-y-5');
    const originalContent = feedContainer.innerHTML;
    feedContainer.innerHTML = `
        <div class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
    `;
    
    try {
        // 从API获取数据
        const { posts } = await getPosts(scope);
        
        if (posts.length === 0) {
            feedContainer.innerHTML = `
                <div class="text-center py-10 bg-white rounded-xl shadow-sm">
                    <i class="fa fa-folder-open-o text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">暂无内容，快去发布第一条吧！</p>
                </div>
            `;
            return;
        }
        
        // 生成帖子HTML
        let postsHtml = '';
        posts.forEach(post => {
            // 处理帖子内容和图片
            let contentHtml = `<p class="text-gray-700 mb-3">${post.content}</p>`;
            
            // 这里可以添加图片处理逻辑
            
            // 生成帖子卡片HTML
            postsHtml += `
                <article class="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
                    <div class="p-5">
                        <!-- 发布者信息 -->
                        <div class="flex items-center mb-4">
                            <img src="${post.profiles.avatar_url || `https://picsum.photos/id/${post.user_id.charCodeAt(0)}/100/100`}" alt="用户头像" class="w-10 h-10 rounded-full object-cover">
                            <div class="ml-3">
                                <div class="flex items-center">
                                    <span class="font-medium">${post.profiles.username}</span>
                                    ${post.primaryBadge ? `
                                        <span class="ml-2 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full badge-glow">${post.primaryBadge.name}</span>
                                    ` : ''}
                                </div>
                                <p class="text-xs text-gray-500">${post.profiles.school} · ${post.profiles.grade} (${formatTime(post.created_at)})</p>
                            </div>
                        </div>
                        
                        <!-- 内容主体 -->
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold mb-2">${post.title}</h3>
                            ${contentHtml}
                        </div>
                        
                        <!-- 互动按钮 -->
                        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                            <button class="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                                <i class="fa fa-heart-o"></i>
                                <span>0</span>
                            </button>
                            <button class="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                                <i class="fa fa-comment-o"></i>
                                <span>${post.comments?.length || 0}</span>
                            </button>
                            <button class="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                                <i class="fa fa-star-o"></i>
                                <span>收藏</span>
                            </button>
                            <button class="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                                <i class="fa fa-share-alt"></i>
                                <span>分享</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        });
        
        // 更新页面内容
        feedContainer.innerHTML = postsHtml;
        
        // 为帖子添加点击事件，跳转到详情页
        document.querySelectorAll('article').forEach((article, index) => {
            article.addEventListener('click', () => {
                window.location.href = `post-detail.html?id=${posts[index].id}`;
            });
        });
        
    } catch (error) {
        console.error('Error loading content: - main.js:276', error);
        feedContainer.innerHTML = `
            <div class="text-center py-10 bg-white rounded-xl shadow-sm">
                <i class="fa fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                <p class="text-gray-500">加载失败，请稍后重试</p>
                <button onclick="loadContent('${scope}')" class="mt-3 px-4 py-2 bg-primary text-white rounded-lg">
                    重试
                </button>
            </div>
        `;
    }
}

// 格式化时间
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays < 30) {
        return `${diffDays}天前`;
    } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
}