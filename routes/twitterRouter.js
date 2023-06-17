//-----------  All the Requirements/Imports Here  -----------------------------
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();


const twitterRouter = express.Router();
twitterRouter.use(express.json());
const session = require("express-session");
const { request } = require("undici");
const { twitterOAuth2 } = require("twitter-oauth2");

//----------------- Twitter Auth Here -----------------------------------
twitterRouter.use(
  session({
    name: "YOUR-SESSION-NAME",
    secret: "YOUR-SECRET",
    resave: false,
    saveUninitialized: true,
  })
);

twitterRouter.use(
  twitterOAuth2({
    client_id: process.env.TWITTER_CLIENT_ID,
    client_secret: process.env.TWITTER_CLIENT_SECRET,
    redirect_uri: "http://localhost:8080/twitter/auth/twitter/callback",
    scope: "tweet.read users.read",
  })
);

twitterRouter.get("/auth/twitter", async (req, res) => {
  const tokenSet = req.session.tokenSet;
  console.log("received tokens %j", req.session.tokenSet);
  const { body } = await request("https://api.twitter.com/2/users/me", {
    headers: {
      Authorization: `Bearer ${tokenSet?.access_token}`,
    },
  });
  const username = await body.json();
  let user_details = {
    name: username.data.name,
  };
  token_Genretor(res, user_details.name, "login with twitter", "custemer");
});

//----------------- Addtional Functions Here -----------------------------------
function token_Genretor(res, name, id, role) {
  let token = jwt.sign(
    { user: name, id: id, role: role },
    process.env.token_key,
    { expiresIn: "1h" }
  );
  let refreshToken = jwt.sign(
    { user: name, id: id, role: role },
    process.env.refresh_key,
    { expiresIn: "7d" }
  );
  res.cookie("token", token);
  res.status(202).json({ refreshToken });
}

//-------------------- All exports ---------------------------------------------
module.exports = { twitterRouter };
