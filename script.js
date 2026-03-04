document.addEventListener('DOMContentLoaded', () => {
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
            
            // --- 核心改动：创建删除按钮 ---
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.style.marginLeft = '10px'; // 给按钮一点左边距
            deleteButton.dataset.id = mood.id; // 将记录的唯一ID存到按钮上

            listItem.textContent = `日期: ${mood.date} | 分数: ${mood.score} | 日记: ${mood.diary || '无'}`;
            listItem.appendChild(deleteButton); // 把删除按钮加到列表项里
            
            moodList.appendChild(listItem);
        });
    };

    const fetchAndRender = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/moods');
            const moods = await response.json();
            
            const labels = moods.map(mood => mood.date);
            const data = moods.map(mood => mood.score);

            if (moodChart) {
                moodChart.data.labels = labels;
                moodChart.data.datasets[0].data = data;
                moodChart.update();
            } else {
                moodChart = new Chart(chartCanvas, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '心情分数',
                            data: data,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            tension: 0.1
                        }]
                    }
                });
            }
            
            displayMoodsAsList(moods);

        } catch (error) {
            console.error('获取或渲染数据时出错:', error);
        }
    };

    // --- 新增功能：处理删除按钮的点击事件 ---
    moodList.addEventListener('click', async (event) => {
        // 检查被点击的是否是删除按钮
        if (event.target.tagName === 'BUTTON' && event.target.textContent === '删除') {
            const moodId = event.target.dataset.id;
            if (confirm('你确定要删除这条记录吗？')) {
                try {
                    const response = await fetch(`http://localhost:3000/api/moods/${moodId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('记录已删除！');
                        fetchAndRender(); // 删除成功后，刷新整个界面
                    } else {
                        alert('删除失败。');
                    }
                } catch (error) {
                    alert('无法连接到服务器。');
                }
            }
        }
    });

    moodForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const date = moodDateInput.value;
        const score = document.getElementById('mood-score').value;
        const diary = document.getElementById('mood-diary').value;

        try {
            const response = await fetch('http://localhost:3000/api/moods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, score, diary }),
            });

            if (response.ok) {
                moodForm.reset();
                moodDateInput.valueAsDate = new Date();
                fetchAndRender();
            } else {
                alert('保存失败。');
            }
        } catch (error) {
            alert('无法连接到服务器。');
        }
    });

    fetchAndRender();
});