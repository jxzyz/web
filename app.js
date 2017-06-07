//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 所有屏幕信息
var screenArr = {};

//设置日志级别
io.set('log level', 1);

io.on('connection', function (socket) {

    // 对message事件的监听
    socket.on('message', function(key) {

        screenArr[key] = {
            type: 'pic',
            text: '123',
            screenNum: key
        };

        screenArr[key]['send'] = function () {
            var key = this.screenNum;
            screenArr[key]['text'] = '222';
            socket.emit('system', screenArr[key]);
        };

        socket.emit('system', screenArr[key]);

        //监听出退事件
        socket.on('disconnect', function () {
          console.log('Disconnect');
        });

    });

    // 客户 socket
    socket.emit('open');//通知客户端已连接

});

//express基本配置
app.configure(function(){
  app.set('views', __dirname + '/views');;
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));
});

// 路由
app.get('/', function(req, res){
  res.sendfile('views/screen.html');
});

app.get('/manage', function(req, res){
  res.sendfile('views/manage.html');
});

// 控制器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/manage/change', function(req, res) {

    var body = req.body;
    var n = body.n;
    console.log('点击' + n);
    console.log(screenArr);

    screenArr[n].send();

    res.send({
        err: 0,
        msg: 'ok'
    });
});

server.listen(3001, function(){
  console.log("Express server listening on port 3001" );
});