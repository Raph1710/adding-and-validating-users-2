const express = require('express');
const { resolve } = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(bodyParser.json());

const usersDatabase = [
  {
    email: 'user@example.com',
    // This is a hashed version of 'password123'
    password: '$2b$10$X/8.4agFHLyKFmT9Fj8GOeL7HYuUVs3xHrjcZ.Lh6dBQlYwJ2CQT2'
  },
  {
    email: 'john@example.com',
    // This is a hashed version of 'secure456'
    password: '$2b$10$6CrS.h/ET.fEW6U1X9kP8.SsEZQUkMy5ohHJTPaTu3xEDx78MF7Na'
  }
];

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }
  
  const user = usersDatabase.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }
  
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
    
    if (result) {
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: { email: user.email }
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    const existingUser = usersDatabase.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    usersDatabase.push({
      email,
      password: hashedPassword
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});