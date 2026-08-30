/** ③ 页面：赞助 */
export interface DonationMethod {
  key: string;
  name: string;
  image?: import('astro').ImageMetadata;
  url?: string;
}

export interface Donation {
  messageLead: string;
  messageCoffee: string;
  messageTail: string;
  methods: DonationMethod[];
}
