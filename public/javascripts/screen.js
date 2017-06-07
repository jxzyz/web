 $(function () {

    // 字符串
    console.log(location.search);
    var n = location.search.slice(1).split('=')[1];

    var content = $('#content');
    //建立websocket连接
    socket = io.connect('http://localhost:3001');

    //收到server的连接确认
    socket.on('open',function(){

        //监听system事件，判断welcome或者disconnect，打印系统消息信息
        socket.on('system',function(res){
            console.log(res);
            content.html('当前n：' + res.screenNum + '；type为' + res.type + ', 信息为: ' + res.text);
        });

        socket.send(n);
    });

});