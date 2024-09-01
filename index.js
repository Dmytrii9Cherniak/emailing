const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

require('dotenv').config();

const path = require('path');

const app = express();
const port = process.env.PORT_BACKEND;
const host = process.env.HOST || 'localhost';

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const transport = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
};

const transporter = nodemailer.createTransport(transport);
transporter.verify((error, success) => {
    if (error) {
        console.error(error);
    } else {
        console.log('Server is ready to take messages');
    }
});

const router = express.Router();

router.post('/send', (req, res, next) => {
    try {
        const name = req.body.name;
        const phone = req.body.number;
        const email = req.body.email;
        const message = req.body.message;
        const language = req.body.language

        const order = {
            from: transport.auth.user,
            to: 'messagestest291@gmail.com',
            subject: 'Нова заявка',
            html: `<h2> 
                        <b> Доброго дня, до вас нова заявка: </b> 
                    </h2> 
                        <p> Name: ${name} </p>
                        <p> Phone: ${phone} </p>
                        <p> Email: ${email} </p>
                        <p> Message: ${!message.length ? 'Користувач не написав повідомлення' : message} </p>
                    <br>
                    <br>
                    <img src="cid:logo" alt="logo" />`,
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, 'src', 'media', 'logo.png'),
                    cid: 'logo'
                }
            ]
    };
        transporter.sendMail(order, (err, data) => {
            if (err) {
                console.error(err);
                res.json({
                    status: 'fail'
                });
            } else {
                res.json({
                    status: 'success'
                });
            }
        });

        const mail = {
            from: transport.auth.user,
            to: email,
            subject: `${name}, ${language === 'ukr' ? 'Дякуємо за заявку' : 'Thank you for application'}`,
            html: `<h2>   
                        <b> ${language === 'ukr' ? `Доброго дня, ${name}` : `Good evening, ${name}` } </b>
                    </h2> 
                        <p> 
                            ${language === 'ukr'
                                ? 'Дякуємо вам за те, що приділили увагу нашій компанії і за відправлену вами заявку. ' +
                                  'Найближчим часом наші фахівці зв`яжуться з вами і нададуть усі відповіді на ваші питання'
                                : 'Thank you for paying attention to our company and for your application.' + 
                                  'In the near future, our specialists will contact you and provide all the answers to your questions'}
                         </p>
                    <br>
                    <br>
                    <p> ${language === 'ukr' 
                                ? 'З найкращими побажаннями, відділ продажу Palletenwerk'
                                : 'Best regards, Sales department Palletenwerk'} 
                    <br>
                    <br>
                    <img src="cid:logo" alt="logo" />`,
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, 'src', 'media', 'logo.png'),
                    cid: 'logo'
                }
            ]
        };

        transporter.sendMail(mail, (err, data) => {
            if (err) {
                console.error(err);
                res.json({
                    status: 'fail'
                });
            } else {
                res.json({
                    status: 'success'
                });
            }
        });

        res.status(200).send({
            message: `${language === 'ukr' 
                ? 'Ваша заявка успішно відправлена на вказані ваші дані. Очікуйте на нашу відповідь'
                : 'Your application has been successfully sent to your specified data. Wait for our reply'}`
        })
    } catch (error) {
        res.status(400).send(error.message);
        console.error(error);
    }
});

const http = require("http");
let server = http.createServer(app)

// const https = require('node:https');
// let server = https.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/', router);
server.listen(port, host, () => {
    console.log(`Server is up!`)
});