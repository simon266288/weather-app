import { chromium } from 'playwright';

async function testWeatherApp() {
  console.log('=== 天气应用测试 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    // 1. 打开应用
    console.log('1. 打开应用...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('   ✅ 页面加载成功\n');

    // 2. 检查基本元素
    console.log('2. 检查页面元素...');
    
    // 检查 Header
    const header = await page.$('header');
    console.log(`   ${header ? '✅' : '❌'} Header: ${header ? '存在' : '缺失'}`);
    
    // 检查侧边栏（不应该有"天气"标题）
    const sidebarTitle = await page.$('text=天气');
    const sidebarTitleCount = sidebarTitle ? await sidebarTitle.count() : 0;
    console.log(`   ${sidebarTitleCount <= 1 ? '✅' : '⚠️'} 侧边栏标题: ${sidebarTitleCount <= 1 ? '已移除或仅在Header' : '还有残留'}`);
    
    // 检查搜索按钮
    const searchBtn = await page.getByRole('button', { name: /搜索城市/ });
    console.log(`   ${await searchBtn.isVisible().catch(() => false) ? '✅' : '❌'} 搜索按钮: 可见`);
    
    // 检查刷新按钮
    const refreshBtn = await page.getByRole('button', { name: /刷新/ });
    console.log(`   ${await refreshBtn.isVisible().catch(() => false) ? '✅' : '❌'} 刷新按钮: 可见`);
    
    // 检查主题切换
    const themeBtn = await page.locator('header button').last();
    console.log(`   ${await themeBtn.isVisible().catch(() => false) ? '✅' : '❌'} 主题切换: 可见\n`);

    // 3. 测试搜索功能
    console.log('3. 测试搜索功能...');
    const searchButton = await page.locator('button:has-text("搜索城市")');
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click();
      await page.waitForTimeout(500);
      
      // 检查搜索弹窗
      const searchInput = await page.locator('input[placeholder*="搜索"]');
      if (await searchInput.isVisible().catch(() => false)) {
        console.log('   ✅ 搜索弹窗打开');
        
        // 测试输入
        await searchInput.fill('上海');
        await page.waitForTimeout(1000);
        console.log('   ✅ 搜索框可以输入文字');
        
        // 关闭搜索弹窗
        const cancelBtn = await page.getByRole('button', { name: '取消' });
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
          console.log('   ✅ 关闭搜索弹窗');
        }
      }
    }
    console.log('');

    // 4. 检查预报卡片
    console.log('4. 检查预报卡片...');
    const forecastCards = await page.locator('.neumorph-card').count();
    console.log(`   ✅ 找到 ${forecastCards} 个卡片\n`);

    // 5. 检查温度趋势图表
    console.log('5. 检查温度趋势图表...');
    const chart = await page.locator('.recharts-wrapper, svg').first();
    console.log(`   ${await chart.isVisible().catch(() => false) ? '✅' : '❌'} 温度趋势图表: 可见\n`);

    // 6. 检查控制台错误
    console.log('6. 控制台错误检查...');
    if (errors.length > 0) {
      console.log(`   ⚠️ 发现 ${errors.length} 个错误:`);
      errors.slice(0, 3).forEach((e, i) => console.log(`   ${i+1}. ${e.substring(0, 100)}`));
    } else {
      console.log('   ✅ 无控制台错误\n');
    }

    console.log('=== 测试完成 ===');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

testWeatherApp();
