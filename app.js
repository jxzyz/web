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
var formidable=require('formidable');
var fs = require('fs');
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

app.post('/upload', function(req, res) {

    console.log("???");
    var chacheFolder = './public/image/';
    var userDirPath = chacheFolder + '1';
    if(!fs.existsSync(userDirPath)){
        fs.mkdirSync(userDirPath);
    }//建立一个关于用户1的文件夹
    var form = new formidable.IncomingForm();//创建上传表单
    form.encoding = 'utf-8';
    form.uploadDir = userDirPath;
    form.keepExtensions = true;
    form.maxFieldsSize = 2*1024*1024;
    form.type = true;
    var displayUrl;
    form.parse(req,function(err,fields,files){
        if(err){
            res.send(err);
            return;
        }
        var extName = '';
        switch(files.upload.type){
            case 'image/pjpeg':
                extName='jpg';
                break;
            case 'image/jpeg':
                extName='jpg';
                break;
            case 'image/png':
                extName='png';
                break;
            case 'image/x-png':
                extName='png';
                break;
        }
        if(extName.length===0){
            res.send({
                code:202,
                msg:'只支持png和jpg'
            });
        }else{
            var avatarName = '/'+Date.now()+'.'+extName;
            var newPath = form.uploadDir+avatarName;
            displayUrl = UPLOAD_FOLDER + '1' + avatarName;
            fs.renameSync(files.upload.path,newPath);//重命名
            res.send({
                code:200,
                msg:displayUrl
            });
        }
    });
});

server.listen(3001, function(){
  console.log("Express server listening on port 3001" );
});