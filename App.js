import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  Button,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuPrice}>₹{item.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  // Render cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartInfo}>
        <Text style={styles.cartName}>{item.name}</Text>
        <Text style={styles.cartPrice}>
          ₹{item.price} x {item.quantity}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.loginContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Restaurant POS</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.loginForm}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={"#999"}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={"#999"}
              />
              <TouchableOpacity 
                style={styles.visibilityToggle}
                onPress={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            {loginError ? <Text style={styles.error}>{loginError}</Text> : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.demoText}>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant POS</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id.toString()}
            style={styles.menuList}
          />
        </View>

        {/* Cart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCart}>Your cart is empty</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={item => item.id.toString()}
              style={styles.cartList}
            />
          )}

          {/* Discount Input */}
          <View style={styles.discountContainer}>
            <TextInput
              style={styles.discountInput}
              placeholder="Discount %"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={discount.toString()}
              onChangeText={text => setDiscount(parseFloat(text) || 0)}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyDiscount}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Order Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>₹{calculateSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (10%):</Text>
              <Text style={styles.totalValue}>₹{calculateTax().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-₹{calculateDiscount().toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>₹{calculateTotal().toFixed(2)}</Text>
            </View>
          </View>

          {/* Complete Order Button */}
          <TouchableOpacity
            style={[styles.completeOrderButton, cart.length === 0 && styles.disabledButton]}
            onPress={completeOrder}
            disabled={cart.length === 0}
          >
            <Text style={styles.completeOrderButtonText}>Complete Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Receipt Modal */}
      <Modal visible={showReceipt} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>Order Receipt</Text>

            {currentOrder && (
              <>
                <Text style={styles.receiptDetails}>
                  Order #: {currentOrder.id}
                </Text>
                <Text style={styles.receiptDetails}>
                  Date: {currentOrder.timestamp.toLocaleDateString()}{' '}
                  {currentOrder.timestamp.toLocaleTimeString()}
                </Text>

                <View style={styles.receiptDivider} />

                {currentOrder.items.map(item => (
                  <View key={item.id} style={styles.receiptItem}>
                    <Text style={styles.receiptItemText}>
                      {item.name} x {item.quantity}
                    </Text>
                    <Text style={styles.receiptItemText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}

                <View style={styles.receiptDivider} />

                <View style={styles.receiptTotal}>
                  <View style={styles.receiptTotalRow}>
                    <Text>Subtotal:</Text>
                    <Text>₹{currentOrder.subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.receiptTotalRow}>
                    <Text>Tax:</Text>
                    <Text>₹{currentOrder.tax.toFixed(2)}</Text>
                  </View>
                  <View style={styles.receiptTotalRow}>
                    <Text>Discount:</Text>
                    <Text>-₹{currentOrder.discount.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.receiptTotalRow, styles.receiptGrandTotalRow]}>
                    <Text style={styles.receiptGrandTotalLabel}>Total:</Text>
                    <Text style={styles.receiptGrandTotalValue}>₹{currentOrder.total.toFixed(2)}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.receiptButtons}>
              <TouchableOpacity 
                style={styles.receiptButton}
                onPress={() => Alert.alert('Print', 'Receipt sent to printer!')}
              >
                <Text style={styles.receiptButtonText}>Print Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.receiptButton, styles.closeButton]}
                onPress={() => setShowReceipt(false)}
              >
                <Text style={styles.receiptButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#7f8c8d',
  },
  loginForm: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
    color: '#2c3e50',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  visibilityToggle: {
    padding: 16,
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutButton: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  menuPrice: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyCart: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
    fontSize: 16,
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cartPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f8f9fa',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  discountContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 16,
  },
  discountInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  applyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  totalsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    color: '#7f8c8d',
  },
  totalValue: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 16,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    color: '#27ae60',
    fontSize: 16,
  },
  completeOrderButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  completeOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  receipt: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  receiptDetails: {
    marginBottom: 8,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptItemText: {
    color: '#2c3e50',
  },
  receiptTotal: {
    marginTop: 16,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptGrandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  receiptGrandTotalLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 16,
  },
  receiptGrandTotalValue: {
    fontWeight: 'bold',
    color: '#27ae60',
    fontSize: 16,
  },
  receiptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  receiptButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  closeButton: {
    backgroundColor: '#95a5a6',
  },
  receiptButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});