import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database:"world",
  password: "1234",
  port: 5432
})

db.connect()

async function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

async function checkVisited(){
  const visited = await db.query("SELECT * FROM visited_country")
  let country_code=[]
  visited.rows.forEach((country)=>{
    country_code.push(country.country_code)
  }
  )
  return country_code
 
  
}
// async function checkVisisted() {
//   const result = await db.query("SELECT country_code FROM visited_country");

//   let countries = [];
//   result.rows.forEach((country) => {
//     countries.push(country.country_code);
//   });
//   return countries;
// }
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisited();
  console.log(countries)
  res.render("index.ejs", { countries: countries, total: countries.length})
    
  }
);

app.post("/add", async (req, res)=>{
  const input = await toTitleCase(req.body["country"])
  const result = await db.query("SELECT country_code FROM countries WHERE country_name=$1", [input])
  if(result.rows.length!=0){
    const country_data = result.rows[0]
    const country_code =  country_data.country_code
  

  await db.query("INSERT INTO visited_country (country_code) VALUES ($1)", [country_code])
  res.redirect('/') 
  }

})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
