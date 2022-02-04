const express = require('express');
const app = express();
const PORT = 4000;

const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '100mb'}));
app.use('/static', express.static('public'));

// middlewares
const { authorization } = require('./middlewares/middlewares');

// routes
const users = require('./routes/user/user.route');
const validate = require('./routes/validate/validate.route');
const post = require('./routes/post/post.route');
const comment = require('./routes/comment/comment.route');

app.use('/users', users);
app.use('/validate', authorization, validate);
app.use('/posts', authorization, post);
app.use('/comments', authorization, comment);

mongoose.connect('mongodb://localhost/socialApp', { useNewUrlParser: true, useUnifiedTopology: true });
const connect = mongoose.connection;
connect.on('error', function(){
  console.log('Mongodb connect to fail !');
});
connect.on('open', function(){
  console.log('Mongodb connected...');
});

app.listen(PORT, () => {
  console.log('Server is running on ' + PORT);
})