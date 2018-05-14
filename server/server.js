var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
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

// POST TODOS - Create
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

// GET TODOS
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, e => res.status(400).send(e));
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});

// GET /todos/123432
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = {app};