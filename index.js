const express = require('express');
const app = express();
const userRoute = require('./routes/user.routes.js');
const adminRoute = require('./routes/admin.routes.js');
const parentRoute = require('./routes/parent.routes.js');
const logRoute = require('./routes/log.routes.js');
const chatRoute = require('./routes/chat.routes.js');
const teacherRoute = require('./routes/teacher.routes.js');
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/parent', parentRoute);
app.use('/log', logRoute);
app.use('/chat', chatRoute);
app.use('/teacher', teacherRoute);

app.listen(port, () => {
    console.info(`Server is running on port ${port}`);
});
