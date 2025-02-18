const express = require('express');
const userRoute = require('./routes/userRouter');
const blogRoute = require('./routes/blogRouter');
const { extractValidJWTToken } = require('./middlewares/auth')
const { connectionToMongodb } = require('./db/connect')
const { errorHandler } = require('./middlewares/errors')

connectionToMongodb()

const app = express();
app.use(express.json());

app.use(extractValidJWTToken);

app.use('/users', userRoute);
app.use('/p', blogRoute);
const PORT = process.env.PORT || 3000;

app.use(errorHandler)

// set up the server to listen for request on the specified port
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

// define an endpoint
app.get("/status", (request, response) => {
    const status = {
        "Status": "Running"
    }

    response.send(status)
});