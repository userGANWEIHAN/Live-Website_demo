// 替换为你的 Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxbL473AQ6RKNjB5s8Hk_5BSwuKUTSyKjYwIihR-cJhAT7WrS6fOEH8t5jLocV1iOWZ9Q/exec';

document.addEventListener('DOMContentLoaded', () => {
    const addCustomerForm = document.getElementById('addCustomerForm');
    const updateScoreForm = document.getElementById('updateScoreForm');
    const notificationContainer = document.getElementById("notification-container");

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async function sendDataToGoogleSheet(data) {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('addName').value;
            const phone = document.getElementById('addPhone').value.replace(/\D/g, '');
            const score = parseInt(document.getElementById('addScore').value);
            
            const newCustomerData = {
                action: 'add',
                name: name,
                phone: phone,
                score: score
            };
            
            const result = await sendDataToGoogleSheet(newCustomerData);
            if (result.status === 'success') {
                showNotification(`成功添加顾客: ${name}`);
                addCustomerForm.reset();
            } else {
                showNotification(`添加失败：${result.message}`);
            }
        });
    }

    if (updateScoreForm) {
        updateScoreForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('updatePhone').value.replace(/\D/g, '');
            const scoreChange = parseInt(document.getElementById('updateScore').value);

            const response = await fetch(WEB_APP_URL);
            const customers = await response.json();
            const customer = customers.find(c => c.phone.replace(/\D/g, '') === phone);

            if (customer) {
                const newScore = customer.score + scoreChange;
                customer.score = newScore > 0 ? newScore : 0;

                const updateData = {
                    action: 'update',
                    phone: phone,
                    score: customer.score
                };

                const result = await sendDataToGoogleSheet(updateData);
                if (result.status === 'success') {
                    showNotification(`成功更新 ${customer.name} 的积分。新积分为: ${customer.score}`);
                } else {
                    showNotification(`更新失败：${result.message}`);
                }
            } else {
                showNotification('更新失败：未找到该电话号码的顾客。');
            }
            updateScoreForm.reset();
        });
    }
});