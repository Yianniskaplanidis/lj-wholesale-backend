// middleware/validateOrder.js

function validateOrder(req, res, next) {
  const order = req.body;
  if (!order || !order.email || !order.products || order.products.length === 0) {
    return res.status(400).json({ error: 'Missing order email or products' });
  }
  next();
}

module.exports = validateOrder;
