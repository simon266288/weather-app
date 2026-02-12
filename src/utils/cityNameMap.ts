/**
 * 城市名称映射 - 英文到中文
 * 用于显示简体中文城市名
 */

export const cityNameMap: Record<string, string> = {
  // 直辖市
  'Beijing': '北京',
  'Shanghai': '上海',
  'Tianjin': '天津',
  'Chongqing': '重庆',

  // 省份
  'Hubei': '湖北',
  'Guangdong': '广东',
  'Hebei': '河北',
  'Shanxi': '山西',
  'Liaoning': '辽宁',
  'Jilin': '吉林',
  'Heilongjiang': '黑龙江',
  'Jiangsu': '江苏',
  'Zhejiang': '浙江',
  'Anhui': '安徽',
  'Fujian': '福建',
  'Jiangxi': '江西',
  'Shandong': '山东',
  'Henan': '河南',
  'Hunan': '湖南',
  'Guangxi': '广西',
  'Hainan': '海南',
  'Sichuan': '四川',
  'Guizhou': '贵州',
  'Yunnan': '云南',
  'Shaanxi': '陕西',
  'Gansu': '甘肃',
  'Qinghai': '青海',
  'Taiwan': '台湾',
  'Nei Mongol': '内蒙古',
  'Inner Mongolia': '内蒙古',
  'Guangxi Zhuangzu Zizhiqu': '广西',
  'Tibet': '西藏',
  'Xizang': '西藏',
  'Ningxia': '宁夏',
  'Xinjiang': '新疆',
  
  // 省会城市
  'Guangzhou': '广州',
  'Shenzhen': '深圳',
  'Hangzhou': '杭州',
  'Nanjing': '南京',
  'Chengdu': '成都',
  'Wuhan': '武汉',
  'Xi\'an': '西安',
  'Zhengzhou': '郑州',
  'Changsha': '长沙',
  'Shenyang': '沈阳',
  'Dalian': '大连',
  'Qingdao': '青岛',
  'Jinan': '济南',
  'Harbin': '哈尔滨',
  'Changchun': '长春',
  'Shijiazhuang': '石家庄',
  'Taiyuan': '太原',
  'Hohhot': '呼和浩特',
  'Urumqi': '乌鲁木齐',
  'Lanzhou': '兰州',
  'Yinchuan': '银川',
  'Xining': '西宁',
  'Lhasa': '拉萨',
  'Kunming': '昆明',
  'Guiyang': '贵阳',
  'Nanning': '南宁',
  'Haikou': '海口',
  'Fuzhou': '福州',
  'Xiamen': '厦门',
  'Nanchang': '南昌',
  'Hefei': '合肥',
  'Suzhou': '苏州',
  'Wuxi': '无锡',
  'Ningbo': '宁波',
  'Wenzhou': '温州',
  'Foshan': '佛山',
  'Dongguan': '东莞',
  'Zhuhai': '珠海',
  'Zhongshan': '中山',
  'Shantou': '汕头',
  'Huizhou': '惠州',
  'Jiangmen': '江门',
  'Zhanjiang': '湛江',
  'Zhaoqing': '肇庆',
  'Shaoguan': '韶关',
  'Yangjiang': '阳江',
  'Yunfu': '云浮',
  'Maoming': '茂名',
  'Meizhou': '梅州',
  'Shanwei': '汕尾',
  'Heyuan': '河源',
  'Qingyuan': '清远',
  'Jieyang': '揭阳',
  'Chaozhou': '潮州',
  
  // 其他重要城市
  'Hong Kong': '香港',
  'Macao': '澳门',
  'Taipei': '台北',
  'Kaohsiung': '高雄',
};

/**
 * 获取城市中文名
 */
export function getCityNameCN(englishName: string): string {
  return cityNameMap[englishName] || englishName;
}

/**
 * 将英文城市名转换为中文
 * 用于显示
 */
export function translateCityName(name: string): string {
  // 直接匹配
  if (cityNameMap[name]) {
    return cityNameMap[name];
  }
  
  // 尝试去掉空格匹配
  const noSpaceName = name.replace(/\s+/g, '');
  for (const [en, cn] of Object.entries(cityNameMap)) {
    if (en.replace(/\s+/g, '') === noSpaceName) {
      return cn;
    }
  }
  
  return name;
}
