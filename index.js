require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Task Schema
const taskSchema = new mongoose.Schema({
    title: String,
    priority: String
});
const Task = mongoose.model('Task', taskSchema);

// Routes
app.get('/', async (req, res) => {
    const tasks = await Task.find();
    res.render('index', { tasks, message: req.query.message });
});

app.post('/add', async (req, res) => {
    const { title, priority } = req.body;
    if (!title.trim()) {
        return res.redirect('/?message=empty');
    }
    const newTask = new Task({ title, priority });
    await newTask.save();
    res.redirect('/?message=added');
});

app.post('/edit/:id', async (req, res) => {
    const { title, priority } = req.body;
    await Task.findByIdAndUpdate(req.params.id, { title, priority });
    res.redirect('/?message=updated');
});

app.post('/delete/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/?message=deleted');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
