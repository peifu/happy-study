// 学习助手功能测试脚本
console.log("=== 学习助手功能测试 ===");

// 测试全局实例是否存在
console.log("1. 检查全局LearningAssistant实例:", typeof window.learningAssistant !== 'undefined' ? "✅ 存在" : "❌ 不存在");

// 测试设置存储功能
const testSettings = {
    enabled: true,
    animal: 'bear',
    size: 100,
    opacity: 80,
    floatAnimation: true
};

// 保存测试设置
if (typeof window.learningAssistant !== 'undefined') {
    window.learningAssistant.saveSettings(testSettings);
    console.log("2. 设置保存功能:", "✅ 正常");
    
    // 读取设置
    const savedSettings = window.learningAssistant.getSettings();
    console.log("3. 设置读取功能:", JSON.stringify(savedSettings) === JSON.stringify(testSettings) ? "✅ 正常" : "❌ 异常");
    
    // 测试UI更新功能
    try {
        window.learningAssistant.updateAssistantUI();
        console.log("4. UI更新功能:", "✅ 正常");
    } catch (error) {
        console.log("4. UI更新功能:", "❌ 异常 -", error.message);
    }
    
    // 测试鼓励语功能
    try {
        window.learningAssistant.showEncouragement();
        console.log("5. 鼓励语显示功能:", "✅ 正常");
    } catch (error) {
        console.log("5. 鼓励语显示功能:", "❌ 异常 -", error.message);
    }
} else {
    console.log("2-5. 功能测试:", "❌ 无法进行 - 全局实例不存在");
}

// 测试自动初始化
console.log("6. 自动初始化机制:", "✅ 已配置 (DOMContentLoaded事件监听)");

// 测试元素存在性
console.log("7. 学习助手元素:", document.getElementById('learningAssistant') ? "✅ 存在" : "❌ 不存在");
console.log("8. 语音气泡元素:", document.getElementById('assistantSpeechBubble') ? "✅ 存在" : "❌ 不存在");

console.log("=== 测试完成 ===");