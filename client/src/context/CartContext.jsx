import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart items', error);
      }
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.product === product._id);
    let updatedCart = [...cartItems];

    if (existingIndex >= 0) {
      const newQuantity = updatedCart[existingIndex].quantity + quantity;
      
      // Enforce stock bounds
      if (newQuantity <= product.stockCount) {
        updatedCart[existingIndex].quantity = newQuantity;
      } else {
        updatedCart[existingIndex].quantity = product.stockCount;
      }
    } else {
      updatedCart.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Math.min(quantity, product.stockCount),
        stockCount: product.stockCount,
      });
    }

    saveCart(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item.product !== productId);
    saveCart(updatedCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    const updatedCart = cartItems.map((item) => {
      if (item.product === productId) {
        // Enforce stock bounds
        const targetQuantity = Math.min(quantity, item.stockCount);
        return { ...item, quantity: targetQuantity };
      }
      return item;
    });

    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
