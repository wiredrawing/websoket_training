let sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("../chat-system/chat-system/database/database.sqlite");
console.log(db);

// WebSocketのサーバの生成
let ws = require('ws')
var server = new ws.Server({port:5001});

// 接続時に呼ばれる
server.on('connection', (ws, request) => {
    console.log("ws => ", ws)
    console.log("request => ", request)
        console.log("ws.port => ", ws.port);
        console.log("ws.url => ", ws.url);
    ws.id= ws.ipAddress + ":" + ws.port + ":" + ws.unique;
    // クライアントからのデータ受信時に呼ばれる
    ws.on('message', message => {
        // クライアント側からおくられたroom_idをキャストして取得
        let room_id = message;
        console.log(room_id);
        let chatMessages = [];
        db.serialize(() => {
            let totalMessage = 0;
            db.each("select count(id) total from messages where room_id = " + room_id, function (error, row) {
                console.log("カウントを取得");
                console.log(row.total);
                totalMessage = row.total;
            });


            let pro = new Promise((resolve, reject) => {
                db.each("select * from messages where room_id = " + room_id, function (error, row) {
                    if (error != null) {
                        console.log(error);
                        return false;
                    }
                    chatMessages.push({
                        room_id: row.room_id,
                        user_name: row.user_name,
                        message: row.message,
                        id: row.id
                    });
                    //console.log(row.message, row.user_name, row.id);
                    //console.log(row);
                    //console.log(chatMessages);
                    if (chatMessages.length == totalMessage) {
                       resolve(chatMessages);
                    }
                });
            });
            pro.then((data) => {
                console.log(data);
                // クライアントにデータを返信
                server.clients.forEach(client => {
                    console.dir(client.id);
                    console.dir("client id is => ", client.id);
                    client.send(JSON.stringify(data));
                });
            });
        });
    });

    // 切断時に呼ばれる
    ws.on('close', () => {
        console.log('close');
    });
});