// ③ 页面：赞助板块。字段形状见 @t/donation。
import type { Donation } from '@t/donation';
import wechatImg from '@/assets/images/sponsor/wechat.png';
import alipayImg from '@/assets/images/sponsor/alipay.png';

export const donationConfig: Donation = {
  // 完整赞助区的引导首句；首页使用，修改会同步影响所有完整 Sponsor 区块。
  messageLead: '如果我的内容对你有帮助，欢迎',
  // 完整赞助区的支持动作文案；与咖啡图标一起显示为强调内容。
  messageCoffee: '请我喝杯咖啡',
  // 统一赞助区的收束句；首页与详情页紧凑版共用，保持文案一致。
  messageTail: ' —— 支持内容创作，让下一篇继续发生。',
  // 赞助方式列表。渲染规则：
  //   image = 本地二维码（import，构建压缩；无图则渲染占位框）→ 进入二维码网格，序号 wechat=01 / alipay=02
  //   url   = 外站赞助链接；key 固定 'afdian' 时渲染为板块上部的独立赞助链接
  methods: [
    {
      key: 'wechat',
      name: '微信支付',
      image: wechatImg,
    },
    {
      key: 'alipay',
      name: '支付宝',
      image: alipayImg,
    },
    {
      key: 'afdian',
      name: '爱发电',
      url: 'https://ifdian.net/a/moewah',
    },
  ],
};
