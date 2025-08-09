/**
 * 验证用户名
 * @param {string} username - 用户名
 * @returns {string|null} - 错误信息，null表示验证通过
 */
export function validateUsername(username) {
    // 检查是否为空
    if (!username.trim()) {
        return '用户名不能为空';
    }
    
    // 检查长度
    if (username.length < 2 || username.length > 20) {
        return '用户名长度必须在2-20个字符之间';
    }
    
    // 检查格式（字母、数字、下划线）
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return '用户名只能包含字母、数字和下划线';
    }
    
    return null;
}

/**
 * 验证密码
 * @param {string} password - 密码
 * @returns {string|null} - 错误信息，null表示验证通过
 */
export function validatePassword(password) {
    // 检查是否为空
    if (!password) {
        return '密码不能为空';
    }
    
    // 检查长度
    if (password.length < 6) {
        return '密码长度不能少于6个字符';
    }
    
    // 检查是否包含数字和字母
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
        return '密码必须同时包含字母和数字';
    }
    
    return null;
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {string|null} - 错误信息，null表示验证通过
 */
export function validateEmail(email) {
    // 检查是否为空
    if (!email.trim()) {
        return '邮箱不能为空';
    }
    
    // 检查格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return '请输入有效的邮箱地址';
    }
    
    return null;
}

/**
 * 验证帖子标题
 * @param {string} title - 标题
 * @returns {string|null} - 错误信息，null表示验证通过
 */
export function validatePostTitle(title) {
    // 检查是否为空
    if (!title.trim()) {
        return '标题不能为空';
    }
    
    // 检查长度
    if (title.length > 50) {
        return '标题长度不能超过50个字符';
    }
    
    return null;
}

/**
 * 验证帖子内容
 * @param {string} content - 内容
 * @returns {string|null} - 错误信息，null表示验证通过
 */
export function validatePostContent(content) {
    // 检查是否为空
    if (!content.trim()) {
        return '内容不能为空';
    }
    
    // 检查长度
    if (content.length > 2000) {
        return '内容长度不能超过2000个字符';
    }
    
    // 检查是否包含敏感词
    const sensitiveWords = ['色情', '暴力', '赌博', '诈骗', '违法'];
    const hasSensitiveWord = sensitiveWords.some(word => 
        content.includes(word)
    );
    
    if (hasSensitiveWord) {
        return '内容包含敏感词，请修改后再提交';
    }
    
    return null;
}

/**
 * 验证价格
 * @param {string|number} price - 价格
 * @returns {string|null} - 错误信息，null表示验证通过
 */
export function validatePrice(price) {
    // 检查是否为空
    if (price === '' || price === null || price === undefined) {
        return '价格不能为空';
    }
    
    // 转换为数字
    const priceNum = parseFloat(price);
    
    // 检查是否为有效数字
    if (isNaN(priceNum)) {
        return '请输入有效的价格';
    }
    
    // 检查是否为正数
    if (priceNum < 0) {
        return '价格不能为负数';
    }
    
    // 检查是否超过最大值
    if (priceNum > 1000000) {
        return '价格不能超过1000000';
    }
    
    return null;
}

/**
 * 防XSS处理
 * @param {string} str - 需要处理的字符串
 * @returns {string} - 处理后的字符串
 */
export function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * 验证并清理用户输入
 * @param {string} input - 用户输入
 * @returns {string} - 清理后的输入
 */
export function sanitizeInput(input) {
    // 先进行HTML转义
    let sanitized = escapeHtml(input);
    
    // 允许一些基本的换行和空格
    sanitized = sanitized.replace(/\n/g, '<br>');
    
    return sanitized;
}
