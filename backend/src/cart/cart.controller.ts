import { Request, Response } from 'express';
import Cart from './cart.model';
import Business from '../business/business.model';
import Product from '../products/products.model';

/** Helper to recalculate total amount of cart */
const recalculateCart = (cart: any) => {
  cart.totalAmount = cart.items.reduce((acc: number, item: any) => {
    item.subtotal = item.price * item.quantity;
    return acc + item.subtotal;
  }, 0);
};

/** GET /api/cart/:slug/:sessionId */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, sessionId } = req.params;
    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    let cart = await Cart.findOne({ sessionId, business: business._id }).populate('items.product', 'images stock isAvailable');
    if (!cart) {
      // Create a fresh empty cart for this guest session
      cart = await Cart.create({
        sessionId,
        business: business._id,
        items: [],
        totalAmount: 0,
        isConverted: false
      });
    }

    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/cart/:slug/:sessionId/items */
export const addItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, sessionId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      res.status(400).json({ success: false, message: 'Invalid product or quantity' });
      return;
    }

    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      res.status(404).json({ success: false, message: 'Product is unavailable' });
      return;
    }

    // Verify stock availability
    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
      return;
    }

    let cart = await Cart.findOne({ sessionId, business: business._id });
    if (!cart) {
      cart = new Cart({
        sessionId,
        business: business._id,
        items: [],
        totalAmount: 0,
        isConverted: false
      });
    }

    // Check if product is already in cart
    const existingIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (product.stock < newQty) {
        res.status(400).json({ success: false, message: `Cannot add more. Max stock is ${product.stock}` });
        return;
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].subtotal = cart.items[existingIndex].price * newQty;
    } else {
      cart.items.push({
        product: product._id as any,
        name: product.title,
        price: product.price,
        quantity,
        subtotal: product.price * quantity
      });
    }

    recalculateCart(cart);
    cart.isConverted = false; // Reset conversion state if user interacts with cart again
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'images stock isAvailable');
    res.json({ success: true, cart: populatedCart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/cart/:slug/:sessionId/items/:productId */
export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, sessionId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
      return;
    }

    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
      return;
    }

    const cart = await Cart.findOne({ sessionId, business: business._id });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, message: 'Item not found in cart' });
      return;
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'images stock isAvailable');
    res.json({ success: true, cart: populatedCart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/cart/:slug/:sessionId/items/:productId */
export const removeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, sessionId, productId } = req.params;

    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const cart = await Cart.findOne({ sessionId, business: business._id });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId) as any;

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'images stock isAvailable');
    res.json({ success: true, cart: populatedCart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/cart/:slug/:sessionId */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, sessionId } = req.params;

    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const cart = await Cart.findOne({ sessionId, business: business._id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
