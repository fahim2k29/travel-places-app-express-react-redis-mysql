const cors    = require("cors");
const express = require("express");
const app     = express();
const mysql   = require('mysql');
const redis   = require('redis');

const corsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));
app.use(express.json());

// Redis setup
let redisClient;
(async () => {
    redisClient = redis.createClient();

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    redisClient.on("connect", () => console.log("Redis connected"));

    await redisClient.connect();
})();

// MySQL setup
const DB = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'travel_list',
});

// Connect to MySQL
DB.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected successfully');
});

// Routes
app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center;">Welcome to the Travel List API!</h1>');
});

app.get('/travel-places', async (req, res) => {
    try {
        const cachedData = await redisClient.get('travel_places');
        if (cachedData) {
            return res.send({
                success: true,
                message: 'Travel places retrieved from cache successfully!',
                data   : JSON.parse(cachedData)
            });
        }

        const results = await new Promise((resolve, reject) => {
            DB.query('SELECT * FROM travel_places', (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (!results.length) {
            return res.send({
                success: false,
                message: 'No travel places found!',
                data   : results
            });
        }

        redisClient.setEx('travel_places', 3600, JSON.stringify(results));


        return res.send({
            success: true,
            message: 'Travel places retrieved from DB successfully!',
            data   : results
        });
    } catch (error) {
        throw error;
    }
});

app.post('/travel-places', (req, res) => {
    // Get data from request body
    const {name} = req.body;

    DB.query('INSERT INTO travel_places (name) VALUES (?)', [name], (err, results) => {
        if (err) throw err;

        redisClient.del('travel_places');
        return res.send({
            success: true,
            message: 'Travel place added successfully!',
            data   : {
                id: results.insertId,
                name,
            }
        });
    });
});

app.put('/travel-places/:id', (req, res) => {
    // Get data from request body
    const {name} = req.body;

    DB.query('UPDATE travel_places SET name = ? WHERE id = ?', [name, req.params.id], (err, results) => {
        if (err) throw err;

        redisClient.del('travel_places');
        return res.send({
            success: true,
            message: 'Travel place updated successfully!',
            data   : {
                id: req.params.id,
                name
            }
        });
    });
});

app.delete('/travel-places/:id', (req, res) => {
    DB.query('DELETE FROM travel_places WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;

        redisClient.del('travel_places');

        return res.send({
            success: true,
            message: 'Travel place deleted successfully!'
        });
    });
});


const port = 5000;

app.listen(port, () => {
    console.log(`Running at - http://localhost:${port}`);
});