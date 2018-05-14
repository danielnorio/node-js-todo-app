var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

// Custom middleware to catch body-parser errors
// to control error response.
app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    console.log("Erro de sintaxe JSON.", error);
    res.status(error.statusCode).send(error.toString());
  } else {
    next();
  }
});

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((docs) => {
    res.send(docs);
  }, (e) => {
    res.status(400).send(e);
    console.log('Error returning todos.', e);
  })
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});
