const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        handleSIGINT: false 
    }
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('WhatsApp API Lista en el puerto 3000'));

app.post('/send-code', async (req, res) => {
    let { phone, code } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    try {
       const cleanPhone = phone.replace(/\D/g, '');
        
        const contactId = await client.getNumberId(cleanPhone);

        if (contactId) {
           const mensaje = [
        `*${code}* es tu código de confirmación de NOMBRE.`,
        ` `,
        `Por tu seguridad, no compartas este código.`
    ].join('\n');
            
            await client.sendMessage(contactId._serialized, mensaje);
            console.log(`Mensaje enviado con éxito a: ${cleanPhone}`);
            res.json({ success: true, message: 'Código enviado' });
        } else {
            console.log(`Número no encontrado en WhatsApp: ${cleanPhone}`);
            res.status(404).json({ success: false, message: 'El número no está registrado en WhatsApp' });
        }

    } catch (error) {
        console.error("Error al enviar:", error);
        res.status(500).json({ success: false, message: 'Error interno al enviar WhatsApp' });
    }
});

client.initialize();
app.listen(3000);