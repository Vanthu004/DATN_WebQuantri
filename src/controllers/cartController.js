const Cart = require("../models/Cart");
const CartItem = require("../models/cartItem");

exports.createCart = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id là bắt buộc" });

    const cart = new Cart({ user_id });
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: "Thiếu product_id hoặc quantity" });
    }

    const cartItem = new CartItem({
      cart_id: cartId,
      product_id,
      quantity
    });

    await cartItem.save();
    res.status(201).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const { cartId } = req.params;
    const items = await CartItem.find({ cart_id: cartId }).populate({
      path: "product_id",
      select: "name price description"
    });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCartsWithItems = async (req, res) => {
  try {
    const carts = await Cart.find();
    const fullData = await Promise.all(
      carts.map(async (cart) => {
        const items = await CartItem.find({ cart_id: cart._id }).populate({
          path: "product_id",
          select: "name price description"
        });

        return {
          cart_id: cart._id,
          user_id: cart.user_id,
          created_at: cart.created_at,
          items
        };
      })
    );
    res.status(200).json(fullData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
