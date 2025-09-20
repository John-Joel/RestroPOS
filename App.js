import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "./global.css";


export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Menu and order state
  const [menuItems] = useState([
    { id: 1, name: 'Pizza', price: 200 },
    { id: 2, name: 'Burger', price: 100 },
    { id: 3, name: 'Coke', price: 50 },
    { id: 4, name: 'Pasta', price: 150 },
    { id: 5, name: 'Salad', price: 120 },
    { id: 6, name: 'Ice Cream', price: 80 },
  ]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // User credentials
  const users = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'staff', password: 'staff123', role: 'Employee' },
  ];

  // Handle login
  const handleLogin = () => {
    // Simple validation
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password');
      return;
    }

    const user = users.find(
      u => u.username === username && u.password === password,
    );
    
    if (user) {
      setIsLoggedIn(true);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCart([]);
    setDiscount(0);
  };

  // Add item to cart
  const addToCart = item => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = itemId => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(
      cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate tax (assuming 10% tax)
  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
  };

  // Apply discount
  const applyDiscount = () => {
    if (discount < 0 || discount > 100) {
      Alert.alert(
        'Invalid Discount',
        'Discount must be between 0 and 100 percent',
      );
      return;
    }
    Alert.alert(
      'Discount Applied',
      `Discount of ${discount}% has been applied`,
    );
  };

  // Complete order
  const completeOrder = () => {
    if (cart.length === 0) {
      Alert.alert(
        'Empty Order',
        'Please add items to the cart before completing order',
      );
      return;
    }

    const order = {
      id: Date.now(),
      items: [...cart],
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      timestamp: new Date(),
    };

    setCurrentOrder(order);
    setOrderHistory([...orderHistory, order]);
    setShowReceipt(true);
    setCart([]);
    setDiscount(0);
  };

  // Render menu item
  const renderMenuItem = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 bg-white rounded-xl mb-3 shadow-sm">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-base text-green-600 font-semibold">₹{item.price}</Text>
      </View>
      <TouchableOpacity
        className="bg-green-600 px-4 py-2 rounded-lg"
        onPress={() => addToCart(item)}
      >
        <Text className="text-white font-bold">Add</Text>
      </TouchableOpacity>
    </View>
  );

  // Render cart item
  const renderCartItem = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 bg-white rounded-xl mb-3 shadow-sm">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">
          ₹{item.price} x {item.quantity}
        </Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          className="bg-gray-100 w-8 h-8 rounded-full justify-center items-center border border-gray-200"
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text className="font-bold text-base text-gray-800">-</Text>
        </TouchableOpacity>
        <Text className="mx-3 text-base font-semibold text-gray-800">{item.quantity}</Text>
        <TouchableOpacity
          className="bg-gray-100 w-8 h-8 rounded-full justify-center items-center border border-gray-200"
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text className="font-bold text-base text-gray-800">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
          className="flex-1 justify-center p-5" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-center mb-2 text-gray-800">Restaurant POS</Text>
          <Text className="text-base text-center mb-10 text-gray-600">Sign in to continue</Text>

          <View className="w-full">
            <TextInput
              className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200 text-base text-gray-800"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={"#999"}
            />

            <View className="flex-row items-center bg-gray-50 rounded-xl mb-4 border border-gray-200">
              <TextInput
                className="flex-1 p-4 text-base text-gray-800"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={"#999"}
              />
              <TouchableOpacity 
                className="p-4"
                onPress={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            {loginError ? <Text className="text-red-500 text-center mb-4 text-sm">{loginError}</Text> : null}

            <TouchableOpacity className="bg-blue-500 p-4 rounded-xl items-center mb-5" onPress={handleLogin}>
              <Text className="text-white font-bold text-base">Login</Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-500 italic text-sm">
              Demo credentials: admin/admin123 or staff/staff123
            </Text>
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // POS Screen
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-200 shadow-sm">
        <Text className="text-xl font-bold text-gray-800">Restaurant POS</Text>
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <Text className="text-red-500 font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-row">
        {/* Menu Section */}
        <View className="flex-1 p-4">
          <Text className="text-lg font-bold mb-4 text-gray-800">Menu</Text>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id.toString()}
            className="flex-1"
          />
        </View>

        {/* Cart Section */}
        <View className="flex-1 p-4">
          <Text className="text-lg font-bold mb-4 text-gray-800">Order Summary</Text>

          {cart.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-center text-gray-500 italic text-base">Your cart is empty</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={item => item.id.toString()}
              className="flex-1"
            />
          )}

          {/* Discount Input */}
          <View className="flex-row mt-5 mb-4">
            <TextInput
              className="flex-1 bg-white p-3 rounded-lg border border-gray-200 mr-3 text-base text-gray-800"
              placeholder="Discount %"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={discount.toString()}
              onChangeText={text => setDiscount(parseFloat(text) || 0)}
            />
            <TouchableOpacity
              className="bg-blue-500 px-4 py-3 rounded-lg justify-center"
              onPress={applyDiscount}
            >
              <Text className="text-white font-semibold">Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Order Totals */}
          <View className="bg-white p-5 rounded-xl mb-4 shadow-sm">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Subtotal:</Text>
              <Text className="font-semibold text-gray-800">₹{calculateSubtotal().toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Tax (10%):</Text>
              <Text className="font-semibold text-gray-800">₹{calculateTax().toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Discount:</Text>
              <Text className="font-semibold text-gray-800">-₹{calculateDiscount().toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-3 mt-1 border-t border-gray-200">
              <Text className="font-bold text-gray-800 text-base">Total:</Text>
              <Text className="font-bold text-green-600 text-base">₹{calculateTotal().toFixed(2)}</Text>
            </View>
          </View>

          {/* Complete Order Button */}
          <TouchableOpacity
            className={`p-4 rounded-xl items-center shadow-md ${cart.length === 0 ? 'bg-gray-400' : 'bg-green-600'}`}
            onPress={completeOrder}
            disabled={cart.length === 0}
          >
            <Text className="text-white font-bold text-base">Complete Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Receipt Modal */}
      <Modal visible={showReceipt} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-11/12 max-w-md">
            <Text className="text-2xl font-bold text-center mb-4 text-gray-800">Order Receipt</Text>

            {currentOrder && (
              <>
                <Text className="mb-2 text-gray-600 text-center">
                  Order #: {currentOrder.id}
                </Text>
                <Text className="mb-4 text-gray-600 text-center">
                  Date: {currentOrder.timestamp.toLocaleDateString()}{' '}
                  {currentOrder.timestamp.toLocaleTimeString()}
                </Text>

                <View className="h-px bg-gray-200 my-4" />

                {currentOrder.items.map(item => (
                  <View key={item.id} className="flex-row justify-between mb-3">
                    <Text className="text-gray-800">
                      {item.name} x {item.quantity}
                    </Text>
                    <Text className="text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}

                <View className="h-px bg-gray-200 my-4" />

                <View className="mt-4">
                  <View className="flex-row justify-between mb-2">
                    <Text>Subtotal:</Text>
                    <Text>₹{currentOrder.subtotal.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text>Tax:</Text>
                    <Text>₹{currentOrder.tax.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text>Discount:</Text>
                    <Text>-₹{currentOrder.discount.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between pt-2 mt-2 border-t border-gray-200">
                    <Text className="font-bold text-base text-gray-800">Total:</Text>
                    <Text className="font-bold text-base text-green-600">₹{currentOrder.total.toFixed(2)}</Text>
                  </View>
                </View>
              </>
            )}

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity 
                className="flex-1 bg-blue-500 p-3 rounded-lg items-center mx-1"
                onPress={() => Alert.alert('Print', 'Receipt sent to printer!')}
              >
                <Text className="text-white font-semibold">Print Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-gray-500 p-3 rounded-lg items-center mx-1"
                onPress={() => setShowReceipt(false)}
              >
                <Text className="text-white font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}