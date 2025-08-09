/**
 * 图片懒加载初始化
 */
export function initLazyLoading() {
    // 检查浏览器是否原生支持IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    // 替换图片源
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    // 停止观察
                    observer.unobserve(image);
                }
            });
        });
        
        // 获取所有需要懒加载的图片
        document.querySelectorAll('img[data-src]').forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // 浏览器不支持，降级处理
        document.querySelectorAll('img[data-src]').forEach(image => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        });
    }
}

/**
 * 缓存API数据
 * @param {string} key - 缓存键名
 * @param {any} data - 要缓存的数据
 * @param {number} ttl - 缓存时间（毫秒），默认24小时
 */
export function cacheData(key, data, ttl = 86400000) {
    const item = {
        data: data,
        expiry: Date.now() + ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
}

/**
 * 获取缓存数据
 * @param {string} key - 缓存键名
 * @returns {any|null} - 缓存的数据，过期或不存在则返回null
 */
export function getCachedData(key) {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;
    
    try {
        const parsed = JSON.parse(item);
        // 检查是否过期
        if (Date.now() > parsed.expiry) {
            // 过期，清除缓存
            localStorage.removeItem(`cache_${key}`);
            return null;
        }
        return parsed.data;
    } catch (error) {
        console.error('Failed to parse cached data: - performance.js:68', error);
        localStorage.removeItem(`cache_${key}`);
        return null;
    }
}

/**
 * 清除指定缓存
 * @param {string} key - 缓存键名
 */
export function clearCache(key) {
    localStorage.removeItem(`cache_${key}`);
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
    // 获取所有缓存键并删除
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
        }
    });
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 防抖后的函数
 */
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} - 节流后的函数
 */
export function throttle(func, limit) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/**
 * 预加载关键资源
 * @param {Array} resources - 资源列表，每个元素是一个对象，包含url和type
 */
export function preloadResources(resources) {
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.url;
        link.as = resource.type;
        document.head.appendChild(link);
    });
}
