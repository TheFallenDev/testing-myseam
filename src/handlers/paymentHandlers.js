const mercadopago = require("mercadopago");
const { createPreference, sendInformationMP } = require("../controllers/paymentControllers");
const { CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REDIRECT_URI} = process.env;
const { User } = require("../db.js");
const axios = require('axios');

const postPaymentHandler = (req,res) => {
  mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN,
  })
  const { items, seller_id } = req.body;
  try{
    res.status(200).json(createPreference(items, seller_id));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  /* mercadopago.preferences.create(preference)
    .then(function (response) {
      res.json({
        global: response.body.id,
      })
    })
    .catch(function (error) {
      console.log(error);
    }); */

} 

const getAuthCode = async (req,res) => {
  const { code, status } = req.query;
  try {
    await axios
      .post(
        "https://api.mercadopago.com/oauth/token",
        {
          client_secret: CLIENT_SECRET,
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI 
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        User.update({ 
          MPAccessToken : response.access_token,
          MPUserId : response.user_id,
          MPRefreshToken : response.refresh_toke,
          MPExpiresIn : response.expires_in
        },{
          where: {
            id: status
          }
        })
      })
      .catch((error) => {
        console.error(error);
      })
    res.redirect('https://my-seam.vercel.app/');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {postPaymentHandler, getAuthCode};
