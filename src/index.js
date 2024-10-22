import express from 'express';
import dotenv from 'dotenv';
import app from './app.js'

dotenv.config({
    path: "./env"
})


import connectDB from './database/connection.js'

connectDB()
    .then(() => {
        app.get('/', (req, res) => {
            res.send(`<center><h1>Server is live!!🟢</h1></center>`)
        })

        app.listen(process.env.POST || 8000, () => {
            console.log(`Sever is Live on ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("MONGO DB Connection Failed!", err);
    })



