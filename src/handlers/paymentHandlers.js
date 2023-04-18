const { createPreference, sendInformationMP } = require("../controllers/paymentControllers");
const { CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REDIRECT_URI} = process.env;
const { User } = require("../db.js");
const axios = require('axios');

const postPaymentHandler = (req,res) => {
  const { items, seller_id } = req.body;
  try{
    res.status(200).json(createPreference(items, seller_id));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
} 

const getAuthCode = async (req,res) => {
  const { code, state } = req.query;
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
          MPAccessToken : response.data.access_token,
          MPUserId : response.data.user_id,
          MPRefreshToken : response.data.refresh_token,
          MPExpiresIn : response.data.expires_in
        },{
          where: {
            id: state
          }
        })
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        res.redirect('https://my-seam.vercel.app/');
      })
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {postPaymentHandler, getAuthCode};
