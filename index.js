const express = require('express');
const fs = require('fs/promises');
const cors = require('cors');

const app = express();
const corsOptions = {
  origin: 'https://my-frontend-app-armz.onrender.com' // あなたのフロントエンドのURLを許可する
};
app.use(cors(corsOptions));
app.use(express.json());

const port = 3000;
const dbFilePath = './db.json';

//【Read】全Todoを取得するAPI (前回と同じ)
app.get('/todos', async (req, res) => {
  try {
    const data = await fs.readFile(dbFilePath, 'utf-8');
    const todos = JSON.parse(data);
    res.json(todos);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

//【Create】新しいTodoを作成するAPI (前回と同じ)
app.post('/todos', async (req, res) => {
  try {
    const newTodo = req.body;
    newTodo.id = Date.now();
    const data = await fs.readFile(dbFilePath, 'utf-8');
    const todos = JSON.parse(data);
    todos.push(newTodo);
    await fs.writeFile(dbFilePath, JSON.stringify(todos, null, 2));
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

// ⭐ここから追加⭐
//【Update】特定のTodoを更新するAPI
app.put('/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id); // URLから更新対象のIDを取得
    const updatedContent = req.body; // 更新内容を取得

    const data = await fs.readFile(dbFilePath, 'utf-8');
    let todos = JSON.parse(data);

    const todoIndex = todos.findIndex(todo => todo.id === id); // IDが一致するTodoの配列内での位置を探す

    if (todoIndex === -1) {
      // もしTodoが見つからなければ404エラーを返す
      return res.status(404).send('Todoが見つかりません');
    }

    // 見つかったTodoを更新する
    todos[todoIndex] = { ...todos[todoIndex], ...updatedContent };

    await fs.writeFile(dbFilePath, JSON.stringify(todos, null, 2));

    res.json(todos[todoIndex]); // 更新後のTodoを返す
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

//【Delete】特定のTodoを削除するAPI
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id); // URLから削除対象のIDを取得

    const data = await fs.readFile(dbFilePath, 'utf-8');
    let todos = JSON.parse(data);

    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== id); // IDが一致しないものだけを残す

    if (todos.length === initialLength) {
        // 配列の長さが変わらない＝削除対象がなかった
        return res.status(404).send('Todoが見つかりません');
    }

    await fs.writeFile(dbFilePath, JSON.stringify(todos, null, 2));

    res.status(204).send(); // 成功したが、返すコンテンツはないというステータス
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});
// ⭐ここまで追加⭐

// サーバーを起動
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました。`);
});