const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const app = express();
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At: http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
const camelCaseConvert = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// get all movie_names in movie_table
app.get("/movies/", async (request, response) => {
  const getMovieNames = `
    SELECT 
      movie_name
    FROM
    movie;`;
  const camelCase = [];
  const result = await db.all(getMovieNames);
  const values = result.map((eachMovie) => {
    let update = camelCaseConvert(eachMovie);
    camelCase.push(update);
  });
  response.send(camelCase);
});

// creating new movie in movie_table

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovie = `
    INSERT INTO
    movie(director_id, movie_name, lead_actor)
    VALUES
    ('${directorId}','${movieName}','${leadActor}');`;
  const movieResponse = await db.run(createMovie);
  response.send("Movie Successfully Added");
});

//getting movie based on movie_id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = `
    SELECT 
    *
    FROM 
     movie 
    WHERE
     movie_id = ${movieId};`;
  const movieResponse = await db.get(movieDetails);
  response.send(camelCaseConvert(movieResponse));
});

//deleting movie based on movie_id

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE
    FROM 
    movie
    WHERE 
    movie_id = ${movieId};`;
  const movieResponse = await db.run(deleteMovie);
  response.send("Movie Removed");
});

// getting list of directors from director table

app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT 
    *
    FROM 
    director;`;
  const directorResponse = await db.all(getDirectors);
  const camelCase = [];
  const values = directorResponse.map((eachDirector) => {
    let update = camelCaseConvert(eachDirector);
    camelCase.push(update);
  });
  response.send(camelCase);
});

// getting movie_name directed by specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `
    SELECT
     movie_name 
    FROM
     movie
    WHERE 
     director_id = ${directorId};
    `;
  const movieResponse = await db.all(getMovieNames);
  const camelCase = [];
  const values = movieResponse.map((eachMovie) => {
    let update = camelCaseConvert(eachMovie);
    camelCase.push(update);
  });
  response.send(camelCase);
});

module.exports = app;

// updating movie based on movie_id
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovie = `
    UPDATE
      movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};
    `;
  const updateResponse = await db.run(updateMovie);
  response.send("Movie Details Updated");
});
