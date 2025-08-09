import { supabase } from './supabase.js';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 根据当前页面执行不同的初始化
    if (window.location.pathname.includes('login.html')) {
        initLoginForm();
    } else if (window.location.pathname.includes('register.html')) {
        initRegisterForm();
    }
});

// 初始化登录表单
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    
    // 切换密码可见性
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // 切换图标
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // 表单提交事件
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        
        // 这里我们使用邮箱登录，实际项目中可能需要将用户名映射到邮箱
        // 简化处理：假设用户名就是邮箱前缀
        const email = `${username}@schoolplatform.com`;
        
        // 显示加载状态
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>登录中...';
        
        // 隐藏错误消息
        errorMessage.classList.add('hidden');
        
        // 调用Supabase登录API
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        // 恢复按钮状态
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        
        if (error) {
            // 显示错误消息
            errorMessage.classList.remove('hidden');
            console.error('登录错误:', error.message);
        } else {
            // 登录成功，跳转到首页
            window.location.href = 'index.html';
        }
    });
}

// 初始化注册表单
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordMatchMessage = document.getElementById('password-match-message');
    
    // 切换密码可见性
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        confirmPasswordInput.setAttribute('type', type);
        
        // 切换图标
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // 检查密码是否匹配
    function checkPasswordMatch() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordMatchMessage.classList.remove('hidden');
            return false;
        } else {
            passwordMatchMessage.classList.add('hidden');
            return true;
        }
    }
    
    // 监听密码输入变化
    passwordInput.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    // 表单提交事件
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 检查密码是否匹配
        if (!checkPasswordMatch()) {
            return;
        }
        
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        const school = document.getElementById('school').value;
        const grade = document.getElementById('grade').value;
        
        // 这里我们使用邮箱作为唯一标识，实际项目中可能需要用户输入真实邮箱
        // 简化处理：使用用户名+学校生成唯一邮箱
        const email = `${username}@${school.replace(/\s+/g, '').toLowerCase()}.com`;
        
        // 显示加载状态
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>注册中...';
        
        // 隐藏错误消息
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.add('hidden');
        });
        
        try {
            // 1. 创建用户账号
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        school: school,
                        grade: grade
                    }
                }
            });
            
            if (authError) {
                throw authError;
            }
            
            // 2. 如果用户创建成功，添加到profiles表
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { 
                            id: authData.user.id,
                            username: username,
                            school: school,
                            grade: grade
                        }
                    ]);
                
                if (profileError) {
                    throw profileError;
                }
                
                // 3. 检查是否是早期注册用户，添加相应头衔
                const { data: userCountData } = await supabase
                    .from('profiles')
                    .select('count', { count: 'exact', head: true });
                
                const userCount = userCountData.count || 0;
                
                // 全平台前100名注册用户
                if (userCount <= 100) {
                    await addBadge(authData.user.id, '平台先锋', '全平台前100名注册用户', true);
                }
                
                // 各学校前20名注册用户
                const { data: schoolUserCountData } = await supabase
                    .from('profiles')
                    .select('count', { count: 'exact', head: true })
                    .eq('school', school);
                
                const schoolUserCount = schoolUserCountData.count || 0;
                
                if (schoolUserCount <= 20) {
                    await addBadge(authData.user.id, '校园先锋', '各学校前20名注册用户', true);
                }
                
                // 注册成功，显示成功消息并跳转
                document.getElementById('success-message').classList.remove('hidden');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            // 显示错误消息
            document.getElementById('error-message').classList.remove('hidden');
            document.getElementById('error-message-text').textContent = error.message;
            console.error('注册错误:', error.message);
        } finally {
            // 恢复按钮状态
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// 为用户添加头衔
async function addBadge(userId, badgeName, description, isPermanent) {
    // 先检查头衔是否已存在
    const { data: existingBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', badgeName)
        .single();
    
    let badgeId;
    
    if (existingBadge) {
        badgeId = existingBadge.id;
    } else {
        // 创建新头衔
        const { data: newBadge, error: badgeError } = await supabase
            .from('badges')
            .insert([
                { 
                    name: badgeName,
                    description: description,
                    is_permanent: isPermanent,
                    level: 1,
                    icon_url: `https://picsum.photos/id/${badgeName.charCodeAt(0)}/40/40`
                }
            ])
            .select();
        
        if (badgeError) {
            console.error('创建头衔错误:', badgeError);
            return;
        }
        
        badgeId = newBadge[0].id;
    }
    
    // 将头衔分配给用户
    const { error: userBadgeError } = await supabase
        .from('user_badges')
        .insert([
            { 
                user_id: userId,
                badge_id: badgeId,
                obtained_at: new Date(),
                expires_at: isPermanent ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
            }
        ]);
    
    if (userBadgeError) {
        console.error('分配头衔错误:', userBadgeError);
    }
}
