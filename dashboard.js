// 初始化图表
document.addEventListener('DOMContentLoaded', () => {
    // 检查管理员登录状态
    checkAdminLogin();
    
    // 初始化侧边栏切换
    initSidebarToggle();
    
    // 初始化活跃度趋势图
    initActivityChart();
    
    // 初始化分类占比图
    initCategoryChart();
    
    // 初始化登出按钮
    initLogoutButton();
});

// 检查管理员登录状态
function checkAdminLogin() {
    // 从localStorage获取管理员信息
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (!adminInfo) {
        // 未登录，跳转到登录页
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const admin = JSON.parse(adminInfo);
        // 这里可以添加验证token有效性的逻辑
        if (!admin.token || !admin.email) {
            throw new Error('Invalid admin info');
        }
    } catch (error) {
        console.error('Admin authentication failed: - dashboard.js:37', error);
        localStorage.removeItem('adminInfo');
        window.location.href = 'login.html';
    }
}

// 初始化侧边栏切换
function initSidebarToggle() {
    const toggleButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-20');
        
        // 隐藏/显示侧边栏文字
        const sidebarTexts = sidebar.querySelectorAll('span:not(.rounded-full)');
        sidebarTexts.forEach(text => {
            text.classList.toggle('hidden');
        });
        
        // 调整主内容区边距
        mainContent.classList.toggle('ml-64');
        mainContent.classList.toggle('ml-20');
    });
}

// 初始化活跃度趋势图
function initActivityChart() {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
            {
                label: '新用户',
                data: [28, 35, 22, 42, 38, 56, 48],
                borderColor: '#165DFF',
                backgroundColor: 'rgba(22, 93, 255, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: '新内容',
                data: [86, 92, 78, 105, 98, 120, 110],
                borderColor: '#FF7D00',
                backgroundColor: 'rgba(255, 125, 0, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 初始化分类占比图
function initCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['表白墙', '寻物启事', '交友平台', '二手交易', '校园通知', '自由讨论'],
        datasets: [{
            data: [35, 15, 10, 20, 8, 12],
            backgroundColor: [
                '#165DFF',
                '#FF7D00',
                '#00B42A',
                '#F53F3F',
                '#722ED1',
                '#86909C'
            ],
            borderWidth: 0
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            cutout: '60%'
        }
    });
}

// 初始化登出按钮
function initLogoutButton() {
    document.getElementById('logout-button').addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
            // 清除本地存储的管理员信息
            localStorage.removeItem('adminInfo');
            // 跳转到登录页
            window.location.href = 'login.html';
        }
    });
}
