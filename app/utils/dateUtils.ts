/**
 * 日期工具函数
 */

/**
 * 获取今日日期字符串 (YYYY-MM-DD 格式)
 */
export function getLocalToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将日期对象转换为日期字符串 (YYYY-MM-DD 格式)
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将日期字符串转换为 YYYY-MM-DD 格式
 * 支持 ISO 8601 格式和 YYYY-MM-DD 格式
 */
export function isoToLocalDate(dateString: string): string {
  const date = new Date(dateString)
  return formatLocalDate(date)
}

/**
 * 格式化显示日期（中文格式：2024年1月1日）
 */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

/**
 * 格式化简短日期（MM/DD 格式）
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date
    .toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    })
    .replace('月', '/')
    .replace('日', '')
}

/**
 * 检查日期字符串是否为今天
 */
export function isToday(dateStr: string): boolean {
  return isoToLocalDate(dateStr) === getLocalToday()
}
