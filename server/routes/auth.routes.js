const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Almacén temporal en memoria para códigos OTP pendientes (expiran en 10 minutos)
const pendingVerifications = new Map();

// Configuración opcional de Nodemailer (funciona si agregas SMTP_USER y SMTP_PASS en tu .env)
const transporter =
  process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        service: 'gmail', // Puedes cambiarlo a tu proveedor SMTP (Resend, SendGrid, Brevo, etc.)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

// =========================================================================
// NUEVO FLUJO DE REGISTRO CON VERIFICACIÓN OTP (2 PASOS)
// =========================================================================

// PASO A: Enviar código de verificación de 6 dígitos
router.post('/send-verification', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });
    }

    // Verificar si el usuario ya existe en MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Generar código OTP aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Cifrar la contraseña desde este momento para no guardarla en texto plano
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Guardar datos temporales con expiración de 10 minutos
    pendingVerifications.set(email.toLowerCase(), {
      code,
      hashedPassword,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Enviar correo si Nodemailer está configurado, o imprimir en consola en modo desarrollo
    if (transporter) {
      await transporter.sendMail({
        from: `"cempa.ai" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${code} es tu código de verificación de cempa.ai`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #f97316; margin-bottom: 12px;">Bienvenido a cempa.ai</h2>
            <p style="color: #cbd5e1; font-size: 14px;">Usa el siguiente código de 6 dígitos para verificar tu cuenta y reclamar tus 50 créditos gratuitos:</p>
            <div style="background: #1e293b; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #ffffff; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 12px;">Este código expira en 10 minutos. Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
          </div>
        `,
      });
    } else {
      console.log(`\n🔑 [DEV OTP] Código de verificación para ${email}: ${code}\n`);
    }

    return res.status(200).json({
      success: true,
      message: 'Código de verificación enviado',
    });
  } catch (error) {
    console.error('Error en /api/auth/send-verification:', error);
    return res.status(500).json({ message: 'Error al enviar el código de verificación' });
  }
});

// PASO B: Verificar código OTP, guardar nombre y crear usuario definitivo
router.post('/verify-and-register', async (req, res) => {
  try {
    const { email, code, name } = req.body;

    if (!email || !code || !name) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const record = pendingVerifications.get(email.toLowerCase());

    if (!record) {
      return res.status(400).json({ message: 'No hay una solicitud de registro pendiente para este correo' });
    }

    if (Date.now() > record.expiresAt) {
      pendingVerifications.delete(email.toLowerCase());
      return res.status(400).json({ message: 'El código ha expirado. Solicita uno nuevo.' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    // Verificar nuevamente por seguridad que no se haya creado mientras tanto
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      pendingVerifications.delete(email.toLowerCase());
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Crear el usuario definitivo en MongoDB con sus 50 créditos
    const newUser = new User({
      name: name.trim(),
      email,
      password: record.hashedPassword,
      credits: 50,
      plan: 'lite',
    });

    await newUser.save();

    // Limpiar el registro temporal
    pendingVerifications.delete(email.toLowerCase());

    return res.status(201).json({
      message: 'Cuenta verificada y creada exitosamente',
      user: {
        name: newUser.name,
        email: newUser.email,
        credits: newUser.credits,
        plan: newUser.plan,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/verify-and-register:', error);
    return res.status(500).json({ message: 'Error interno al verificar la cuenta' });
  }
});

// =========================================================================
// RUTAS EXISTENTES (INTACTAS)
// =========================================================================

// 1. REGISTRO (Sign Up)
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Cifrar la contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generar nombre por defecto basado en el correo
    const mockName = email.split('@')[0] || 'Creator';
    const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);

    // Crear y guardar el nuevo usuario
    const newUser = new User({
      name: formattedName,
      email,
      password: hashedPassword,
      credits: 50,
      plan: 'lite',
    });

    await newUser.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        name: newUser.name,
        email: newUser.email,
        credits: newUser.credits,
        plan: newUser.plan,
      }
    });

  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. INICIO DE SESIÓN (Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
      }
    });

  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para descontar créditos en tu backend (Express)
router.post('/deduct-credit', async (req, res) => {
  try {
    const { email, amount = 30 } = req.body;

    // Buscas al usuario en tu base de datos de MongoDB Atlas
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.credits < amount) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    // Descontamos el crédito y guardamos
    user.credits -= amount;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      remainingCredits: user.credits 
    });
  } catch (error) {
    console.error('Error al descontar crédito:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// 3. GOOGLE OAUTH
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const googleProfile = await googleUserResponse.json();

    const { email, name, sub: googleId } = googleProfile;

    if (!email) {
      return res.status(400).json({ message: 'No se pudo obtener el correo de Google' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const defaultName = email.split('@')[0] || 'Creator';
      const formattedName = name || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1));

      // Generar un password aleatorio seguro para cumplir con la validación de Mongoose
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(randomPassword, salt);

      user = await User.create({
        name: formattedName,
        email,
        password: hashedPassword,
        credits: 50,
        plan: 'lite',
        googleId,
      });
    }

    res.status(200).json({
      message: 'Autenticación exitosa con Google',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('Error detallado en Google OAuth:', error);
    res.status(500).json({ message: 'Error interno en la autenticación con Google' });
  }
});

module.exports = router;
