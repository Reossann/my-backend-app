const express = require('express');
const fs = require('fs/promises'); // ファイル操作のためのライブラリを読み込む

const app = express();
app.use(express.json());

const port = 3000;
const dbFilePath = './db.json'; // データベースファイルのパス

//【Read】全Todoを取得するAPI
app.get('/todos', async (req, res) => {
  try {
    const data = await fs.readFile(dbFilePath, 'utf-8');
    const todos = JSON.parse(data);
    res.json(todos);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

//【Create】新しいTodoを作成するAPI
app.post('/todos', async (req, res) => {
  try {
    const newTodo = req.body; // リクエストのbodyから新しいTodoの内容を取得

    // 新しいTodoにIDを付与する
    newTodo.id = Date.now();

    const data = await fs.readFile(dbFilePath, 'utf-8');
    const todos = JSON.parse(data);

    todos.push(newTodo); // 配列に新しいTodoを追加

    await fs.writeFile(dbFilePath, JSON.stringify(todos, null, 2)); // ファイルに書き込む

    res.status(201).json(newTodo); // 作成成功のステータスと、作成したTodoを返す
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

// サーバーを起動
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました。`);
});