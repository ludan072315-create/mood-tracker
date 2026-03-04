const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // 引入 Node.js 内置的路径模块

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

// --- 这是核心改动 ---
// 告诉 Express，我们所有的静态文件（HTML, CSS, JS）都放在根目录下
app.use(express.static(__dirname));

// ... (readMoodsFromFile 和 writeMoodsToFile 函数保持不变)
const readMoodsFromFile = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE);
      return data.length > 0 ? JSON.parse(data) : [];
    }
  } catch (error) { console.error('读取数据库文件时出错:', error); }
  return [];
};
const writeMoodsToFile = (moods) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(moods, null, 2));
  } catch (error) { console.error('写入数据库文件时出错:', error); }
};

// --- API 接口部分保持不变 ---
app.post('/api/moods', (req, res) => {
  const moods = readMoodsFromFile();
  const newMood = req.body;
  newMood.id = Date.now();
  moods.push(newMood);
  writeMoodsToFile(moods);
  res.status(201).json({ message: '心情记录成功！' });
});

app.get('/api/moods', (req, res) => {
  const moods = readMoodsFromFile();
  moods.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(moods);
});

app.delete('/api/moods/:id', (req, res) => {
  const idToDelete = Number(req.params.id);
  let moods = readMoodsFromFile();
  const newMoods = moods.filter(mood => mood.id !== idToDelete);
  if (moods.length === newMoods.length) {
    return res.status(404).json({ message: '未找到要删除的记录' });
  }
  writeMoodsToFile(newMoods);
  res.status(200).json({ message: '记录已成功删除' });
});

// --- 启动服务器部分保持不变 ---
app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 上运行`);
});