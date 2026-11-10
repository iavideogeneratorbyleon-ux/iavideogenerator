const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: '', // Sin contraseña para cuentas de Google
        credits: 1,
        plan: 'lite',
        googleId,
      });
    }

    res.status(200).json({
      message: 'Autenticación exitosa con Google',
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('Error en Google OAuth:', error);
    res.status(401).json({ message: 'Token de Google inválido' });
  }
});
