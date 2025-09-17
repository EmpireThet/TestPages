document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('url-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrcodeDiv = document.getElementById('qrcode');
    const qrInfo = document.getElementById('qr-info');
    const qrUrl = document.getElementById('qr-url');
    const downloadBtn = document.getElementById('download-btn');
    const historySection = document.querySelector('.history-section');
    const historyList = document.getElementById('history-list');
    
    let currentQRCode = null;
    let history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    
    // Показать историю, если она есть
    if (history.length > 0) {
        renderHistory();
        historySection.classList.remove('hidden');
    }
    
    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);
    
    // Генерация QR-кода при нажатии Enter
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });
    
    function generateQRCode() {
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Пожалуйста, введите URL');
            return;
        }
        
        // Добавляем https:// если отсутствует протокол
        let formattedUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            formattedUrl = 'https://' + url;
        }
        
        // Очищаем предыдущий QR-код
        if (currentQRCode) {
            currentQRCode.clear();
            qrcodeDiv.innerHTML = '';
        }
        
        // Создаем новый QR-код
        currentQRCode = new QRCode(qrcodeDiv, {
            text: formattedUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Показываем информацию о QR-коде
        qrUrl.textContent = formattedUrl;
        qrInfo.classList.remove('hidden');
        
        // Добавляем в историю
        addToHistory(formattedUrl);
    }
    
    function addToHistory(url) {
        // Проверяем, есть ли уже такой URL в истории
        const existingIndex = history.findIndex(item => item.url === url);
        
        if (existingIndex !== -1) {
            // Удаляем существующий элемент, чтобы добавить его в начало
            history.splice(existingIndex, 1);
        }
        
        // Добавляем новый элемент в начало истории
        history.unshift({
            url: url,
            timestamp: new Date().toISOString()
        });
        
        // Ограничиваем историю 10 элементами
        if (history.length > 10) {
            history.pop();
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('qrHistory', JSON.stringify(history));
        
        // Обновляем отображение истории
        renderHistory();
        historySection.classList.remove('hidden');
    }
    
    function renderHistory() {
        historyList.innerHTML = '';
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const urlSpan = document.createElement('span');
            urlSpan.textContent = item.url;
            
            const timeSpan = document.createElement('span');
            timeSpan.textContent = new Date(item.timestamp).toLocaleString();
            timeSpan.style.color = '#7f8c8d';
            timeSpan.style.fontSize = '0.9em';
            
            historyItem.appendChild(urlSpan);
            historyItem.appendChild(timeSpan);
            
            // При клике на элемент истории заполняем поле ввода
            historyItem.addEventListener('click', () => {
                urlInput.value = item.url;
                generateQRCode();
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    function downloadQRCode() {
        if (!currentQRCode) return;
        
        const canvas = qrcodeDiv.querySelector('canvas');
        if (!canvas) return;
        
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const url = qrUrl.textContent;
        const domain = new URL(url).hostname;
        
        link.download = `qrcode-${domain}.png`;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Автофокус на поле ввода при загрузке страницы
    urlInput.focus();
});