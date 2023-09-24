let express = require("express");
let bodyParser = require("body-parser");
let mongodb = require("mongodb");
let app = express();
app.use(bodyParser.json());

let distDir = __dirname + "/dist/";
app.use(express.static(distDir));

let db;
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/").then(client => {
    db = client.db();
    console.log("База данных подключена");

    let server = app.listen(process.env.PORT || 8080, function () {
        let port = server.address().port;
        console.log("Приложение запущено на порту", port);
    });
});

// Маршруты API
function handleError(res, reason, message, code) {
    console.log("Ошибка: " + reason);
    res.status(code || 500).json({"error": message});
}

/* "/api/contacts"
* GET: найти все контакты
* POST: создание нового контакта
*/
app.get("/api/contacts", function(req, res) {
    const collection = db.collection('contacts');
    collection.find({}).toArray(function(err, contacts) {
        if (err) {
            handleError(res, "Can't find all contacts in DB", err.message, 500);
            return;
        }
        res.json(contacts);
    });
});
app.post("/api/contacts", function(req, res) {
    const collection = db.collection('contacts');
    const newContact = req.body;
    collection.insertOne(newContact, function(err, result) {
        if (err) {
            handleError(res, "Can't add new contact", err.message, 500);
            return;
        }
        res.json(result.ops[0]);
    });
});
/* "/api/contacts/:id"
* GET: найти контакт по id
* PUT: обновить контакт по id
* DELETE: удалить контакт по id
*/
app.get("/api/contacts/:id", function(req, res) {
    const collection = db.collection('contacts');
    collection.findOne({_id: new mongodb.ObjectId(req.params.id)}, function(err, contact) {
        res.json(contact);
    });
});

app.put("/api/contacts/:id", function(req, res) {
    const collection = db.collection('contacts');
    collection.updateOne({_id: new mongodb.ObjectId(req.params.id)}, {$set: req.body}, function(result) {
        res.json({message: 'success'});
    });
});

app.delete("/api/contacts/:id", function(req, res) {
    const collection = db.collection('contacts');
    collection.deleteOne({_id: new mongodb.ObjectId(req.params.id)}, function(result) {
        res.json({message: 'success'});
    });
});
