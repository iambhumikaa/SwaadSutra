const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const { Client } = require("pg");
const multer = require("multer");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const db = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect()
    .then(() => console.log("Connected to PostgreSQL ✅"))
    .catch((err) => console.error("Connection error ❌", err));

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

app.get("/addRecipe", (req, res) => {
    res.render("addRecipeForm");
});

app.post("/addRecipe", upload.single("image"), async (req, res) => {
    console.log("📩 Received Form Data:");
    console.log("Name:", req.body.name);
    console.log("Ingredients:", req.body.ingredients);
    console.log("Steps:", req.body.steps);
    console.log("File Uploaded:", req.file ? req.file.filename : "No file uploaded");

    const { name, ingredients, steps } = req.body;
    const imageUrl = req.file ? "/uploads/" + req.file.filename : null;

    try {
        await db.query(
            "INSERT INTO recipes (name, ingredients, steps, image_url) VALUES ($1, $2, $3, $4)",
            [name, ingredients, steps, imageUrl]
        );
        console.log("Recipe added successfully!");
        res.redirect("/");
    } catch (err) {
        console.error("Error saving recipe:", err);
        res.status(500).send("Error saving recipe");
    }
});

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM recipes ORDER BY id DESC");
        res.render("index", { recipes: result.rows });
    } catch (err) {
        console.error("Error retrieving recipes", err);
        res.status(500).send("Error retrieving recipes" + err.message);
    }
});

app.get("/recipe/:id", async (req, res) => {
    const recipeId = req.params.id;

    try {
        const result = await db.query("SELECT * FROM recipes WHERE id = $1", [recipeId]);

        if (result.rows.length > 0) {
            res.render("recipeFile", { recipe: result.rows[0] });
        } else {
            res.status(404).send("Recipe not found");
        }
    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(500).send("Server Error");
    }
});

app.post("/recipe/delete/:id", async (req, res) => {
    const recipeId = req.params.id;

    try {
        await db.query("DELETE FROM recipes WHERE id = $1", [recipeId]);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(500).send("Server Error");
    }
});

app.get("/favourite", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM favourites");
        const favourites = result.rows;
        res.render("favourites", { favourites });
    } catch (error) {
        console.error("Error fetching favourites:", error);
        res.status(500).send("Server Error");
    }
});

app.post('/favourite/add/:id', async (req, res) => {
    const recipeId = parseInt(req.params.id);
    const { name, image_url } = req.body;

    try {
        const checkQuery = 'SELECT * FROM favourites WHERE recipe_id = $1';
        const checkResult = await db.query(checkQuery, [recipeId]);

        if (checkResult.rows.length > 0) {
            return res.redirect('/favourite');
        }

        const insertQuery = 'INSERT INTO favourites (recipe_id, name, image_url) VALUES ($1, $2, $3)';
        await db.query(insertQuery, [recipeId, name, image_url]);

        res.redirect('/favourite');
    } catch (error) {
        console.error('Error adding to favourites:', error);
        res.status(500).send('Server error');
    }
});

app.get("/search", async (req, res) => {
    const searchInput = req.query.query;

    if (!searchInput) {
        return res.send("No search input provided.");
    }

    const query = searchInput.trim().toLowerCase();

    try {
        const result = await db.query(
            'SELECT * FROM recipes WHERE LOWER(name) = $1',
            [query]
        );

        if (result.rows.length > 0) {
            const recipeId = result.rows[0].id;
            return res.redirect(`/recipe/${recipeId}`);
        } else {
            res.send("Recipe not found.");
        }
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).send("Server error.");
    }
})

app.get("/editRecipe/:id", async (req, res) => {
    const recipeId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM recipes WHERE id=$1;", [recipeId]);
        const recipe = result.rows[0];
        res.render("editRecipe", { recipe });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).send("Could not render edit file.");
    }

})

app.post("/updateRecipe/:id", upload.single('image'), async (req, res) => {
    const recipeId = req.params.id;
    const { name, ingredients, steps } = req.body;
    let image;

     if (req.file) {
        image = "/uploads/" + req.file.filename; 
    } else {
        const current = await db.query("SELECT image_url FROM recipes WHERE id = $1;", [recipeId]);
        image = current.rows[0].image_url;
    }

    try {
        await db.query("UPDATE recipes SET name=$1, ingredients=$2, steps=$3, image_url=$4 WHERE id=$5", [name, ingredients, steps, image, recipeId]);
        const result = await db.query("SELECT * FROM recipes WHERE id=$1;", [recipeId]);
        const recipe = result.rows[0];
        res.render("recipeFile", { recipe });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).send("Could not update recipe.");
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
