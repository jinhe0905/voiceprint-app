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
// 初始化登录表单提交
function initLoginForm() {
    const { loginForm, loginPhone, loginPassword, loginBtn } = window.elements;
    
    // 自动填充演示账号信息
    if (loginPhone) loginPhone.value = "13800138000";
    if (loginPassword) loginPassword.value = "password123";
    
    // 展示模式下，点击登录按钮直接通过
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 禁用按钮，显示加载状态
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="loader"></span> 登录中...';
        
        // 模拟登录请求
        setTimeout(() => {
            // 登录成功，跳转到仪表盘页面
            window.location.href = 'dashboard.html';
        }, 1500);
    });
}

// 验证登录表单
function validateLoginForm() {
    const { loginPhone, loginPassword } = window.elements;
    
    // 验证手机号
    if (!validatePhone(loginPhone.value)) {
        showInputError(loginPhone, '请输入有效的手机号码');
        return false;
    }
    
    // 验证密码
    if (!loginPassword.value.trim()) {
        showInputError(loginPassword, '请输入密码');
        return false;
    }
    
    return true;
}

// 初始化注册表单提交
function initRegisterForm() {
    const { registerForm, registerBtn } = window.elements;
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 表单验证
        if (!validateRegisterForm()) {
            return;
        }
        
        // 禁用按钮，显示加载状态
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="loader"></span> 注册中...';
        
        // 模拟注册请求
        setTimeout(() => {
            // 注册成功，跳转到登录选项卡
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="bi bi-person-plus"></i> 注册';
            
            // 显示成功消息并切换到登录选项卡
            alert('注册成功！请使用您的手机号和密码登录。');
            window.elements.loginTab.click();
            
            // 清空注册表单
            registerForm.reset();
        }, 1500);
    });
}

// 验证注册表单
function validateRegisterForm() {
    const { 
        registerPhone, verificationCode, registerPassword, 
        confirmPassword, agreement 
    } = window.elements;
    
    // 验证手机号
    if (!validatePhone(registerPhone.value)) {
        showInputError(registerPhone, '请输入有效的手机号码');
        return false;
    }
    
    // 验证验证码
    if (!verificationCode.value.trim() || verificationCode.value.trim().length !== 6) {
        showInputError(verificationCode, '请输入6位验证码');
        return false;
    }
    
    // 验证密码
    if (!validatePassword(registerPassword.value)) {
        showInputError(registerPassword, '密码至少需要8位，包含数字和字母');
        return false;
    }
    
    // 验证确认密码
    if (confirmPassword.value !== registerPassword.value) {
        showInputError(confirmPassword, '两次输入的密码不一致');
        return false;
    }
    
    // 验证协议勾选
    if (!agreement.checked) {
        alert('请阅读并同意用户协议和隐私政策');
        return false;
    }
    
    return true;
}

// 初始化验证码获取
function initVerificationCode() {
    const { getCodeBtn, registerPhone } = window.elements;
    
    getCodeBtn.addEventListener('click', function() {
        // 验证手机号
        if (!validatePhone(registerPhone.value)) {
            showInputError(registerPhone, '请输入有效的手机号码');
            return;
        }
        
        // 禁用按钮并开始倒计时
        startCountdown(getCodeBtn);
        
        // 模拟发送验证码
        console.log('发送验证码到:', registerPhone.value);
    });
}

// 开始验证码按钮倒计时
function startCountdown(button, seconds = 60) {
    // 保存原始文本
    const originalText = button.textContent;
    
    // 禁用按钮
    button.disabled = true;
    
    // 设置倒计时
    let countdown = seconds;
    button.textContent = `${countdown}秒后重试`;
    
    // 创建定时器
    const timer = setInterval(() => {
        countdown--;
        button.textContent = `${countdown}秒后重试`;
        
        if (countdown <= 0) {
            // 清除定时器并恢复按钮
            clearInterval(timer);
            button.disabled = false;
            button.textContent = originalText;
        }
    }, 1000);
}

// 验证手机号格式
function validatePhone(phone) {
    // 中国大陆手机号验证规则
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// 验证密码格式
function validatePassword(password) {
    // 至少8位，包含数字和字母
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}

// 显示输入错误
function showInputError(inputElement, message) {
    // 添加错误样式
    inputElement.classList.add('error');
    
    // 显示错误消息
    const formGroup = inputElement.closest('.form-group');
    let errorElement = formGroup.querySelector('.error-message');
    
    // 如果错误消息元素不存在，则创建
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        
        // 如果是带有图标的输入框，需要插入到父容器之后
        const inputContainer = inputElement.closest('.input-icon-wrapper') || inputElement;
        inputContainer.parentNode.insertBefore(errorElement, inputContainer.nextSibling);
    }
    
    // 设置错误消息
    errorElement.textContent = message;
    
    // 添加输入变化事件，以清除错误
    const clearError = function() {
        inputElement.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        // 移除事件监听器
        inputElement.removeEventListener('input', clearError);
    };
    
    // 添加输入事件监听器
    inputElement.addEventListener('input', clearError);
}

// 显示登录错误
function showLoginError(message) {
    const { loginForm } = window.elements;
    
    // 查找或创建错误消息容器
    let errorContainer = loginForm.querySelector('.login-error');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'login-error';
        loginForm.insertBefore(errorContainer, loginForm.firstChild);
    }
    
    // 设置错误消息
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // 自动隐藏错误消息
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// 初始化展示动效
function initShowcaseAnimations() {
    const { showcaseCard, techIndicators } = window.elements;
    
    // 添加展示卡片的3D旋转效果
    if (showcaseCard) {
        showcaseCard.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 计算旋转角度，最大为10度
            const rotateY = ((x / rect.width) - 0.5) * 10;
            const rotateX = ((y / rect.height) - 0.5) * -10;
            
            // 应用3D变换
            this.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });
        
        // 鼠标离开时恢复初始状态
        showcaseCard.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)';
        });
    }
    
    // 添加技术指标动画
    if (techIndicators) {
        // 页面加载后自动触发一次动画
        setTimeout(() => {
            const indicators = techIndicators.querySelectorAll('.indicator-value');
            indicators[0].style.width = '85%';
            
            setTimeout(() => {
                indicators[1].style.width = '92%';
                
                setTimeout(() => {
                    indicators[2].style.width = '89%';
                }, 300);
            }, 300);
        }, 1000);
    }
} 