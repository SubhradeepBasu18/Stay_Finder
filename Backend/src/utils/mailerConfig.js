import nodemailer from "nodemailer"
import {configDotenv} from "dotenv";
configDotenv({quiet: true})


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_MAILTRAP_HOST,
    port: process.env.SMTP_MAILTRAP_PORT,
    secure: false,
    service: "gmail",
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS
    }
})

const sendMail = async(to, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"StayFinder" <subhradeepbasu1809@gmail.com>',
            to,
            subject: "Reset Your Password",
            text,
            html
        })
    
        console.log('Message send! - ',info.messageId);
    } catch (error) {
        console.log('Error sending email: ', error);
        
    }
    
}
 export { sendMail }