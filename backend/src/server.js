const express = require('express');
const cors = require('cors');
const connection = require('./db_config');
const multer = require("multer");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

const storageImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.trim().replaceAll(" ", "_");
    cb(null, Date.now() + fileName);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
function imageFileFilter(
  req,
  file,
  cb
) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new InvalidFileFormatError());
  }
}

const upload = multer({ storage: storageImage, fileFilter: imageFileFilter });

const port = 3000;

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Erro no servidor.'
      });
    }

    if (results.length > 0) {
      res.json({
        success: true,
        message: 'Login completo',
        data: results[0]
      });
    } else {
      res.json({
        success: false,
        message: 'Usuário ou senha incorretos'
      });
    }
  });
});

app.post('/cadastro', (req, res) => {
  const { name, email, password } = req.body;
  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  connection.query(query, [name, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar.'
      });
    }
    res.json({
      success: true,
      message: 'Você foi cadastrado',
      id: result.insertId
    });
  });
});

app.post('/api/recipes', upload.single("image"), (req, res) => {
  const { user_id, title, text } = req.body;
  const image_url = req.file?.filename

  if (!user_id || !title || !text) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  let query = `
      INSERT INTO recipes (user_id, title, text)
      VALUES (?, ?, ?)
    `;
  const params = [user_id, title, text];

  if (image_url) {
    query = `
      INSERT INTO recipes (user_id, title, text, image_url)
      VALUES (?, ?, ?, ?)
    `;
    params.push(image_url)
  }

  connection.query(query, params, (err, result) => {
    if (err) {
      console.error('Erro ao salvar receita:', err);
      return res.status(500).json({ message: 'Erro ao salvar receita.' });
    }

    res.status(201).json({
      message: 'Receita publicada com sucesso!',
      id: result.insertId,
      title,
      text,
    });
  });
});

app.get("/api/recipes", (req, res) => {
  connection.query("SELECT * FROM recipes", (err, result) => {
    if (err) {
      console.error('Erro ao listar receitas:', err);
      return res.status(500).json({ message: 'Erro ao listar receitas.' });
    }

    res.status(201).json({
      message: 'Receitas listadas com sucesso!',
      result
    });
  });
});

// (No seu arquivo de servidor backend, ex: app.js)

// PRESUMO que você já tenha sua conexão de 'db' configurada.

/**
 * ROTA GET: Buscar dados do perfil
 */
app.get('/api/profile/:id', (req, res) => {
  const { id } = req.params;

  // (Use a tabela correta. Estou assumindo 'users')
  const query = "SELECT id, username, email FROM users WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao buscar perfil:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Retorna o primeiro (e único) resultado
    res.status(200).json({ data: result[0] });
  });
});


/**
 * ROTA PUT: Atualizar o perfil
 * (Deixaremos a lógica pronta para o próximo passo)
 */
app.put('/api/profile/:id', (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  // CUIDADO: Você precisará de lógica para atualizar a SENHA separadamente e com hash!
  // Por enquanto, vamos focar em username e email.

  if (!username || !email) {
    return res.status(400).json({ message: 'Usuário e email são obrigatórios.' });
  }

  const query = "UPDATE users SET username = ?, email = ? WHERE id = ?";

  db.query(query, [username, email, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar perfil:', err);
      return res.status(500).json({ message: 'Erro ao atualizar.' });
    }
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', data: { id, username, email } });
  });
});


/**
 * ROTA DELETE: Deletar o perfil
 * (Esta é uma ação destrutiva, use com cuidado!)
 */
app.delete('/api/profile/:id', (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao deletar perfil:', err);
      return res.status(500).json({ message: 'Erro ao deletar.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Você também deve deletar receitas, posts, etc. associados a ele!
    // (Ex: DELETE FROM recipes WHERE user_id = ?)

    res.status(200).json({ message: 'Conta deletada com sucesso.' });
  });
});

app.use("/uploads", express.static(path.join(__dirname, "public")));

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));