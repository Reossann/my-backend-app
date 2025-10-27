// 1. Expressライブラリを読み込む
const express = require('express');

// 2. Expressを使ってWebサーバーの本体（app）を作る
const app = express();

// 3. サーバーを起動するポート番号を指定する
const port = 3000;

// 4. ルーティングの設定：ルートURL ("/") にアクセスが来たときの処理
app.get('/', (req, res) => {
  // res.send() で、ブラウザに表示する内容を送信する
  res.send('Hello, World!');
});

// 5. 指定したポート番号でサーバーを起動し、リクエストを待ち受ける
app.listen(port, () => {
  // サーバーが起動したら、このメッセージをコンソールに表示する
  console.log(`サーバーがポート ${port} で起動しました。 http://localhost:${port}`);
});