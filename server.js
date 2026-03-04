const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

const readMoodsFromFile = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE);
      return data.length > 0 ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('读取数据库文件时出错:', error);
  }
  return [];
};

const writeMoodsToFile = (moods) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(moods, null, 2));
  } catch (error) {
    console.error('写入数据库文件时出错:', error);
  }
};

app.post('/api/moods', (req, res) => {
  const moods = readMoodsFromFile();
  const newMood = req.body;
  
  // --- 核心改动：为新记录添加一个唯一的ID ---
  newMood.id = Date.now(); // 使用当前时间戳作为唯一ID

  moods.push(newMood);
  writeMoodsToFile(moods);
  
  console.log('成功将新记录写入数据库:', newMood);
  res.status(201).json({ message: '心情记录成功！' });
});

app.get('/api/moods', (req, res) => {
  const moods = readMoodsFromFile();
  moods.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(moods);
});

// --- 全新的功能：创建 DELETE 接口 ---
app.delete('/api/moods/:id', (req, res) => {
  // 1. 从 URL 中获取要删除的记录的 ID
  const idToDelete = Number(req.params.id);

  // 2. 读取所有记录
  let moods = readMoodsFromFile();

  // 3. 过滤掉要删除的记录，生成一个新数组
  const newMoods = moods.filter(mood => mood.id !== idToDelete);

  // 4. 检查是否有记录被真正删除了
  if (moods.length === newMoods.length) {
    // 如果数组长度没变，说明没找到对应的ID
    return res.status(404).json({ message: '未找到要删除的记录' });
  }

  // 5. 将新数组写回文件
  writeMoodsToFile(newMoods);

  console.log(`成功删除记录, ID: ${idToDelete}`);
  // 6. 返回成功响应
  res.status(200).json({ message: '记录已成功删除' });
});


app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 上运行`);
  console.log(`数据将持久化存储在 ${DB_FILE} 文件中。`);
});