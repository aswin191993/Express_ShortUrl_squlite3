var http = require('http'),
    express = require('express'),
    app = express(),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('cozy');
var make_url;
/* We add configure directive to tell express to use Jade to
   render templates */
app.configure(function() {
    app.set('views', __dirname + '/public');
    app.engine('.html', require('jade').__express);

    // Allows express to get data from POST requests
    app.use(express.bodyParser());
});

// Database initialization
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'", function(err, row) {
    if(err !== null) {
        console.log(err);
    }
    else if(row == null) {
        db.run('CREATE TABLE "bookmarks" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "title" VARCHAR(255), url VARCHAR(255))', function(err) {
            if(err !== null) {
                console.log(err);
            }
            else {
                console.log("SQL Table 'bookmarks' initialized.");
            }
        });
    }
    else {
        console.log("SQL Table 'bookmarks' already initialized.");
    }
});

// We render the templates with the data
app.get('/', function(req, res) {

    db.all('SELECT * FROM bookmarks ORDER BY title', function(err, row) {
        if(err !== null) {
            res.send(500, "An error has occurred -- " + err);
        }
        else {
            res.render('index.jade', {bookmarks: row}, function(err, html) {
                res.send(200, html);
            });
        }
    });
});

// We define a new route that will handle bookmark creation
app.post('/add', function(req, res) {
    url = req.body.url;
    make_url = function(n, a) {
  	var index = (Math.random() * (a.length - 1)).toFixed(0);
 	return n > 0 ? a[index] + make_url(n - 1, a) : '';
    };
    var title= String(make_url(4,"asdfghjkl123456qwertyuiop7890zxcvbnm"));
    sqlRequest = "INSERT INTO 'bookmarks' (title, url) VALUES('" + title + "', '" + url + "')"
    db.run(sqlRequest, function(err) {
        if(err !== null) {
            res.send(500, "An error has occurred -- " + err);
        }
        else {
            res.redirect('back');
        }
    });
});

app.get('/:format', function (req, res) {
   var format = req.params.format;
	db.each("SELECT title,url FROM bookmarks", function(err, row) {
	if(String(row.title) == String(format)){	
		var orgi='https://'+String(row.url);
       		console.log(orgi);
		res.redirect(orgi);
		res.end()
	}
  	});
});
/* This will allow Cozy to run your app smoothly but
 it won't break other execution environment */
var port = process.env.PORT || 9250;
var host = process.env.HOST || "127.0.0.1";

// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
    console.log("Server listening to %s:%d within %s environment",
                host, port, app.get('env'));
});
