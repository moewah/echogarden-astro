/** ③ 页面：我在别处（外部触点） */
export interface ElsewhereLink {
  name: string;
  description: string;
  url: string;
  external: boolean;
  icon: string;
  enabled?: boolean;
}
