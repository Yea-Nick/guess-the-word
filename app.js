import express from 'express';
import dotenv from 'dotenv';

dotenv.config({
    path: `.env`,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(/.*/, (req, res) => {
    res.redirect('/');
});
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
