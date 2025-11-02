const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // fsの代わりにpgのPoolを読み込む

const app = express();
const port = 3000;

// --- CORS設定 (変更なし) ---
const corsOptions = {
  origin: 'https://my-frontend-app-armz.onrender.com'
};
app.use(cors(corsOptions));
app.use(express.json());

// --- データベース接続設定 ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Renderの金庫(環境変数)から接続URLを取得
  ssl: {
    rejectUnauthorized: false // Render上のDBに接続するために必要なおまじない
  }
});

// --- データベースのテーブルを作成する関数 ---
// サーバー起動時に一度だけ実行され、もしtodosテーブルがなければ作成する
const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('テーブルの準備ができました');
  } catch (err) {
    console.error('テーブル作成に失敗しました', err);
  }
};

// --- APIルートの書き換え ---

//【Read】全Todoを取得するAPI
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

//【Create】新しいTodoを作成するAPI
app.post('/todos', async (req, res) => {
  try {
    const { title } = req.body; // フロントから送られてくるのはtitleだけ
    const queryText = 'INSERT INTO todos (title) VALUES ($1) RETURNING *';
    const result = await pool.query(queryText, [title]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

//【Update】特定のTodoを更新するAPI
app.put('/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title } = req.body; // 更新する内容
    
    const queryText = 'UPDATE todos SET title = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(queryText, [title, id]);

    if (result.rows.length === 0) {
      return res.status(404).send('Todoが見つかりません');
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

//【Delete】特定のTodoを削除するAPI
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const queryText = 'DELETE FROM todos WHERE id = $1 RETURNING *';
    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send('Todoが見つかりません');
    }
    res.status(204).send(); // 削除成功
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

// --- サーバー起動 ---
// サーバーを起動する前に、まずテーブルの準備をする
createTable().then(() => {
  app.listen(port, () => {
    console.log(`サーバーがポート ${port} で起動しました。`);
  });
});