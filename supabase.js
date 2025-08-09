// 导入Supabase客户端库
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 从Supabase项目设置中获取这些值
const supabaseUrl = 'https://zbukulmmfoozahpgmzlp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidWt1bG1tZm9vemFocGdtemxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MDU5NDMsImV4cCI6MjA3MDI4MTk0M30.XA2Yu42pRdbqaxa509hqgYeJMAoBo0M2Pl_ZUyZPGaQ'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey)

// 用于检查用户是否已登录
export async function checkUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session: - supabase.js:16', error)
    return null
  }
  
  return session?.user || null
}

// 用于获取用户资料
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error getting user profile: - supabase.js:32', error)
    return null
  }
  
  return data
}
