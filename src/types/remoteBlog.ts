/** ④ 接口：外部博客（RSS 源） */
export interface RemotePost {
  code: string;
  title: string;
  description: string;
  date: string;
  url: string;
}

export interface RemoteBlogConfig {
  enabled: boolean;
  url: string;
  name: string;
  feedUrl: string;
  poolSize: number;
}
