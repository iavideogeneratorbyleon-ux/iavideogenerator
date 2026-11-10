const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generar nombre por defecto basado en el correo
    const mockName = email.split('@')[0] || 'Creator';
    const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);

    // Crear y guardar el nuevo usuario
    const newUser = new User({
      name: formattedName,
      email,
      password: hashedPassword,
      credits: 1, // Crédito gratis inicial
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
    const isMatch = await bcrypt.compare(password, user.password);
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

module.exports = router;
