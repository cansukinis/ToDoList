const express = require('express');
const cors = require('cors');
const mongoose =require('mongoose');
const Todo = require('./models/Todo');
const Counter = require('./models/Counter');

const app= express();
const PORT = 3000;

app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://127.0.0.1:27017/Todos').then(()=> {
    console.log("Db bağlantısı başarılı");
}).catch(err =>{
    console.log("Db bağlantısı başarısız", err);
});

//let todos= [];
//let nextId= 1;


app.post('/todos', async (req, res)=> {
    try{
    const { title } = req.body;
    if(!title) return res.status(400).json({message:"Görev gerekli"})

    const counter = await Counter.findOneAndUpdate(
        {name: 'todo_id'},
        {$inc: { seq: 1} },
        { new: true, upsert: true }
    );

    const newToDo = new Todo({
        id: counter.seq,
        title,
        completed: false
    });

    const saved = await newToDo.save();

    res.status(201).json(saved);
    } catch(err){
        console.error('POST /todos hatası: ', err);
        res.status(500).json({message: 'Ekleme Başarısız'});
    }
});


app.get('/todos', async (req, res)=> {
    try{
        const todos = await Todo.find().sort({id: 1});
        res.json(todos);
    } catch (err){
        res.status(500).json({message:'Veriler alınamadı'})
    }
});


app.get('/todos/:id', async (req, res)=> {
    try{
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({error: 'Görev bulunamadı'});
    res.json(todo);
    } catch(err){
        console.error('GET /todos/:id hatası: ', err);
        res.status(500).json({message: 'hata oluştu'});
    }
});


app.put('/todos/:id', async (req, res)=> {
    try{
        const { title, completed } = req.body;
        const updated = await Todo.findByIdAndUpdate(
            req.params.id,
            { title, completed },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({message: 'Görev bulunamadı'});
        res.json(updated);
    } catch (err){
        console.error('PUT hatası: ', err);
        res.status(500).json({message: 'güncelleme başarısız'});
    }
});


app.delete('/todos/:id', async (req, res)=> {
    try {
        const rawId = req.params.id;

        if (!/^\d+$/.test(rawId)) {
         return res.status(400).json({ message: 'Geçersiz ID: Sayı bekleniyor' });
        }

        const id = parseInt(rawId, 10);

        const deleted = await Todo.findOneAndDelete({id});

        if(!deleted) return res.status(404).json({message: 'görev bulunamadı'});
        res.status(204).send();
        console.log('silinecek id: ', req.params.id)
    } catch (err) {
        console.error('DELETE hatası: ', err);
        res.status(500).json({message: 'silme başarısız'});
    }
});


app.listen(PORT, ()=> {
    console.log(`ToDo API ${PORT} portunda çalışıyor.`);
});