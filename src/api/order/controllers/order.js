("use strict");
const stripe = require("stripe")(process.env.STRIPE_KEY);
/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { user, products } = ctx.request.body;
    try {
      const lineItems = await Promise.all(
        products.map(async (product) => {
          const item = await strapi
            .service("api::product.product")
            .findOne(product.id);
  
          return {
            price_data: {
              currency: "ron",
              product_data: {
                name: item.title,
                description: item.desc,
              },
              unit_amount: Math.round(item.price * 100),
            },
            adjustable_quantity: {
                enabled:true,
                minimum: 1,
            },
            quantity: product.quantity,
          };
        })
      );
  
      const session = await stripe.checkout.sessions.create({
        submit_type: "pay",
        shipping_address_collection: {allowed_countries: ["RO", "CA", "GB", "DE"]},
        payment_method_types: ["card"],
        mode: "payment",
        success_url: process.env.CLIENT_URL + "/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: process.env.CLIENT_URL + "?success=false",
        line_items: lineItems,
        allow_promotion_codes: true,
        shipping_options: [{ shipping_rate: "shr_1MrPV8L8VKq4usCcBe7C6mmk" }],
      });
  
      await strapi
        .service("api::order.order")
        .create({ data: { user, products, stripeId: session.id } });
  
      return { stripeSession: session };
    } catch (error) {
      ctx.response.status = 500;
      return { error };
    }
  },
}));