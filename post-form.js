import { supabase, checkUser } from './supabase.js';
import { createPost } from './posts.js';

// 全局变量
let selectedCategory = '表白墙';
let uploadedImages = [];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 检查用户登录状态
    const user = await checkUser();
    if (!user) {
        // 用户未登录，跳转到登录页
        window.location.href = 'login.html?redirect=post.html';
        return;
    }
    
    // 初始化分类标签切换
    initCategoryTabs();
    
    // 初始化字数统计
    initWordCount();
    
    // 初始化图片上传
    initImageUpload();
    
    // 初始化按钮事件
    initButtonEvents();
});

// 初始化分类标签切换
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const anonymousOption = document.getElementById('anonymous-option');
    const priceInput = document.getElementById('price-input');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的选中状态
            categoryTabs.forEach(t => {
                t.classList.remove('bg-primary', 'text-white');
                t.classList.add('bg-gray-100', 'text-gray-700');
            });
            
            // 设置当前标签为选中状态
            tab.classList.remove('bg-gray-100', 'text-gray-700');
            tab.classList.add('bg-primary', 'text-white');
            
            // 更新选中的分类
            selectedCategory = tab.dataset.category;
            
            // 根据分类显示/隐藏特定选项
            if (selectedCategory === '表白墙') {
                anonymousOption.classList.remove('hidden');
                priceInput.classList.add('hidden');
            } else if (selectedCategory === '二手交易') {
                anonymousOption.classList.add('hidden');
                priceInput.classList.remove('hidden');
            } else {
                anonymousOption.classList.add('hidden');
                priceInput.classList.add('hidden');
            }
        });
    });
}

// 初始化字数统计
function initWordCount() {
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const titleCount = document.getElementById('title-count');
    const contentCount = document.getElementById('content-count');
    
    titleInput.addEventListener('input', () => {
        titleCount.textContent = titleInput.value.length;
    });
    
    contentInput.addEventListener('input', () => {
        contentCount.textContent = contentInput.value.length;
    });
}

// 初始化图片上传
function initImageUpload() {
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    imageUpload.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        // 显示预览容器
        imagePreviewContainer.classList.remove('hidden');
        
        // 处理每个选中的文件
        for (let i = 0; i < files.length; i++) {
            // 限制最多上传5张图片
            if (uploadedImages.length >= 5) {
                alert('最多只能上传5张图片');
                break;
            }
            
            const file = files[i];
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                alert('请上传图片文件');
                continue;
            }
            
            // 创建预览
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageId = `image-${Date.now()}-${i}`;
                uploadedImages.push({
                    id: imageId,
                    file: file,
                    url: event.target.result
                });
                
                // 创建预览元素
                const previewItem = document.createElement('div');
                previewItem.id = imageId;
                previewItem.className = 'relative w-24 h-24 rounded-lg overflow-hidden';
                previewItem.innerHTML = `
                    <img src="${event.target.result}" alt="预览图" class="w-full h-full object-cover">
                    <button class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70" 
                            onclick="removeImage('${imageId}')">
                        <i class="fa fa-times text-xs"></i>
                    </button>
                `;
                
                imagePreviewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
        
        // 重置input，允许重复选择同一文件
        imageUpload.value = '';
    });
    
    // 允许拖拽上传
    const imageUploadArea = document.getElementById('image-upload-area');
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('border-primary');
    });
    
    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('border-primary');
    });
    
    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('border-primary');
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // 将拖拽的文件赋值给input
            const dataTransfer = new DataTransfer();
            for (let i = 0; i < files.length; i++) {
                dataTransfer.items.add(files[i]);
            }
            imageUpload.files = dataTransfer.files;
            
            // 触发change事件
            const event = new Event('change');
            imageUpload.dispatchEvent(event);
        }
    });
}

// 移除已上传的图片
window.removeImage = function(imageId) {
    // 从数组中移除
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    
    // 从DOM中移除
    const imageElement = document.getElementById(imageId);
    if (imageElement) {
        imageElement.remove();
    }
    
    // 如果没有图片了，隐藏预览容器
    if (uploadedImages.length === 0) {
        document.getElementById('image-preview-container').classList.add('hidden');
    }
};

// 初始化按钮事件
function initButtonEvents() {
    // 预览按钮
    document.getElementById('preview-button').addEventListener('click', generatePreview);
    
    // 关闭预览按钮
    document.getElementById('close-preview').addEventListener('click', () => {
        document.getElementById('preview-modal').classList.add('hidden');
    });
    
    // 保存草稿按钮
    document.getElementById('save-draft-button').addEventListener('click', saveDraft);
    
    // 发布按钮
    document.getElementById('publish-button').addEventListener('click', publishPost);
    
    // 成功模态框按钮
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('publish-another').addEventListener('click', () => {
        document.getElementById('success-modal').classList.add('hidden');
        // 清空表单
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('title-count').textContent = '0';
        document.getElementById('content-count').textContent = '0';
        
        // 移除所有图片
        uploadedImages.forEach(img => {
            const imageElement = document.getElementById(img.id);
            if (imageElement) imageElement.remove();
        });
        uploadedImages = [];
        document.getElementById('image-preview-container').classList.add('hidden');
    });
}

// 生成预览
function generatePreview() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const visibility = document.querySelector('input[name="visibility"]:checked').value;
    const isAnonymous = document.getElementById('anonymous-checkbox').checked;
    
    // 简单验证
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    // 构建预览HTML
    let previewHtml = `
        <div class="mb-4">
            <div class="flex items-center mb-3">
                <span class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    ${selectedCategory}
                </span>
                <span class="ml-2 text-xs text-gray-500">
                    ${visibility === '本校可见' ? '仅本校可见' : '全平台可见'}
                </span>
            </div>
            <h3 class="text-xl font-bold mb-3">${title}</h3>
            <p class="text-gray-700 whitespace-pre-line">${content}</p>
        </div>
    `;
    
    // 添加图片预览
    if (uploadedImages.length > 0) {
        previewHtml += `
            <div class="grid grid-cols-${uploadedImages.length <= 3 ? uploadedImages.length : 3} gap-2 my-4">
        `;
        
        uploadedImages.forEach(img => {
            previewHtml += `
                <img src="${img.url}" alt="图片预览" class="rounded-lg w-full object-cover" style="height: 120px;">
            `;
        });
        
        previewHtml += `</div>`;
    }
    
    // 添加价格信息（如果是二手交易）
    if (selectedCategory === '二手交易') {
        const price = document.getElementById('post-price').value;
        if (price) {
            previewHtml += `
                <div class="mt-3 inline-block px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                    ¥${price}
                </div>
            `;
        }
    }
    
    // 显示发布者信息预览
    previewHtml += `
        <div class="mt-6 pt-4 border-t border-gray-100 flex items-center">
            <img src="https://picsum.photos/id/237/40/40" alt="你的头像" class="w-10 h-10 rounded-full object-cover">
            <div class="ml-3">
                <div class="flex items-center">
                    <span class="font-medium">${isAnonymous ? '匿名用户' : '你的昵称'}</span>
                    <span class="ml-2 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">你的头衔</span>
                </div>
                <p class="text-xs text-gray-500">你的学校 · 你的年级 (刚刚)</p>
            </div>
        </div>
    `;
    
    // 更新预览内容并显示模态框
    document.getElementById('preview-content').innerHTML = previewHtml;
    document.getElementById('preview-modal').classList.remove('hidden');
}

// 保存草稿
async function saveDraft() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    // 至少需要填写一项才能保存草稿
    if (!title && !content) {
        alert('请填写标题或内容后再保存草稿');
        return;
    }
    
    try {
        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('请先登录');
            return;
        }
        
        // 准备草稿数据
        const draftData = {
            user_id: user.id,
            title: title,
            content: content,
            category: selectedCategory,
            visibility: document.querySelector('input[name="visibility"]:checked').value,
            is_anonymous: document.getElementById('anonymous-checkbox').checked,
            price: selectedCategory === '二手交易' ? document.getElementById('post-price').value : null,
            created_at: new Date()
        };
        
        // 保存到草稿箱（这里简化处理，实际项目中应该有一个drafts表）
        const { error } = await supabase
            .from('drafts')
            .insert([draftData]);
        
        if (error) {
            throw error;
        }
        
        alert('草稿保存成功');
    } catch (error) {
        console.error('保存草稿失败:', error);
        alert('保存草稿失败，请稍后重试');
    }
}

// 发布帖子
async function publishPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    // 验证表单
    if (!title) {
        alert('请填写标题');
        return;
    }
    
    if (!content) {
        alert('请填写内容');
        return;
    }
    
    if (title.length > 50) {
        alert('标题不能超过50个字');
        return;
    }
    
    if (content.length > 2000) {
        alert('内容不能超过2000个字');
        return;
    }
    
    // 二手交易需要填写价格
    if (selectedCategory === '二手交易' && !document.getElementById('post-price').value) {
        alert('请填写价格');
        return;
    }
    
    try {
        // 准备发布数据
        const postData = {
            title: title,
            content: content,
            category: selectedCategory,
            visibility: document.querySelector('input[name="visibility"]:checked').value,
            // 其他字段如匿名、价格等可以在这里添加
        };
        
        // 调用发布API
        const newPost = await createPost(postData);
        
        if (newPost) {
            // 如果有图片，上传图片
            if (uploadedImages.length > 0) {
                await uploadPostImages(newPost.id);
            }
            
            // 显示成功模态框
            document.getElementById('success-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('发布失败:', error);
        alert('发布失败：' + error.message);
    }
}

// 上传帖子图片
async function uploadPostImages(postId) {
    // 这里简化处理，实际项目中需要将图片上传到Supabase Storage
    // 然后将图片URL保存到数据库中
    
    for (const image of uploadedImages) {
        // 生成唯一的文件名
        const fileName = `posts/${postId}/${Date.now()}-${image.file.name}`;
        
        // 上传图片到Supabase Storage
        const { error } = await supabase
            .storage
            .from('post-images')
            .upload(fileName, image.file);
        
        if (error) {
            console.error('上传图片失败:', error);
            // 这里可以选择继续上传其他图片或终止
        } else {
            // 获取图片URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('post-images')
                .getPublicUrl(fileName);
            
            // 将图片URL保存到posts表或单独的post_images表
            await supabase
                .from('post_images')
                .insert([
                    {
                        post_id: postId,
                        image_url: publicUrl
                    }
                ]);
        }
    }
}
