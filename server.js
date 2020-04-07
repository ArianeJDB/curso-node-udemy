const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const logger = require('./middlewares/logger')
const colors = require('colors')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/error')

// load env vars
dotenv.config({ path: './config/config.env' })

//connect to database
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses')

const app = express();

//Body parser
app.use(express.json())
//dev loggin middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)


app.use(errorHandler)

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running en ${process.env.NODE_ENV} mode on port ${PORT}`.rainbow.bold);
});

//Handle unhandle promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold)
    //close server and exit process
    server.close(() => process.exit(1));
})