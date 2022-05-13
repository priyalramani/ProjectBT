const mongoose = require('mongoose')

const connectDB = async () => {
    const conn = await mongoose.connect("mongodb+srv://sanjuahuja:cY7NtMKm8M10MbUs@cluster0.wdfsd.mongodb.net/framme", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log(`connected to mongoDB atlas ${conn.connection.host}`)
}

module.exports = connectDB;