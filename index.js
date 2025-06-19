require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
    title: String,
    priority: String
});
const Task = mongoose.model('Task', taskSchema);

// Routes
app.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.render('index', { 
            tasks, 
            message: req.query.message,
            alertClass: req.query.alertClass || ''
        });
    } catch (err) {
        console.error(err);
        res.redirect('/?message=error&alertClass=error');
    }
});

app.post('/tasks', async (req, res) => {
    const { title, priority } = req.body;
    
    if (!title.trim()) {
        return res.redirect('/?message=Please enter a task!&alertClass=error');
    }

    try {
        const newTask = new Task({ title, priority });
        await newTask.save();
        res.redirect('/?message=Task added successfully!&alertClass=success');
    } catch (err) {
        console.error(err);
        res.redirect('/?message=Error adding task&alertClass=error');
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { title, priority } = req.body;
    
    if (!title.trim()) {
        return res.redirect('/?message=Please enter a task!&alertClass=error');
    }

    try {
        await Task.findByIdAndUpdate(req.params.id, { title, priority });
        res.redirect('/?message=Task updated successfully!&alertClass=success');
    } catch (err) {
        console.error(err);
        res.redirect('/?message=Error updating task&alertClass=error');
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/?message=Task deleted successfully!&alertClass=success');
    } catch (err) {
        console.error(err);
        res.redirect('/?message=Error deleting task&alertClass=error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));