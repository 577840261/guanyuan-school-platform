import { supabase, checkUser, getUserProfile } from './supabase.js';
import { getPostById, addComment } from './posts.js';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 获取URL中的帖子ID
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        // 如果没有帖子ID，跳回首页
        window.location.href = 'index.html';
        return;
    }
    
    // 检查用户登录状态
    const user = await checkUser();
    if (user) {
        // 用户已登录，获取并显示用户头像
        const profile = await getUserProfile(user.id);
        const avatarUrl = profile?.avatar_url || `https://picsum.photos/id/${user.id.charCodeAt(0)}/40/40`;
        document.getElementById('current-user-avatar').src = avatarUrl;
    } else {
        // 用户未登录，评论框提示登录
        document.getElementById('comment-input').placeholder = '请登录后评论...';
        document.getElementById('comment-input').disabled = true;
        document.getElementById('submit-comment').disabled = true;
        document.getElementById('submit-comment').classList.add('bg-gray-300');
        document.getElementById('submit-comment').classList.remove('bg-primary', 'hover:bg-primary/90');
    }
    
    // 加载帖子详情
    await loadPostDetail(postId);
    
    // 初始化按钮事件
    initButtonEvents(postId, user);
});

// 加载帖子详情
async function loadPostDetail(postId) {
    // 显示加载状态
    const mainContent = document.querySelector('main');
    const originalContent = mainContent.innerHTML;
    mainContent.innerHTML = `
        <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
    `;
    
    try {
        // 获取帖子详情
        const post = await getPostById(postId);
        
        if (!post) {
            mainContent.innerHTML = `
                <div class="text-center py-20 bg-white rounded-xl shadow-sm">
                    <i class="fa fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                    <p class="text-gray-500">帖子不存在或已被删除</p>
                    <a href="index.html" class="mt-3 inline-block px-4 py-2 bg-primary text-white rounded-lg">
                        返回首页
                    </a>
                </div>
            `;
            return;
        }
        
        // 恢复原始内容结构
        mainContent.innerHTML = originalContent;
        
        // 填充帖子数据
        document.getElementById('post-author-avatar').src = post.profiles.avatar_url || `https://picsum.photos/id/${post.user_id.charCodeAt(0)}/100/100`;
        document.getElementById('post-author-name').textContent = post.anonymous ? '匿名用户' : post.profiles.username;
        document.getElementById('post-author-school').textContent = `${post.profiles.school} · ${post.profiles.grade} (${formatTime(post.created_at)})`;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-content').textContent = post.content;
        document.getElementById('post-category').textContent = post.category;
        document.getElementById('like-count').textContent = post.likes || 0;
        document.getElementById('comment-count').textContent = post.comments?.length || 0;
        
        // 设置头衔
        if (post.primaryBadge) {
            document.getElementById('post-author-badge').textContent = post.primaryBadge.name;
        } else {
            document.getElementById('post-author-badge').classList.add('hidden');
        }
        
        // 处理图片
        if (post.images && post.images.length > 0) {
            const imagesContainer = document.getElementById('post-images');
            imagesContainer.classList.remove('hidden');
            
            post.images.forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = '帖子图片';
                imgElement.className = 'rounded-lg w-full h-48 object-cover';
                imagesContainer.appendChild(imgElement);
            });
        }
        
        // 处理价格（仅二手交易）
        if (post.category === '二手交易' && post.price) {
            const priceElement = document.getElementById('post-price');
            priceElement.textContent = `¥${post.price}`;
            priceElement.classList.remove('hidden');
        }
        
        // 加载评论
        loadComments(post.comments);
        
    } catch (error) {
        console.error('加载帖子详情失败:', error);
        mainContent.innerHTML = `
            <div class="text-center py-20 bg-white rounded rounded-xl shadow-sm">
                <i class="fa fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                <p class="text-gray-500">加载失败，请稍后重试</p>
                <button onclick="window.location.reload()" class="mt-3 px-4 py-2 bg-primary text-white rounded-lg">
                    重试
                </button>
            </div>
        `;
    }
}

// 加载评论
function loadComments(comments) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = ''; // 清空现有评论
    
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = `
            <div class="text-center py-6 text-gray-500">
                <i class="fa fa-comment-o text-2xl mb-2"></i>
                <p>还没有评论，快来抢沙发吧！</p>
            </div>
        `;
        return;
    }
    
    // 生成评论HTML
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'flex comment-item';
        
        commentElement.innerHTML = `
            <img src="${comment.profiles.avatar_url || `https://picsum.photos/id/${comment.user_id.charCodeAt(0)}/100/100`}" alt="评论者头像" class="w-8 h-8 rounded-full object-cover">
            <div class="ml-3 flex-1">
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="flex items-center mb-1">
                        <span class="font-medium text-sm">${comment.profiles.username}</span>
                        ${comment.primaryBadge ? `
                            <span class="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">${comment.primaryBadge.name}</span>
                        ` : ''}
                    </div>
                    <p class="text-gray-700 text-sm">${comment.content}</p>
                </div>
                <p class="text-xs text-gray-500 mt-1">${formatTime(comment.created_at)}</p>
                <div class="flex items-center mt-1 space-x-4">
                    <button class="text-xs text-gray-500 hover:text-primary like-comment" data-comment-id="${comment.id}">
                        <i class="fa fa-heart-o mr-1"></i> ${comment.likes || 0}
                    </button>
                    <button class="text-xs text-gray-500 hover:text-primary">
                        <i class="fa fa-reply mr-1"></i> 回复
                    </button>
                </div>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
        
        // 添加评论点赞事件
        commentElement.querySelector('.like-comment').addEventListener('click', async function() {
            const commentId = this.getAttribute('data-comment-id');
            await likeComment(this, commentId);
        });
    });
}

// 初始化按钮事件
function initButtonEvents(postId, user) {
    // 分享按钮
    document.getElementById('share-button').addEventListener('click', () => {
        document.getElementById('share-modal').classList.remove('hidden');
    });
    
    // 关闭分享模态框
    document.getElementById('close-share').addEventListener('click', () => {
        document.getElementById('share-modal').classList.add('hidden');
    });
    
    // 举报按钮
    document.getElementById('report-button').addEventListener('click', () => {
        if (!user) {
            showSuccessMessage('请先登录', '需要登录才能进行举报操作');
            return;
        }
        document.getElementById('report-modal').classList.remove('hidden');
    });
    
    // 关闭举报模态框
    document.getElementById('close-report').addEventListener('click', () => {
        document.getElementById('report-modal').classList.add('hidden');
    });
    
    // 提交举报
    document.getElementById('submit-report').addEventListener('click', async () => {
        const reasons = Array.from(document.querySelectorAll('input[name="report-reason"]:checked'))
            .map(input => input.value);
        
        if (reasons.length === 0) {
            alert('请选择举报原因');
            return;
        }
        
        const description = document.getElementById('report-description').value;
        
        try {
            // 提交举报到Supabase
            const { error } = await supabase
                .from('reports')
                .insert([
                    {
                        post_id: postId,
                        reporter_id: user.id,
                        reason: reasons.join(','),
                        description: description,
                        status: '待处理'
                    }
                ]);
            
            if (error) {
                throw error;
            }
            
            // 显示成功提示
            document.getElementById('report-modal').classList.add('hidden');
            showSuccessMessage('举报成功', '感谢你的反馈，我们会尽快处理');
            
        } catch (error) {
            console.error('提交举报失败:', error);
            alert(`举报失败: ${error.message || '请稍后重试'}`);
        }
    });
    
    // 点赞按钮
    document.getElementById('like-button').addEventListener('click', async function() {
        if (!user) {
            showSuccessMessage('请先登录', '需要登录才能点赞');
            return;
        }
        
        await likePost(this, postId);
    });
    
    // 收藏按钮
    document.getElementById('favorite-button').addEventListener('click', async function() {
        if (!user) {
            showSuccessMessage('请先登录', '需要登录才能收藏');
            return;
        }
        
        const isFavorite = this.classList.contains('text-primary');
        
        try {
            if (isFavorite) {
                // 取消收藏
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId);
                
                if (error) throw error;
                
                this.classList.remove('text-primary');
                this.innerHTML = '<i class="fa fa-star-o"></i><span>收藏</span>';
            } else {
                // 添加收藏
                const { error } = await supabase
                    .from('favorites')
                    .insert([
                        {
                            user_id: user.id,
                            post_id: postId,
                            created_at: new Date()
                        }
                    ]);
                
                if (error) throw error;
                
                this.classList.add('text-primary');
                this.innerHTML = '<i class="fa fa-star"></i><span>已收藏</span>';
            }
            
            showSuccessMessage(isFavorite ? '取消收藏成功' : '收藏成功', '');
            
        } catch (error) {
            console.error('收藏操作失败:', error);
            alert(`操作失败: ${error.message || '请稍后重试'}`);
        }
    });
    
    // 发表评论
    document.getElementById('submit-comment').addEventListener('click', async function() {
        if (!user) return;
        
        const commentContent = document.getElementById('comment-input').value.trim();
        
        if (!commentContent) {
            alert('请输入评论内容');
            return;
        }
        
        // 显示加载状态
        this.disabled = true;
        this.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i> 发表中...';
        
        try {
            // 提交评论
            const newComment = await addComment(postId, commentContent);
            
            if (newComment) {
                // 获取用户资料用于显示
                const userProfile = await getUserProfile(user.id);
                
                // 添加新评论到列表顶部
                const commentsList = document.getElementById('comments-list');
                
                const newCommentElement = document.createElement('div');
                newCommentElement.className = 'flex comment-item animate-fade-in';
                newCommentElement.innerHTML = `
                    <img src="${userProfile.avatar_url || `https://picsum.photos/id/${user.id.charCodeAt(0)}/100/100`}" alt="你的头像" class="w-8 h-8 rounded-full object-cover">
                    <div class="ml-3 flex-1">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="flex items-center mb-1">
                                <span class="font-medium text-sm">${userProfile.username}</span>
                                <!-- 这里可以添加用户头衔 -->
                            </div>
                            <p class="text-gray-700 text-sm">${commentContent}</p>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">刚刚</p>
                        <div class="flex items-center mt-1 space-x-4">
                            <button class="text-xs text-gray-500 hover:text-primary like-comment" data-comment-id="${newComment.id}">
                                <i class="fa fa-heart-o mr-1"></i> 0
                            </button>
                            <button class="text-xs text-gray-500 hover:text-primary">
                                <i class="fa fa-reply mr-1"></i> 回复
                            </button>
                        </div>
                    </div>
                `;
                
                // 添加到列表顶部
                if (commentsList.querySelector('.text-center')) {
                    // 如果之前没有评论，先清空
                    commentsList.innerHTML = '';
                }
                commentsList.prepend(newCommentElement);
                
                // 添加评论点赞事件
                newCommentElement.querySelector('.like-comment').addEventListener('click', async function() {
                    const commentId = this.getAttribute('data-comment-id');
                    await likeComment(this, commentId);
                });
                
                // 更新评论计数
                const commentCountElement = document.getElementById('comment-count');
                commentCountElement.textContent = parseInt(commentCountElement.textContent) + 1;
                
                // 清空评论框
                document.getElementById('comment-input').value = '';
                
                // 显示成功提示
                showSuccessMessage('评论成功', '');
            }
            
        } catch (error) {
            console.error('发表评论失败:', error);
            alert(`评论失败: ${error.message || '请稍后重试'}`);
        } finally {
            // 恢复按钮状态
            this.disabled = false;
            this.innerHTML = '发表评论';
        }
    });
    
    // 关闭成功提示
    document.getElementById('close-success').addEventListener('click', () => {
        document.getElementById('success-modal').classList.add('hidden');
    });
    
    // 加载更多评论
    document.getElementById('load-more-comments').addEventListener('click', function() {
        // 这里可以实现加载更多评论的逻辑
        this.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i> 加载中...';
        
        // 模拟加载延迟
        setTimeout(() => {
            this.innerHTML = '没有更多评论了';
            this.disabled = true;
            this.classList.add('bg-gray-100', 'cursor-not-allowed');
        }, 1000);
    });
}

// 帖子点赞功能
async function likePost(button, postId) {
    const isLiked = button.classList.contains('text-primary');
    const likeCountElement = button.querySelector('span');
    const currentCount = parseInt(likeCountElement.textContent);
    
    try {
        if (isLiked) {
            // 取消点赞
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('post_id', postId);
            
            if (error) throw error;
            
            button.classList.remove('text-primary');
            button.innerHTML = `<i class="fa fa-heart-o"></i><span>${currentCount - 1}</span>`;
        } else {
            // 点赞
            const { error } = await supabase
                .from('likes')
                .insert([
                    {
                        user_id: user.id,
                        post_id: postId,
                        created_at: new Date()
                    }
                ]);
            
            if (error) throw error;
            
            button.classList.add('text-primary');
            button.innerHTML = `<i class="fa fa-heart"></i><span>${currentCount + 1}</span>`;
        }
        
    } catch (error) {
        console.error('点赞操作失败:', error);
        alert(`操作失败: ${error.message || '请稍后重试'}`);
    }
}

// 评论点赞功能
async function likeComment(button, commentId) {
    if (!user) {
        showSuccessMessage('请先登录', '需要登录才能点赞');
        return;
    }
    
    const isLiked = button.classList.contains('text-primary');
    const likeCountText = button.innerHTML.split('</i> ')[1];
    const currentCount = parseInt(likeCountText);
    
    try {
        if (isLiked) {
            // 取消点赞
            const { error } = await supabase
                .from('comment_likes')
                .delete()
                .eq('user_id', user.id)
                .eq('comment_id', commentId);
            
            if (error) throw error;
            
            button.classList.remove('text-primary');
            button.innerHTML = `<i class="fa fa-heart-o mr-1"></i> ${currentCount - 1}`;
        } else {
            // 点赞
            const { error } = await supabase
                .from('comment_likes')
                .insert([
                    {
                        user_id: user.id,
                        comment_id: commentId,
                        created_at: new Date()
                    }
                ]);
            
            if (error) throw error;
            
            button.classList.add('text-primary');
            button.innerHTML = `<i class="fa fa-heart mr-1"></i> ${currentCount + 1}`;
        }
        
    } catch (error) {
        console.error('评论点赞操作失败:', error);
        alert(`操作失败: ${error.message || '请稍后重试'}`);
    }
}

// 显示成功提示
function showSuccessMessage(title, message) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message || '';
    document.getElementById('success-modal').classList.remove('hidden');
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