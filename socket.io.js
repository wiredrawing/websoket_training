let fs = require("fs");

let http = require("http");

let socketio = require("socket.io")(8080);





let server = http.createServer((req, res) => {



  res.writeHead(200, {
    "Content-Type": "text/html",
  });
  res.end("hello");
}).listen(3001);



// フロントのreactアプリが3000ポート
// websocketサーバーが3001ポートなのでオリジン違反がでるため対策
let io = socketio.listen(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.sockets.on("connection", (socket) => {

  console.log("接続してきたクライアントの 識別情報 socket.id => ",socket.id);
  // クライアント側からのメッセージ受信イベント
  socket.on("c2s_message", (data) => {
    console.log(data);
    io.sockets.emit("s2c_message", {value: "これは､サーバー側からクライアントサイドへ送信sうるデータです｡"});
  });


  socket.on("c2s_message", (data) => {
    console.log(data);
    socket.broadcast.emit("s2c_message", {value : "テストデータ"});
  });
});