 //1. module
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');
var app = express();


// 2. constructor
var counter = 0;
function Product(name, image, price, count) {
                this.index = counter++;
                this.name = name;
                this.image = image;
                this.price = price;
                this.count = count;
}

// 3. variable : call constructor and put Product object inside products array
var products = [
                new Product('JavaScript', 'chrome.png', 28000, 30),
                new Product('jQuery', 'chrome.png', 28000, 30),
                new Product('Node.js', 'chrome.png', 32000, 30),
                new Product('Socket.io', 'chrome.png', 17000, 30),
                new Product('Connect', 'chrome.png', 18000, 30),
                new Product('Express', 'chrome.png', 31000, 30),
                new Product('EJS', 'chrome.png', 12000, 30)
];



// 4. web server & listen to the port
var server = http.createServer(app);
server.listen(52273, function () {
    console.log('Server Running at http://127.0.0.1:52273');
});
// 5. server set up
app.use(express.static(__dirname + '/public'));




// 6. Router
app.get('/', function (request, response) {
    // 6.1 read HTMLPage.html with utf8
    var htmlPage = fs.readFileSync('HTMLPage.html', 'utf8');
    // 6.2 render(on, with) viewpage with this data
    var dataToBrowser = ejs.render(htmlPage, {  products: products});
    response.send(dataToBrowser);
});



// 7. Socket.io
var io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {


    /** 1 function: onReturn, 3 evnets: cart, buy, return
     * product constructor, product array, cart array
     * */



    // 7.1 onReturn
    function onReturn(index) {
        //7.1.1 increase products
        products[index].count++;
        //7.1.3 delete cart
        delete cart[index];
        //7.1.2 get rid of timer
        clearTimeout(cart[index].timerID);

        //7.1.4 count socket event
        io.sockets.emit('count', {  index: index,
                                    count: products[index].count });
    };





    // 7.2 cart event
    var cart = {};
    socket.on('cart', function (index) {

        // 7.2.1 decrease products
        products[index].count--;
        //7.2.2 put product in cart
        cart[index] = {};
        cart[index].index = index;
        //7.2.3 start timer
        cart[index].timerID = setTimeout(function () {
            onReturn(index);
        }, 1000 * 60 * 10);

        // 7.4 count socket event
        io.sockets.emit('count', {  index: index,
                                    count: products[index].count
                                  });
    });




    // 7.3 buy event
    socket.on('buy', function (index) {
        // 7.3.1 get rid of timer
        clearTimeout(cart[index].timerID);
        // 7.3.2 delete cart
        delete cart[index];

        // 7.3.3 count event .emit
        io.sockets.emit('count', {  index: index,
                                    count: products[index].count
                                 });
    });



    // 7.4 return event
    socket.on('return', function (index) {
        onReturn(index);
    });
});