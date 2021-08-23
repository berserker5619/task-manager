const mailgun=require('mailgun-js')
const DOMAIN='sandboxa85d688a3c05467a80c1b47e005ceb97.mailgun.org'
const mg=mailgun({apiKey:process.env.MAILGUN_API_KEY,domain:DOMAIN})

const sendWelcomeMail=(email,name)=>{
    const data={
        from:'Nexus@sandboxa85d688a3c05467a80c1b47e005ceb97.mailgun.org',
        to:email,
        subject:'Thanks for joining in!',
        text:`Greetings ${name}!.Welcome to the app.Let me know how you get along with the app.`
    }
    mg.messages().send(data)
}

const sendCancellationMail=(email,name)=>{
    const data={
        from:'Nexus@sandboxa85d688a3c05467a80c1b47e005ceb97.mailgun.org',
        to:email,
        subject:'Cancellation Request',
        text:`Hi,${name}.This is a confirmation email for cancellation of your account as per your request`
    }
    mg.messages().send(data)
}


module.exports={
    sendWelcomeMail,
    sendCancellationMail
}