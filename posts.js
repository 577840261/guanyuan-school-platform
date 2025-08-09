import { supabase, checkUser } from './supabase.js';

// 获取帖子列表
export async function getPosts(scope = 'school', page = 1, limit = 10) {
    const user = await checkUser();
    if (!user) {
        // 用户未登录，只能获取全平台公开内容
        scope = 'all';
    }
    
    let query = supabase
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                avatar_url,
                school,
                grade
            ),
            user_badges (
                badges (
                    name,
                    icon_url
                )
            )
        `, { count: 'exact' })
        .eq('status', '已发布')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
    
    // 根据范围筛选
    if (scope === 'school' && user) {
        // 获取用户所在学校
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('school')
            .eq('id', user.id)
            .single();
        
        if (userProfile?.school) {
            // 本校可见：发布者是本校用户且可见范围是本校，或者可见范围是全平台
            query = query.or(`
                and(visibility.eq.本校可见, profiles.school.eq.${userProfile.school}),
                visibility.eq.全平台可见
            `);
        }
    } else {
        // 全平台：只显示可见范围是全平台的内容
        query = query.eq('visibility', '全平台可见');
    }
    
    const { data, error, count } = await query;
    
    if (error) {
        console.error('Error fetching posts: - posts.js:56', error);
        return { posts: [], total: 0 };
    }
    
    // 处理数据格式
    const posts = data.map(post => ({
        ...post,
        // 提取用户的主要头衔
        primaryBadge: post.user_badges?.[0]?.badges || null
    }));
    
    return { posts, total: count || 0 };
}

// 创建新帖子
export async function createPost(postData) {
    const user = await checkUser();
    if (!user) {
        throw new Error('请先登录');
    }
    
    const { data, error } = await supabase
        .from('posts')
        .insert([
            {
                user_id: user.id,
                title: postData.title,
                content: postData.content,
                category: postData.category,
                visibility: postData.visibility || '本校可见',
                status: '待审核' // 新发布的内容需要审核
            }
        ])
        .select();
    
    if (error) {
        console.error('Error creating post: - posts.js:92', error);
        throw error;
    }
    
    return data[0];
}

// 获取帖子详情
export async function getPostById(id) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                avatar_url,
                school,
                grade
            ),
            user_badges (
                badges (
                    name,
                    icon_url
                )
            ),
            comments (
                *,
                profiles (
                    username,
                    avatar_url
                ),
                user_badges (
                    badges (
                        name,
                        icon_url
                    )
                )
            )
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error fetching post: - posts.js:135', error);
        return null;
    }
    
    return {
        ...data,
        primaryBadge: data.user_badges?.[0]?.badges || null,
        comments: data.comments.map(comment => ({
            ...comment,
            primaryBadge: comment.user_badges?.[0]?.badges || null
        }))
    };
}

// 添加评论
export async function addComment(postId, content) {
    const user = await checkUser();
    if (!user) {
        throw new Error('请先登录');
    }
    
    const { data, error } = await supabase
        .from('comments')
        .insert([
            {
                post_id: postId,
                user_id: user.id,
                content: content
            }
        ])
        .select();
    
    if (error) {
        console.error('Error adding comment: - posts.js:168', error);
        throw error;
    }
    
    return data[0];
}