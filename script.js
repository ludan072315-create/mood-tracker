document.addEventListener('DOMContentLoaded', () => {
    // ... (顶部的变量定义保持不变)
    const moodForm = document.getElementById('mood-form');
    const chartCanvas = document.getElementById('mood-chart');
    const moodDateInput = document.getElementById('mood-date');
    const moodList = document.getElementById('mood-list');
    let moodChart;

    moodDateInput.valueAsDate = new Date();

    const displayMoodsAsList = (moods) => {
        moodList.innerHTML = '';
        moods.forEach(mood => {
            const listItem = document.createElement('li');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.style.marginLeft = '10px';
            deleteButton.dataset.id = mood.id;
            listItem.textContent = `日期: ${mood.date} | 分数: ${mood.score} | 日记: ${mood.diary || '无'}`;
            listItem.appendChild(deleteButton);
            moodList.appendChild(listItem);
        });
    };

    const fetchAndRender = async () => {
        try {
            // --- 改动在这里：使用相对路径 ---
            const response = await fetch('/api/moods');
            const moods = await response.json();
            
            // ... (渲染图表和列表的逻辑保持不变)
            const labels = moods.map(mood => mood.date);
            const data = moods.map(mood => mood.score);
            if (moodChart) {
                moodChart.data.labels = labels;
                moodChart.data.datasets[0].data = data;
                moodChart.update();
            } else {
                moodChart = new Chart(chartCanvas, {
                    type: 'line',
                    data: { labels, datasets: [{ label: '心情分数', data, borderColor: 'rgba(75, 192, 192, 1)', tension: 0.1 }] }
                });
            }
            displayMoodsAsList(moods);
        } catch (error) { console.error('获取或渲染数据时出错:', error); }
    };

    moodList.addEventListener('click', async (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.textContent === '删除') {
            const moodId = event.target.dataset.id;
            if (confirm('你确定要删除这条记录吗？')) {
                try {
                    // --- 改动在这里：使用相对路径 ---
                    const response = await fetch(`/api/moods/${moodId}`, { method: 'DELETE' });
                    if (response.ok) { fetchAndRender(); } else { alert('删除失败。'); }
                } catch (error) { alert('无法连接到服务器。'); }
            }
        }
    });

    moodForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const date = moodDateInput.value;
        const score = document.getElementById('mood-score').value;
        const diary = document.getElementById('mood-diary').value;
        try {
            // --- 改动在这里：使用相对路径 ---
            const response = await fetch('/api/moods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, score, diary }),
            });
            if (response.ok) {
                moodForm.reset();
                moodDateInput.valueAsDate = new Date();
                fetchAndRender();
            } else { alert('保存失败。'); }
        } catch (error) { alert('无法连接到服务器。'); }
    });

    fetchAndRender();
});