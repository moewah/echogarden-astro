// ③ 页面：留言须知。字段形状见 @t/guestbook。
import type { GuestbookInfo } from '@t/guestbook';

export const guestbookConfig: GuestbookInfo = {
  // 留言须知（留言板块右侧信息框 1）
  notice:
    '欢迎交流，友善第一。技术问题可以直接在对应文章下评论，这里更适合闲聊、建议与反馈。',
  // 回音（留言板块右侧信息框 2）
  echo:
    '我基本每天都会来翻留言，一般 24 小时内回复。如果没回，大概是在折腾什么新东西……稍等片刻。',
};
