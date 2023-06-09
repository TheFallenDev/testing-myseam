const mercadopago = require("mercadopago");
const { User } = require("../db.js");
const axios = require('axios');

module.exports = {
  createPreference: async (items, seller_id) => {
    mercadopago.configure({
      access_token: process.env.ACCESS_TOKEN,
    })
    // Crea un objeto de preferencia
    let preference = {
      back_urls: {
        success: "https://my-seam.vercel.app/",
        failure: "http://localhost:3000/checkout/failure",
        pending: "http://localhost:3000/checkout/pending",
      },
      auto_return: "approved",
      items: [],
    };
    items.forEach((item) => {
      preference.items.push(item);
    });
    const seller = await User.findByPk(seller_id);
    // Enviar solicitud de preferencia
    axios({
      method: "POST",
      url: "https://api.mercadopago.com/checkout/preferences",
      headers: {
        Authorization: `Bearer ${seller.MPAccessToken}`,
        "Content-Type": "application/json", 
      },
      data: preference,
    })
      .then(function (response) {
        console.log(response);
        res.json({
          global: response.body.id,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  },
};