/**
 * 登录/注册页面的交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化登录功能
    initLogin();
    
    // 初始化选项卡切换
    initTabs();
    
    // 初始化密码显示/隐藏功能
    initPasswordToggle();
    
    // 初始化验证码功能
    initVerificationCode();
});

// 初始化登录功能
function initLogin() {
    // 自动填充演示账号
    const phoneInput = document.getElementById('login-phone');
    const passwordInput = document.getElementById('login-password');
    
    if (phoneInput) phoneInput.value = "13800138000";
    if (passwordInput) passwordInput.value = "password123";
    
    // 登录按钮点击事件
    const loginButton = document.getElementById('login-submit');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            loginButton.disabled = true;
            const originalText = loginButton.innerHTML;
            loginButton.innerHTML = '<span class="login-button-loading"><i class="bi bi-arrow-repeat spinning"></i></span>';
            
            // 模拟登录请求
            setTimeout(() => {
                // 登录成功，跳转到仪表盘页面
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
    
    // 注册按钮点击事件
    const registerButton = document.getElementById('register-submit');
    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            registerButton.disabled = true;
            const originalText = registerButton.innerHTML;
            registerButton.innerHTML = '<span class="login-button-loading"><i class="bi bi-arrow-repeat spinning"></i></span>';
            
            // 模拟注册请求
            setTimeout(() => {
                // 注册成功，切换到登录选项卡
                registerButton.disabled = false;
                registerButton.innerHTML = originalText;
                
                // 显示成功消息
                alert('注册成功！请使用您的手机号和密码登录。');
                
                // 切换到登录选项卡
                const loginTab = document.querySelector('.login-tab[data-tab="login"]');
                if (loginTab) loginTab.click();
            }, 1500);
        });
    }
}

// 初始化选项卡切换
function initTabs() {
    const tabs = document.querySelectorAll('.login-tab');
    const forms = document.querySelectorAll('.login-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-tab');
            
            // 切换标签激活状态
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 切换表单显示
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${target}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

// 初始化密码显示/隐藏功能
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            this.classList.toggle('bi-eye');
            this.classList.toggle('bi-eye-slash');
        });
    });
}

// 初始化验证码功能
function initVerificationCode() {
    const getCodeBtn = document.getElementById('get-verification');
    
    if (getCodeBtn) {
        getCodeBtn.addEventListener('click', function() {
            // 禁用按钮
            getCodeBtn.disabled = true;
            const originalText = getCodeBtn.textContent;
            
            // 开始倒计时
            let countdown = 60;
            getCodeBtn.textContent = `${countdown}秒后重试`;
            
            const timer = setInterval(() => {
                countdown--;
                getCodeBtn.textContent = `${countdown}秒后重试`;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    getCodeBtn.disabled = false;
                    getCodeBtn.textContent = originalText;
                }
            }, 1000);
        });
    }
} 