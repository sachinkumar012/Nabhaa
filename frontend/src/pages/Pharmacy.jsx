import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, User, Lock, Mail, Phone, Clock, MapPin, Package, ShoppingCart, Minus, X, CreditCard, Truck, CheckCircle, Star, Share2, Percent, IndianRupee, ShieldCheck, Award, ChevronLeft, ChevronRight, Shield, Activity, LogOut, HelpCircle, Ticket } from 'lucide-react';
import HealthIcon from '../components/UI/HealthIcon';
import PaymentService from '../services/PaymentService';
import { useLocationContext } from '../modules/location/presentation/LocationContext';
import LabTests from './LabTests';

const Pharmacy = () => {
  // State management
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 21;
  // OTP State
  const [emailOtp, setEmailOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Sidebar State
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    gender: '',
    address: '',
    city: '',
    pincode: '',
    abhaAddress: ''
  });

  const { location, detectLocation, isLoading, error: locationError } = useLocationContext();

  // Handle location error
  useEffect(() => {
    if (locationError) {
      alert(locationError);
    }
  }, [locationError]);

  // Fetch medicines from API
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines?page=${currentPage}&limit=${itemsPerPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch medicines');
        }
        const data = await response.json();

        // Map backend data to frontend structure
        const mappedMedicines = data.data.map(med => ({
          id: med._id,
          name: med.name,
          type: med.type || 'Medicine',
          availability: !med.isDiscontinued,
          location: 'Nabha Pharmacy',
          price: med.price,
          originalPrice: med.price * 1.2, // Keep as number
          discount: 20, // Mock discount
          description: med.composition || med.name,
          inStock: med.isDiscontinued ? 0 : 100, // Mock stock
          manufacturer: med.manufacturer,
          prescriptionRequired: false,
          stripSize: med.packSize || 'Standard Pack',
          pricePerTablet: (med.price / 10).toFixed(2), // Approx
          image: '/api/placeholder/300/300',
          uses: ['General Health'],
          sideEffects: ['Consult Doctor'],
          precautions: ['Keep away from children'],
          directions: 'As prescribed',
          storage: 'Cool dry place',
          dosage: 'As prescribed',
          modeOfAction: 'Medical',
          returnPolicy: '7 days return',
          rating: 4.0,
          reviews: 0
        }));

        setMedicines(mappedMedicines);
        setTotalPages(data.pagination.pages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medicines:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Shopping cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([
    // Sample orders for testing
    {
      id: 1728123456789,
      items: [
        { id: 1, name: 'Paracetamol 500mg', type: 'Tablet', quantity: 2, price: 25.00 },
        { id: 4, name: 'Cough Syrup', type: 'Syrup', quantity: 1, price: 85.00 }
      ],
      total: 185.00,
      customerInfo: {
        customerName: 'John Doe',
        email: 'john@email.com',
        phone: '9876543210',
        address: '123 Main Street',
        city: 'Nabha',
        pincode: '147201'
      },
      orderDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      status: 'confirmed',
      deliveryDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
      paymentStatus: 'paid',
      paymentId: 'pay_test123456'
    },
    {
      id: 1728098765432,
      items: [
        { id: 8, name: 'Cetirizine 10mg', type: 'Tablet', quantity: 1, price: 55.00 },
        { id: 9, name: 'Vitamin D3', type: 'Capsule', quantity: 1, price: 150.00 }
      ],
      total: 255.00,
      customerInfo: {
        customerName: 'John Doe',
        email: 'john@email.com',
        phone: '9876543210',
        address: '123 Main Street',
        city: 'Nabha',
        pincode: '147201'
      },
      orderDate: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
      status: 'confirmed',
      deliveryDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (delivered)
      paymentStatus: 'cod'
    }
  ]);

  // Order tracking state
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod',
    prescriptionFile: null
  });

  // User management state
  const [users, setUsers] = useState([
    { id: 1, username: 'sachin', password: '12345', name: 'Sachin Kumar', email: 'sachin@pharmacy.com', role: 'admin' }
  ]);

  // Customer management state
  const [customers, setCustomers] = useState([
    { id: 1, username: 'customer1', password: '123456', name: 'John Doe', email: 'john@email.com', phone: '9876543210', role: 'customer' }
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentView, setCurrentView] = useState('user-search');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showCustomerAuth, setShowCustomerAuth] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [customerAuthMode, setCustomerAuthMode] = useState('login'); // 'login' or 'signup'

  // Medicine information modal states
  const [showMedicineInfo, setShowMedicineInfo] = useState(false);
  const [selectedMedicineInfo, setSelectedMedicineInfo] = useState(null);
  const [selectedInfoType, setSelectedInfoType] = useState('');

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });
  const [customerLoginForm, setCustomerLoginForm] = useState({ username: '', password: '' });
  const [customerSignupForm, setCustomerSignupForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: ''
  });
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    type: 'Tablet',
    availability: true,
    location: ''
  });

  // Authentication functions
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);

    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials! Please check your username and password.');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // Validation
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (signupForm.password.length < 4) {
      alert('Password must be at least 4 characters long!');
      return;
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === signupForm.username);
    if (existingUser) {
      alert('Username already exists! Please choose a different username.');
      return;
    }

    // Check if email already exists
    const existingEmail = users.find(u => u.email === signupForm.email);
    if (existingEmail) {
      alert('Email already registered! Please use a different email.');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      username: signupForm.username,
      password: signupForm.password,
      name: signupForm.name,
      email: signupForm.email,
      role: 'pharmacist'
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setCurrentView('dashboard');
    setShowSignup(false);
    setSignupForm({ username: '', password: '', confirmPassword: '', name: '', email: '' });
    alert('Account created successfully! Welcome to the pharmacy system.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('user-search');
  };

  // Customer authentication functions
  // Customer authentication functions
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp) {
      alert("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOtp })
      });
      const data = await response.json();

      if (data.success) {
        setIsOtpSent(true);
        alert(data.message);
      } else {
        alert(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOtp, otp: otpCode })
      });
      const data = await response.json();

      if (data.success) {
        setCurrentCustomer(data.user);
        setShowCustomerAuth(false);

        // Reset State
        setEmailOtp('');
        setOtpCode('');
        setIsOtpSent(false);

        alert(`Welcome, ${data.user.name}! You have successfully logged in.`);
      } else {
        alert(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Verification failed. Please try again.');
    }
  };

  const handleCustomerSignup = (e) => {
    e.preventDefault();

    // Validation
    if (customerSignupForm.password !== customerSignupForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (customerSignupForm.password.length < 4) {
      alert('Password must be at least 4 characters long!');
      return;
    }

    // Check if username already exists
    const existingCustomer = customers.find(c => c.username === customerSignupForm.username);
    if (existingCustomer) {
      alert('Username already exists! Please choose a different username.');
      return;
    }

    // Check if email already exists
    const existingEmail = customers.find(c => c.email === customerSignupForm.email);
    if (existingEmail) {
      alert('Email already registered! Please use a different email.');
      return;
    }

    // Create new customer
    const newCustomer = {
      id: Date.now(),
      username: customerSignupForm.username,
      password: customerSignupForm.password,
      name: customerSignupForm.name,
      email: customerSignupForm.email,
      phone: customerSignupForm.phone,
      role: 'customer'
    };

    setCustomers([...customers, newCustomer]);
    setCurrentCustomer(newCustomer);
    setShowCustomerAuth(false);
    setCustomerSignupForm({ username: '', password: '', confirmPassword: '', name: '', email: '', phone: '' });
    alert(`Account created successfully! Welcome to Nabha Healthcare, ${newCustomer.name}!`);
  };

  const handleOpenProfileModal = () => {
    if (!currentCustomer) return;
    setProfileForm({
      name: currentCustomer.name || '',
      phone: currentCustomer.phone || '',
      gender: currentCustomer.gender || '',
      address: currentCustomer.address || '',
      city: currentCustomer.city || '',
      pincode: currentCustomer.pincode || '',
      abhaAddress: currentCustomer.abhaAddress || ''
    });
    setShowProfileModal(true);
    setIsProfileSidebarOpen(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentCustomer.email,
          ...profileForm
        })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentCustomer(data.user);
        setShowProfileModal(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating profile');
    }
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    clearCart(); // Clear cart when customer logs out
    alert('You have been logged out successfully.');
  };

  const resetCustomerAuthForms = () => {
    setCustomerLoginForm({ username: '', password: '' });
    setCustomerSignupForm({ username: '', password: '', confirmPassword: '', name: '', email: '', phone: '' });
  };

  const resetAuthForms = () => {
    setLoginForm({ username: '', password: '' });
    setSignupForm({ username: '', password: '', confirmPassword: '', name: '', email: '' });
  };

  // Medicine management functions
  const handleAddMedicine = (e) => {
    e.preventDefault();
    const newMedicine = {
      id: Date.now(),
      ...medicineForm,
    };
    setMedicines([...medicines, newMedicine]);
    setMedicineForm({
      name: '',
      type: 'Tablet',
      availability: true,
      location: ''
    });
    setShowAddMedicine(false);
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setMedicineForm({ ...medicine });
    setShowAddMedicine(true);
  };

  // Medicine information modal functions
  const showMedicineInfoModal = (medicine, infoType) => {
    setSelectedMedicineInfo(medicine);
    setSelectedInfoType(infoType);
    setShowMedicineInfo(true);
  };

  const closeMedicineInfoModal = () => {
    setShowMedicineInfo(false);
    setSelectedMedicineInfo(null);
    setSelectedInfoType('');
  };

  const getMedicineInfoContent = (medicine, infoType) => {
    const infoData = {
      'Uses': {
        title: 'Uses',
        content: medicine.uses || ['Pain relief', 'Fever reduction', 'Inflammation control'],
        icon: '💊'
      },
      'Contraindications': {
        title: 'Contraindications',
        content: [
          'Do not use if allergic to any ingredients',
          'Avoid during pregnancy without medical supervision',
          'Not recommended for children under 12 years',
          'Avoid if you have severe liver or kidney disease'
        ],
        icon: '⚠️'
      },
      'Side effects': {
        title: 'Side Effects',
        content: medicine.sideEffects || ['Nausea', 'Dizziness', 'Headache', 'Stomach upset'],
        icon: '⚕️'
      },
      'Precautions and Warnings': {
        title: 'Precautions and Warnings',
        content: medicine.precautions || [
          'Take with food to reduce stomach irritation',
          'Do not exceed recommended dosage',
          'Consult doctor if symptoms persist',
          'Keep out of reach of children'
        ],
        icon: '🔔'
      },
      'Directions for Use': {
        title: 'Directions for Use',
        content: [
          medicine.directions || 'Take as directed by physician',
          'Swallow whole with water',
          'Do not crush or chew unless specified',
          'Take at the same time daily for best results'
        ],
        icon: '📋'
      },
      'Storage and disposal': {
        title: 'Storage and Disposal',
        content: [
          medicine.storage || 'Store in cool, dry place',
          'Keep away from direct sunlight',
          'Store below 25°C',
          'Dispose of expired medicines safely at pharmacy'
        ],
        icon: '📦'
      },
      'Quick Tips': {
        title: 'Quick Tips',
        content: [
          'Take medicine at regular intervals',
          'Complete the full course even if you feel better',
          'Do not share medicines with others',
          'Keep a medicine diary to track effects'
        ],
        icon: '💡'
      },
      'Dosage': {
        title: 'Dosage',
        content: [
          medicine.dosage || 'As prescribed by doctor',
          'Adult dose: 1-2 tablets as needed',
          'Do not exceed 8 tablets in 24 hours',
          'Consult doctor for pediatric dosing'
        ],
        icon: '⚖️'
      },
      'Mode of Action': {
        title: 'Mode of Action',
        content: [
          medicine.modeOfAction || 'Works by blocking pain signals',
          'Reduces inflammation in the body',
          'Blocks enzyme production that causes pain',
          'Effects typically last 4-6 hours'
        ],
        icon: '🔬'
      },
      'Interactions': {
        title: 'Drug Interactions',
        content: [
          'May interact with blood thinners',
          'Avoid with other pain medications',
          'Tell your doctor about all medicines you take',
          'May affect certain blood pressure medications'
        ],
        icon: '🔄'
      },
      'Other Products': {
        title: 'Other Products',
        content: [
          'Available in different strengths',
          'Liquid formulation available',
          'Extended-release version available',
          'Combination products with other medicines'
        ],
        icon: '🏷️'
      }
    };

    return infoData[infoType] || { title: infoType, content: ['Information not available'], icon: '📄' };
  };

  const handleUpdateMedicine = (e) => {
    e.preventDefault();
    const updatedMedicines = medicines.map(med =>
      med.id === editingMedicine.id
        ? { ...medicineForm }
        : med
    );
    setMedicines(updatedMedicines);
    setEditingMedicine(null);
    setShowAddMedicine(false);
    setMedicineForm({
      name: '',
      type: 'Tablet',
      availability: true,
      location: ''
    });
  };

  const toggleAvailability = (medicineId) => {
    const updatedMedicines = medicines.map(med =>
      med.id === medicineId
        ? { ...med, availability: !med.availability }
        : med
    );
    setMedicines(updatedMedicines);
  };

  // Search functionality
  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart functionality
  const addToCart = (medicine, quantity = 1) => {
    // Check if customer is logged in
    if (!currentCustomer) {
      alert('Please login or create an account to add medicines to cart.');
      setShowCustomerAuth(true);
      setCustomerAuthMode('login');
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, medicine.inStock) }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: Math.min(quantity, medicine.inStock) }]);
    }
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find(m => m.id === medicineId);
    setCart(cart.map(item =>
      item.id === medicineId
        ? { ...item, quantity: Math.min(newQuantity, medicine.inStock) }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Share functionality
  const shareMedicine = async (medicine) => {
    const shareData = {
      title: `${medicine.name} - Nabha Healthcare Pharmacy`,
      text: `Check out ${medicine.name} - ${medicine.description}. Price: ₹${medicine.price}. Available at ${medicine.location}.`,
      url: window.location.href + `?medicine=${medicine.id}`
    };

    // Check if Web Share API is supported (mainly mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        console.log('Medicine shared successfully');
      } catch (error) {
        console.log('Error sharing medicine:', error);
        // Fallback to manual sharing options
        showShareOptions(medicine);
      }
    } else {
      // Fallback for desktop and unsupported browsers
      showShareOptions(medicine);
    }
  };

  // Show share options modal for browsers that don't support Web Share API
  const showShareOptions = (medicine) => {
    const shareUrl = window.location.href + `?medicine=${medicine.id}`;
    const shareText = `Check out ${medicine.name} - ${medicine.description}. Price: ₹${medicine.price}. Available at ${medicine.location}.`;

    // Create share options
    const shareOptions = [
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        color: '#25D366'
      },
      {
        name: 'Telegram',
        url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        color: '#0088cc'
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        color: '#1877f2'
      },
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        color: '#1da1f2'
      },
      {
        name: 'LinkedIn',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        color: '#0077b5'
      },
      {
        name: 'Email',
        url: `mailto:?subject=${encodeURIComponent(`${medicine.name} - Nabha Healthcare`)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
        color: '#ea4335'
      }
    ];

    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
      <div class="share-modal">
        <div class="share-modal-header">
          <h3>Share ${medicine.name}</h3>
          <button class="close-share-modal">&times;</button>
        </div>
        <div class="share-options">
          ${shareOptions.map(option => `
            <a href="${option.url}" target="_blank" class="share-option" style="border-left: 4px solid ${option.color}">
              <span class="share-option-name">${option.name}</span>
            </a>
          `).join('')}
        </div>
        <div class="share-link-section">
          <label>Or copy link:</label>
          <div class="share-link-container">
            <input type="text" value="${shareUrl}" readonly class="share-link-input" id="shareUrlInput">
            <button class="copy-link-btn" onclick="copyShareLink()">Copy</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-share-modal').onclick = () => {
      document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };

    // Add copy function to window (temporary)
    window.copyShareLink = () => {
      const input = document.getElementById('shareUrlInput');
      input.select();
      input.setSelectionRange(0, 99999); // For mobile devices

      try {
        document.execCommand('copy');
        const btn = modal.querySelector('.copy-link-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    };
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout functionality
  const handleCheckout = () => {
    if (!currentCustomer) {
      alert('Please login to proceed with checkout.');
      setShowCustomerAuth(true);
      setCustomerAuthMode('login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Pre-fill checkout form with customer data
    setCheckoutForm({
      ...checkoutForm,
      customerName: currentCustomer.name,
      email: currentCustomer.email,
      phone: currentCustomer.phone || ''
    });

    setIsCheckoutOpen(true);
  };

  const processOrder = async (e) => {
    e.preventDefault();

    // Validate prescription requirement
    const prescriptionRequired = cart.some(item => item.prescriptionRequired);
    if (prescriptionRequired && !checkoutForm.prescriptionFile) {
      alert('Some medicines require a prescription. Please upload a valid prescription.');
      return;
    }

    const totalAmount = getCartTotal() + 50; // Including delivery charges

    // Create order object
    const orderData = {
      id: Date.now(),
      items: [...cart],
      total: totalAmount,
      customerInfo: { ...checkoutForm },
      orderDate: new Date().toISOString(),
      status: 'confirmed',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      paymentStatus: 'pending'
    };

    try {
      if (checkoutForm.paymentMethod === 'online') {
        // Process online payment with customer info
        const customerInfo = {
          name: checkoutForm.customerName,
          email: checkoutForm.email,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          city: checkoutForm.city,
          pincode: checkoutForm.pincode
        };

        const orderCreation = await PaymentService.createOrder(totalAmount, 'INR', customerInfo);

        if (!orderCreation.success) {
          alert('Failed to initiate payment. Please try again.');
          return;
        }

        await PaymentService.processOnlinePayment({
          orderId: orderCreation.orderId,
          amount: totalAmount,
          customerName: checkoutForm.customerName,
          email: checkoutForm.email,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          city: checkoutForm.city,
          pincode: checkoutForm.pincode,
          onSuccess: async (paymentResponse) => {
            // Verify payment
            const verification = await PaymentService.verifyPayment(paymentResponse);

            if (verification.verified) {
              // Update order with payment details
              orderData.paymentStatus = 'paid';
              orderData.paymentId = paymentResponse.paymentId;
              orderData.transactionId = verification.transactionId;

              // Add to order history
              setOrderHistory([orderData, ...orderHistory]);

              // Clear cart and close modals
              clearCart();
              setIsCheckoutOpen(false);
              setIsCartOpen(false);
              setCheckoutForm({
                customerName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                pincode: '',
                paymentMethod: 'cod',
                prescriptionFile: null
              });

              alert(`✅ Payment successful! Order ID: ${orderData.id}\n💊 Your medicines will be delivered in 2 days.\n📧 Order confirmation sent to your email.`);
            } else {
              alert('Payment verification failed. Please contact support if amount was deducted.');
            }
          },
          onFailure: (error) => {
            alert(`Payment failed: ${error}\nYou can try again or choose Cash on Delivery.`);
          }
        });
      } else {
        // Cash on Delivery
        orderData.paymentStatus = 'cod';

        // Add to order history
        setOrderHistory([orderData, ...orderHistory]);

        // Clear cart and close modals
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setCheckoutForm({
          customerName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          pincode: '',
          paymentMethod: 'cod',
          prescriptionFile: null
        });

        alert(`✅ Order placed successfully! Order ID: ${orderData.id}\n💰 Payment: Cash on Delivery\n🚚 Delivery in 2 days\n📞 We'll call you before delivery.`);
      }
    } catch (error) {
      console.error('Order processing error:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  // Order tracking functions
  const getCustomerOrders = () => {
    if (!currentCustomer) return [];
    return orderHistory.filter(order =>
      order.customerInfo.email === currentCustomer.email ||
      order.customerInfo.customerName === currentCustomer.name
    );
  };

  const findOrderById = (orderId) => {
    return orderHistory.find(order => order.id.toString() === orderId.toString());
  };

  const getOrderStatus = (order) => {
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(order.deliveryDate);
    const hoursSinceOrder = (now - orderDate) / (1000 * 60 * 60);

    if (hoursSinceOrder < 1) {
      return { status: 'confirmed', message: 'Order Confirmed', progress: 25 };
    } else if (hoursSinceOrder < 24) {
      return { status: 'processing', message: 'Being Prepared', progress: 50 };
    } else if (now < deliveryDate) {
      return { status: 'out_for_delivery', message: 'Out for Delivery', progress: 75 };
    } else {
      return { status: 'delivered', message: 'Delivered', progress: 100 };
    }
  };

  const trackOrderById = (orderId) => {
    const order = findOrderById(orderId);
    if (order) {
      setIsOrderTrackingOpen(true);
      return order;
    } else {
      alert('Order not found. Please check your Order ID.');
      return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pharmacy-container">
      <style>
        {`
          .pharmacy-container {
            min-height: 100vh;
            background-color: #F7FCFF;
            color: #1A1A1A;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 2rem;
          }

          .pharmacist-login-section {
            margin-top: 1rem;
            text-align: center;
            margin-bottom: 2rem;
            padding: 0.75rem 1.5rem;
            background-color: #E6F4EA;
            border-radius: 50px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            width: auto;
            max-width: 90%;
            margin-left: auto;
            margin-right: auto;
            position: relative;
            left: 50%;
            transform: translateX(-50%);
          }

          .btn {
            padding: 0.5rem 1.25rem;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .btn-primary {
            background: #1A73E8;
            color: white;
          }

          .btn-primary:hover {
            background: #1557B0;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
          }

          .btn-secondary {
            background: #ffffff;
            color: #1A73E8;
            border: 1px solid #1A73E8;
            box-shadow: none;
          }

          .btn-secondary:hover {
            background: #F0F7FF;
            transform: translateY(-2px);
            box-shadow: 0 2px 4px rgba(26, 115, 232, 0.1);
          }

          .btn-success {
            background: #059669;
            color: white;
          }

          .btn-success:hover {
            background: #047857;
            transform: translateY(-2px);
          }

          .btn-warning {
            background: #d97706;
            color: white;
          }

          .btn-warning:hover {
            background: #b45309;
            transform: translateY(-2px);
          }

          .main-content {
            max-width: 1400px;
            margin: 0 auto;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(31, 41, 55, 0.1);
            border: 2px solid #1f2937;
          }

          .dashboard-title {
            margin: 0;
            color: #1f2937;
            font-size: 1.5rem;
          }

          .medicines-list {
            max-width: 1000px;
            margin: 2rem auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.1);
            border: 2px solid #e5e7eb;
            overflow: hidden;
          }

          .medicines-header {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 1.5rem 2rem;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1.2fr;
            gap: 1rem;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .medicine-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1.2fr;
            gap: 1rem;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            align-items: center;
            background: #ffffff;
          }

          .medicine-item:hover {
            background: #f8fafc;
            transform: translateX(5px);
            box-shadow: 0 4px 8px rgba(31, 41, 55, 0.05);
          }

          .medicine-item:last-child {
            border-bottom: none;
          }

          .medicine-name-cell {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .medicine-name-primary {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }

          .medicine-name-secondary {
            font-size: 0.85rem;
            color: #6b7280;
            margin: 0;
          }

          .medicine-type-cell {
            display: flex;
            align-items: center;
          }

          .medicine-type-badge {
            background: #1f2937;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.8rem;
            font-weight: 600;
            text-align: center;
            min-width: 80px;
          }

          .availability-cell {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .availability-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 600;
            text-align: center;
          }

          .available {
            background: #d1fae5;
            color: #065f46;
          }

          .unavailable {
            background: #fee2e2;
            color: #991b1b;
          }

          .pharmacy-cell {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #4b5563;
            font-size: 0.9rem;
          }

          .actions-cell {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .action-btn {
            padding: 0.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .action-btn:hover {
            transform: scale(1.1);
          }

          .edit-btn {
            background: #3b82f6;
            color: white;
          }

          .edit-btn:hover {
            background: #2563eb;
          }

          .toggle-btn-available {
            background: #f59e0b;
            color: white;
          }

          .toggle-btn-available:hover {
            background: #d97706;
          }

          .toggle-btn-unavailable {
            background: #10b981;
            color: white;
          }

          .toggle-btn-unavailable:hover {
            background: #059669;
          }

          .no-results {
            text-align: center;
            padding: 3rem 2rem;
            color: #6b7280;
            font-size: 1.1rem;
          }

          .stats-container {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin: 3rem 0;
            flex-wrap: wrap;
          }

          .stat-card {
            background: #ffffff;
            padding: 2rem;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            border: none;
            text-align: center;
            min-width: 180px;
            transition: transform 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-5px);
          }

          .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1A73E8;
            margin: 0;
            line-height: 1;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #5F6368;
            margin: 0.5rem 0 0 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }

          .search-container {
            max-width: 600px;
            margin: 2rem auto;
            position: relative;
          }

          .search-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            font-size: 1.1rem;
            border: 2px solid #1f2937;
            border-radius: 50px;
            background-color: #ffffff;
            color: #1f2937;
            transition: all 0.3s ease;
          }

          .search-input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
          }

          .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #1f2937;
          }

          .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(31, 41, 55, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
          }

          .modal-content {
            background: #ffffff;
            padding: 2rem;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease-out;
            border: 2px solid #1f2937;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #1f2937;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #1f2937;
          }

          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #1f2937;
            border-radius: 8px;
            font-size: 1rem;
            background-color: #ffffff;
            color: #1f2937;
            transition: border-color 0.3s ease;
          }

          .form-input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
          }

          .form-select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #1f2937;
            border-radius: 8px;
            font-size: 1rem;
            background: white;
            color: #1f2937;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 1rem 0;
          }

          .checkbox-group input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
          }

          /* Enhanced Authentication Styles */
          .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
          }

          .auth-modal-content {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            width: 100%;
            max-width: 450px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: slideUp 0.3s ease-out;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }

          .auth-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .auth-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 0.5rem 0;
          }

          .auth-subtitle {
            color: #6b7280;
            font-size: 0.95rem;
          }

          .auth-tabs {
            display: flex;
            background: #f3f4f6;
            border-radius: 8px;
            padding: 0.25rem;
            margin-bottom: 2rem;
          }

          .auth-tab {
            flex: 1;
            padding: 0.75rem;
            border: none;
            background: transparent;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            color: #6b7280;
          }

          .auth-tab.active {
            background: white;
            color: #1f2937;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
          }

          .form-input {
            padding: 0.875rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s ease;
            background: #ffffff;
          }

          .form-input:focus {
            outline: none;
            border-color: #1f2937;
            box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
          }

          .form-input.error {
            border-color: #ef4444;
            background: #fef2f2;
          }

          .error-message {
            color: #ef4444;
            font-size: 0.85rem;
            font-weight: 500;
          }

          .password-strength {
            font-size: 0.8rem;
            margin-top: 0.25rem;
          }

          .strength-weak {
            color: #ef4444;
          }

          .strength-medium {
            color: #f59e0b;
          }

          .strength-strong {
            color: #10b981;
          }

          .auth-submit-btn {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 0.5rem;
          }

          .auth-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(31, 41, 55, 0.3);
          }

          .auth-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .auth-divider {
            display: flex;
            align-items: center;
            margin: 1.5rem 0;
            color: #9ca3af;
            font-size: 0.9rem;
          }

          .auth-divider::before,
          .auth-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
          }

          .auth-divider span {
            padding: 0 1rem;
          }

          .demo-credentials {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
          }

          .demo-credentials h4 {
            margin: 0 0 0.5rem 0;
            color: #0369a1;
            font-size: 0.9rem;
          }

          .demo-credentials p {
            margin: 0.25rem 0;
            font-size: 0.85rem;
            color: #0c4a6e;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }

          .welcome-section {
            text-align: center;
            color: #1A1A1A;
            margin-bottom: 3rem;
            position: relative;
          }

          .welcome-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 800;
            color: #1A1A1A;
            letter-spacing: -0.5px;
          }

          .welcome-subtitle {
            font-size: 1.1rem;
            color: #5F6368;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }

          .action-buttons {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            flex-wrap: wrap;
          }

          .action-buttons .btn {
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes fadeInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          /* Cart Styles */
          .cart-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 400px;
            background: white;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1000;
            display: flex;
            flex-direction: column;
          }

          .cart-sidebar.open {
            transform: translateX(0);
          }

          .cart-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f9fafb;
          }

          .cart-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }

          .cart-items {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
          }

          .cart-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: white;
            border-radius: 8px;
            margin-bottom: 0.5rem;
          }

          .cart-item-info {
            flex: 1;
          }

          .cart-item-name {
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.25rem 0;
          }

          .cart-item-details {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0.25rem 0;
          }

          .cart-item-price {
            font-weight: 600;
            color: #059669;
            margin: 0.25rem 0;
          }

          .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }

          .quantity-btn {
            width: 32px;
            height: 32px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .quantity-btn:hover {
            background: #f3f4f6;
            border-color: #1f2937;
          }

          .quantity-input {
            width: 50px;
            text-align: center;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 0.25rem;
            font-size: 0.875rem;
          }

          .remove-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .remove-btn:hover {
            background: #dc2626;
          }

          .cart-footer {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .cart-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1rem;
          }

          .checkout-btn {
            width: 100%;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 1rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .checkout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          }

          .checkout-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .add-to-cart-btn {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .add-to-cart-btn:hover {
            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
          }

          .add-to-cart-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .medicine-price {
            font-size: 1.1rem;
            font-weight: 700;
            color: #059669;
            margin: 0.5rem 0;
          }

          .stock-info {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0.25rem 0;
          }

          .prescription-badge {
            background: #fef3c7;
            color: #92400e;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-top: 0.5rem;
            display: inline-block;
          }

          .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
            padding: 1rem;
          }

          .checkout-content {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .checkout-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .checkout-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }

          .order-summary {
            background: #f9fafb;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
          }

          .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .order-item:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 1.1rem;
            color: #1f2937;
          }

          .checkout-form {
            display: grid;
            gap: 1rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .file-input-wrapper {
            position: relative;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .file-input-wrapper:hover {
            border-color: #1f2937;
            background: #f9fafb;
          }

          .file-input-wrapper.has-file {
            border-color: #059669;
            background: #f0fdf4;
          }

          .file-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }

          .payment-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
          }

          .payment-method {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .payment-method.selected {
            border-color: #1f2937;
            background: #f9fafb;
          }

          .payment-method:hover {
            border-color: #6b7280;
          }

          /* Order Tracking Styles */
          .order-tracking-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .order-tracking-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .my-orders-btn {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .my-orders-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }

          .orders-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            padding: 1rem;
          }

          .orders-content {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .orders-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .orders-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .order-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
          }

          .order-card:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .order-id {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1f2937;
          }

          .order-date {
            color: #6b7280;
            font-size: 0.875rem;
          }

          .order-status {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .status-confirmed {
            background: #fef3c7;
            color: #92400e;
          }

          .status-processing {
            background: #dbeafe;
            color: #1e40af;
          }

          .status-out_for_delivery {
            background: #fed7d7;
            color: #c53030;
          }

          .status-delivered {
            background: #d1fae5;
            color: #065f46;
          }

          .order-progress {
            margin: 1rem 0;
          }

          .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            transition: width 0.3s ease;
          }

          .progress-text {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
            text-align: center;
          }

          .order-items {
            margin: 1rem 0;
          }

          .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .order-item:last-child {
            border-bottom: none;
          }

          .order-item-name {
            font-weight: 600;
            color: #1f2937;
          }

          .order-item-details {
            color: #6b7280;
            font-size: 0.875rem;
          }

          .order-item-price {
            font-weight: 600;
            color: #059669;
          }

          .order-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 1.1rem;
            font-weight: 700;
            color: #1f2937;
          }

          .track-order-btn {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .track-order-btn:hover {
            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
            transform: translateY(-1px);
          }

          .tracking-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1300;
            padding: 1rem;
          }

          .tracking-content {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .tracking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .tracking-timeline {
            margin: 2rem 0;
          }

          .timeline-step {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
            position: relative;
          }

          .timeline-step:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 20px;
            top: 40px;
            width: 2px;
            height: 40px;
            background: #e5e7eb;
          }

          .timeline-step.active::after {
            background: #10b981;
          }

          .timeline-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e5e7eb;
            color: #6b7280;
            margin-right: 1rem;
            z-index: 1;
          }

          .timeline-icon.active {
            background: #10b981;
            color: white;
          }

          .timeline-content {
            flex: 1;
          }

          .timeline-title {
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.25rem 0;
          }

          .timeline-title.active {
            color: #059669;
          }

          .timeline-description {
            color: #6b7280;
            font-size: 0.875rem;
            margin: 0;
          }

          .tracking-search {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .tracking-search-title {
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 1rem 0;
          }

          .tracking-search-form {
            display: flex;
            gap: 1rem;
          }

          .tracking-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
          }

          .tracking-submit-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .tracking-submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          }

          @media (max-width: 768px) {
            .cart-sidebar {
              width: 100%;
            }

            .checkout-content {
              margin: 1rem;
              padding: 1.5rem;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .payment-methods {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 1200px) {
            .medicines-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          @media (max-width: 992px) {
            .medicines-header,
            .medicine-item {
              grid-template-columns: 2fr 1fr 1fr 1fr auto;
            }
            
            .pharmacy-cell {
              display: none;
            }
            
            .stat-card {
              min-width: 120px;
            }
          }

          @media (max-width: 768px) {
            .medicines-header,
            .medicine-item {
              grid-template-columns: 2fr 1fr 1fr auto;
              gap: 0.75rem;
            }
            
            .medicine-type-cell {
              display: none;
            }
            
            .main-content {
              padding: 1rem;
            }
            
            .form-row {
              grid-template-columns: 1fr;
            }
            
            .welcome-title {
              font-size: 2rem;
            }

            .dashboard-header {
              flex-direction: column;
              gap: 1rem;
            }
            
            .medicines-list {
              margin: 1rem auto;
            }
            
            .medicines-header,
            .medicine-item {
              padding: 1rem;
            }
            
            .stats-container {
              gap: 1rem;
            }
          }

          @media (max-width: 480px) {
            .medicines-header,
            .medicine-item {
              grid-template-columns: 1fr auto;
              gap: 0.5rem;
            }
            
            .medicine-name-primary {
              font-size: 1rem;
            }
            
            .medicines-header {
              font-size: 0.8rem;
            }
            
            .stat-card {
              min-width: 100px;
              padding: 1rem;
            }
            
            .stat-number {
              font-size: 1.5rem;
            }
          }

          /* Share Modal Styles */
          .share-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
          }

          .share-modal {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          .share-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f3f4f6;
          }

          .share-modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.2rem;
            font-weight: 600;
          }

          .close-share-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .close-share-modal:hover {
            background: #f3f4f6;
            color: #1f2937;
          }

          .share-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .share-option {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            background: #f9fafb;
            border-radius: 8px;
            text-decoration: none;
            color: #1f2937;
            transition: all 0.2s;
            border: 1px solid #e5e7eb;
          }

          .share-option:hover {
            background: #f3f4f6;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .share-option-name {
            font-weight: 500;
            margin-left: 0.5rem;
          }

          .share-link-section {
            border-top: 2px solid #f3f4f6;
            padding-top: 1rem;
          }

          .share-link-section label {
            display: block;
            margin-bottom: 0.5rem;
            color: #1f2937;
            font-weight: 500;
            font-size: 0.9rem;
          }

          .share-link-container {
            display: flex;
            gap: 0.5rem;
          }

          .share-link-input {
            flex: 1;
            padding: 0.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.85rem;
            background: #f9fafb;
          }

          .copy-link-btn {
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
            white-space: nowrap;
          }

          .copy-link-btn:hover {
            background: #2563eb;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 480px) {
            .share-modal {
              width: 95%;
              padding: 1rem;
            }
            
            .share-link-container {
              flex-direction: column;
            }
            
            .copy-link-btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="main-content">


        {/* User Search View */}
        {(currentView === 'user-search' || currentView === 'lab-tests' || currentView === 'health-records') && (
          <div>
            {/* New Design Header */}
            <div className="pharmacy-header-redesign" style={{
              fontFamily: 'sans-serif',
              width: '100vw',
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
              marginTop: '-2.5rem',
              overflowX: 'hidden'
            }}>

              {/* Location & Actions Header (User Requested) */}
              <div className="location-actions-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 2rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}>
                {/* Left: Location */}
                <div
                  className="location-section"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                  onClick={detectLocation}
                >
                  <MapPin size={24} color="#374151" />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Delivery Address</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: '700', color: '#115E59', fontSize: '0.9rem' }}>
                        {isLoading ? 'Locating...' : (location ? `${location.city} ${location.pincode}` : 'Detect Location')}
                      </span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="actions-section" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Offers */}
                  <div style={{ cursor: 'pointer' }}>
                    <Percent size={22} color="#374151" style={{ border: '2px solid #374151', borderRadius: '50%', padding: '2px', borderStyle: 'dashed' }} />
                  </div>

                  {/* Cart */}
                  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={24} color="#374151" />
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {getCartItemCount()}
                    </span>
                  </div>

                  {/* Login Button */}
                  {/* Login Button or User Avatar */}
                  {currentCustomer ? (
                    <div
                      title={`Logged in as ${currentCustomer.email}`}
                      onClick={() => setIsProfileSidebarOpen(true)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#115E59', // Pharmacy Theme Color
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '2px solid #f0fdf4'
                      }}
                    >
                      {currentCustomer.email ? currentCustomer.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCustomerAuthMode('login');
                        setShowCustomerAuth(true);
                        resetCustomerAuthForms();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        border: '1px solid #115E59',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#115E59',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>Login</span>
                      <User size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Top Navigation */}
              <div className="top-nav" style={{
                borderBottom: '1px solid #e5e7eb',
                padding: '0 2rem',
                display: 'flex',
                gap: '2rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}>
                <div onClick={() => window.location.href = '/'} style={{ padding: '1rem 0', cursor: 'pointer', color: '#374151' }}>Home</div>
                <div onClick={() => setCurrentView('user-search')} style={{ padding: '1rem 0', borderBottom: currentView === 'user-search' ? '3px solid #00BFA6' : 'none', color: currentView === 'user-search' ? '#00BFA6' : '#374151', cursor: 'pointer' }}>Buy Medicines</div>
                <div onClick={() => window.location.href = '/doctors'} style={{ padding: '1rem 0', cursor: 'pointer' }}>Find Doctors</div>
                <div onClick={() => setCurrentView('lab-tests')} style={{ padding: '1rem 0', borderBottom: currentView === 'lab-tests' ? '3px solid #00BFA6' : 'none', color: currentView === 'lab-tests' ? '#00BFA6' : '#374151', cursor: 'pointer' }}>Lab Tests</div>
                <div style={{ padding: '1rem 0', cursor: 'pointer' }}>Circle Membership</div>
                <div onClick={() => setCurrentView('health-records')} style={{ padding: '1rem 0', borderBottom: currentView === 'health-records' ? '3px solid #00BFA6' : 'none', color: currentView === 'health-records' ? '#00BFA6' : '#374151', cursor: 'pointer' }}>Health Records</div>
                <div style={{ padding: '1rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Credit Card <span style={{ background: '#E0F2FE', color: '#0284C7', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '3px' }}>New</span>
                </div>
                <div style={{ padding: '1rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Buy Insurance <span style={{ background: '#E0F2FE', color: '#0284C7', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '3px' }}>New</span>
                </div>
                <div onClick={() => window.location.href = '/abha'} style={{ padding: '1rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Add ABHA <Shield size={14} /></div>
              </div>

              {currentView === 'user-search' && (
                <>
                  {/* Category Sub-Navigation */}
                  <div className="sub-nav" style={{
                    backgroundColor: '#115E59', // Dark teal/green
                    color: 'white',
                    padding: '0.8rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    gap: '1.5rem'
                  }}>
                    <span style={{ cursor: 'pointer' }}>Nabha Products</span>
                    <span style={{ cursor: 'pointer' }}>Baby Care</span>
                    <span style={{ cursor: 'pointer' }}>Nutritional Drinks & Supplements</span>
                    <span style={{ cursor: 'pointer' }}>Women Care</span>
                    <span style={{ cursor: 'pointer' }}>Personal Care</span>
                    <span style={{ cursor: 'pointer' }}>Ayurveda</span>
                    <span style={{ cursor: 'pointer' }}>Health Devices</span>
                    <span style={{ cursor: 'pointer' }}>Home Essentials</span>
                    <span style={{ cursor: 'pointer' }}>Health Condition</span>
                  </div>

                  {/* Hero Section with Search */}
                  <div className="hero-section" style={{
                    backgroundColor: '#0F3D3E', // Even darker green matching the image
                    padding: '3rem 2rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    color: 'white'
                  }}>
                    {/* Background Illustration Placeholders (Circles/SVGs to mimic style) */}
                    <div style={{ position: 'absolute', left: '5%', bottom: '0', opacity: '0.8' }}>
                      {/* Left Doctor Illustration Placeholder */}
                      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 40C111.046 40 120 31.0457 120 20C120 8.9543 111.046 0 100 0C88.9543 0 80 8.9543 80 20C80 31.0457 88.9543 40 100 40Z" fill="#A7F3D0" />
                        <path d="M140 180V80H60V180" fill="#6EE7B7" />
                      </svg>
                    </div>
                    <div style={{ position: 'absolute', right: '5%', bottom: '0', opacity: '0.8' }}>
                      {/* Right Pharmacist Illustration Placeholder */}
                      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 40C111.046 40 120 31.0457 120 20C120 8.9543 111.046 0 100 0C88.9543 0 80 8.9543 80 20C80 31.0457 88.9543 40 100 40Z" fill="#A7F3D0" />
                        <path d="M140 180V80H60V180" fill="#6EE7B7" />
                      </svg>
                    </div>

                    <div style={{ zIndex: 10, textAlign: 'center', width: '100%', maxWidth: '800px' }}>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white', WebkitTextFillColor: 'white' }}>
                        Buy Medicines and Essentials
                      </h1>

                      <div className="hero-search-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#115E59' }}>
                          <Search />
                        </div>
                        <input
                          type="text"
                          placeholder="Search Medicines"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '1rem',
                            outline: 'none',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {currentView === 'user-search' && (
              <div>
                {/* Cart Header Section */}
                <div className="cart-header-section">
                  <div className="cart-message">
                    {cart.length === 0 ? 'Please add item(s) to proceed' : `${cart.length} item(s) in cart`}
                  </div>
                  <button
                    className="view-cart-btn"
                    onClick={() => setIsCartOpen(true)}
                    disabled={cart.length === 0}
                  >
                    View Cart {cart.length > 0 && `(${cart.length})`}
                  </button>
                </div>

                {/* Language Support */}
                <div className="language-support">
                  <button className="hindi-text">
                    हिंदी में पढ़ें
                  </button>
                </div>

                {/* Medicine Grid Layout */}
                <div className="medicines-grid">
                  {filteredMedicines.map((medicine) => (
                    <div key={medicine.id} className="medicine-card">
                      <div className="medicine-image-container">
                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          className="medicine-image"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE0MS43IDE2MiAxMjUgMTc1IDEyNSAyMDBIMTc1QzE3NSAxNzUgMTU4LjMgMTYyIDE1MCA1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                          }}
                        />
                        {medicine.discount > 0 && (
                          <div className="discount-badge">
                            {medicine.discount}% OFF
                          </div>
                        )}
                        <div className="medicine-actions">
                          <button
                            className="action-btn"
                            title="Share"
                            onClick={() => shareMedicine(medicine)}
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="medicine-info">
                        <div className="medicine-header">
                          <h3 className="medicine-name">{medicine.name}</h3>
                          <div className="manufacturer">By {medicine.manufacturer}</div>
                          <div className="strip-size">{medicine.stripSize}</div>
                        </div>

                        <div className="price-section">
                          <div className="price-container">
                            <span className="current-price">₹{medicine.price.toFixed(2)}</span>
                            {medicine.originalPrice && (
                              <>
                                <span className="original-price">₹{medicine.originalPrice.toFixed(2)}</span>
                                <span className="discount-percent">{medicine.discount}% OFF</span>
                              </>
                            )}
                          </div>
                          <div className="price-per-unit">
                            ₹{medicine.pricePerTablet}/tablet (Inclusive of all taxes)
                          </div>
                        </div>

                        <div className="delivery-info">
                          <Clock size={14} />
                          <span>Delivery by Today, before 11:00 pm</span>
                        </div>

                        <div className="offer-info">
                          *Offer applicable on order above ₹1000
                        </div>

                        <div className="medicine-actions-bottom">
                          <button
                            className="add-to-cart-primary"
                            onClick={() => addToCart(medicine)}
                            disabled={!medicine.availability || medicine.inStock === 0}
                            title={!currentCustomer ? 'Login required to add to cart' : 'Add to cart'}
                          >
                            Add To Cart
                          </button>

                          {!medicine.availability && (
                            <div className="out-of-stock">Out of Stock</div>
                          )}
                        </div>

                        <div className="quick-links">
                          <div className="link-row">
                            <span onClick={() => showMedicineInfoModal(medicine, 'Uses')} title="Click to view detailed uses">• Uses</span>
                            <span onClick={() => showMedicineInfoModal(medicine, 'Contraindications')} title="Click to view contraindications">• Contraindications</span>
                            <span onClick={() => showMedicineInfoModal(medicine, 'Side effects')} title="Click to view side effects">• Side effects</span>
                          </div>
                          <div className="link-row">
                            <span onClick={() => showMedicineInfoModal(medicine, 'Precautions and Warnings')} title="Click to view precautions">• Precautions and Warnings</span>
                          </div>
                          <div className="link-row">
                            <span onClick={() => showMedicineInfoModal(medicine, 'Directions for Use')} title="Click to view usage directions">• Directions for Use</span>
                            <span onClick={() => showMedicineInfoModal(medicine, 'Storage and disposal')} title="Click to view storage information">• Storage and disposal</span>
                          </div>
                          <div className="link-row">
                            <span onClick={() => showMedicineInfoModal(medicine, 'Quick Tips')} title="Click to view quick tips">• Quick Tips</span>
                            <span onClick={() => showMedicineInfoModal(medicine, 'Dosage')} title="Click to view dosage information">• Dosage</span>
                            <span onClick={() => showMedicineInfoModal(medicine, 'Mode of Action')} title="Click to view how it works">• Mode of Action</span>
                          </div>
                          <div className="link-row">
                            <span onClick={() => showMedicineInfoModal(medicine, 'Interactions')} title="Click to view drug interactions">• Interactions</span>
                            <span onClick={() => showMedicineInfoModal(medicine, 'Other Products')} title="Click to view related products">• Other Products</span>
                          </div>
                        </div>

                        <div className="offers-section">
                          <div className="offers-header">
                            <span>Offers Just for you</span>
                            <a href="#" className="view-all">View All</a>
                          </div>
                          <div className="offer-items">
                            <div className="offer-item">
                              <div className="offer-badge save">SAVE 27%</div>
                              <span>Sale Live: Get 27%* OFF</span>
                            </div>
                            <div className="offer-item">
                              <div className="offer-badge discount">23%</div>
                              <span>Get 23%* OFF</span>
                            </div>
                          </div>
                        </div>

                        <div className="return-policy">
                          <Package size={14} />
                          <span>{medicine.returnPolicy}</span>
                          <a href="#" className="read-more">Read More</a>
                        </div>

                        <div className="safety-info">
                          <div className="safety-badge">
                            <Package size={16} />
                            All the Products are packed and stored Safely
                          </div>
                        </div>

                        <div className="medicine-description">
                          <h4>Description</h4>
                          <p>{medicine.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {/* Pagination Controls */}
                <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', margin: '2rem 0' }}>
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      color: '#6b7280'
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'white',
                          border: currentPage === pageNum ? '2px solid #0E7490' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: currentPage === pageNum ? '#0E7490' : '#374151',
                          fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      color: '#6b7280'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {filteredMedicines.length === 0 && searchQuery && (
                  <div className="no-results">
                    <p>No medicines found matching your search criteria.</p>
                  </div>
                )}

                {/* Mobile Floating Action Button for Cart */}
                <button
                  className="mobile-cart-fab"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart size={24} color="white" />
                  {cart.length > 0 && (
                    <span className="cart-count">{cart.length}</span>
                  )}
                </button>
              </div>
            )}

            {currentView === 'lab-tests' && (
              <div className="lab-tests-container" style={{ paddingBottom: '2rem' }}>
                <div style={{ marginTop: '2rem' }}>
                  <LabTests />
                </div>
              </div>
            )}

            {currentView === 'health-records' && (
              <div className="health-records-container" style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#115E59', marginBottom: '2rem' }}>
                  Sign In To Access Your Health Records
                </h1>

                <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem', textAlign: 'left' }}>

                  {/* Feature 1 */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#E0F2FE', padding: '1rem', borderRadius: '50%', color: '#0369A1' }}>
                      <Package size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Receive & Organize your Health information</h3>
                      <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                        Nabha Personal Health Records will sync all your Health Records in real time from the entire Nabha ecosystem ie Nabha Hospitals, Nabha Diagnostics, Nabha 24|7, Nabha Clinics etc. You can use it to view and share your records anytime.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#DCFCE7', padding: '1rem', borderRadius: '50%', color: '#15803D' }}>
                      <Activity size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Track & Monitor</h3>
                      <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                        Nabha 24|7 Personal Health Records digitizes all your health records and helps in tracking your health parameters through health graphs based on your historical values. It helps in understanding your organ's health by analysing abnormal values from your lab reports.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '50%', color: '#B45309' }}>
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Safe & Secure</h3>
                      <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                        Nabha 24|7 Personal Health Record stores all your data in a secure environment and gives you complete control over who can access your Health Records.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCustomerAuthMode('login');
                    setShowCustomerAuth(true);
                    resetCustomerAuthForms();
                  }}
                  style={{
                    backgroundColor: '#115E59',
                    color: 'white',
                    padding: '1rem 3rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(17, 94, 89, 0.2)',
                    marginBottom: '2rem'
                  }}
                >
                  Login Now
                </button>

                <div style={{ background: '#F3F4F6', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Not able to Login?</h4>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                    If you are an international patient or having trouble logging in, you can reach out to our customer support team by emailing your concern to us at <a href="mailto:helpdesk@Nabha247.com" style={{ color: '#115E59', fontWeight: 'bold' }}>helpdesk@Nabha247.com</a>
                  </p>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && currentUser && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <HealthIcon size={40} />
                <h2 className="dashboard-title">Pharmacist Dashboard - Manage Medicines</h2>
              </div>
              <button
                className="btn btn-success"
                onClick={() => setShowAddMedicine(true)}
              >
                <Plus size={16} />
                Add Medicine
              </button>
            </div>

            {/* Dashboard Statistics */}
            <div className="stats-container">
              <div className="stat-card">
                <h3 className="stat-number">{medicines.length}</h3>
                <p className="stat-label">Total Medicines</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">{medicines.filter(m => m.availability).length}</h3>
                <p className="stat-label">In Stock</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">{medicines.filter(m => !m.availability).length}</h3>
                <p className="stat-label">Out of Stock</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">{new Set(medicines.map(m => m.location)).size}</h3>
                <p className="stat-label">Locations</p>
              </div>
            </div>

            <div className="medicines-list">
              <div className="medicines-header">
                <div>Medicine</div>
                <div>Type</div>
                <div>Availability</div>
                <div>Pharmacy Location</div>
                <div>Actions</div>
              </div>
              {medicines.map((medicine) => (
                <div key={medicine.id} className="medicine-item">
                  <div className="medicine-name-cell">
                    <h3 className="medicine-name-primary">{medicine.name}</h3>
                    <p className="medicine-name-secondary">ID: {medicine.id}</p>
                  </div>
                  <div className="medicine-type-cell">
                    <span className="medicine-type-badge">{medicine.type}</span>
                  </div>
                  <div className="availability-cell">
                    <span className={`availability-badge ${medicine.availability ? 'available' : 'unavailable'}`}>
                      {medicine.availability ? '✅ Available' : '❌ Out of Stock'}
                    </span>
                  </div>
                  <div className="pharmacy-cell">
                    <MapPin size={16} />
                    {medicine.location}
                  </div>
                  <div className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditMedicine(medicine)}
                      title="Edit Medicine"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className={`action-btn ${medicine.availability ? 'toggle-btn-available' : 'toggle-btn-unavailable'}`}
                      onClick={() => toggleAvailability(medicine.id)}
                      title={medicine.availability ? 'Mark as Out of Stock' : 'Mark as Available'}
                    >
                      {medicine.availability ? <Clock size={16} /> : <Package size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Authentication Modal */}
        {showLogin && (
          <div className="auth-modal">
            <div className="auth-modal-content">
              <button
                className="close-btn"
                onClick={() => {
                  setShowLogin(false);
                  resetAuthForms();
                }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>

              <div className="auth-header">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <HealthIcon size={48} />
                  <div>
                    <h2 className="auth-title" style={{ margin: 0 }}>Pharmacist Portal</h2>
                    <p className="auth-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Access your pharmacy management dashboard</p>
                  </div>
                </div>
              </div>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                  onClick={() => setAuthMode('signup')}
                >
                  Sign Up
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Login to Dashboard
                  </button>

                  <div className="demo-credentials">
                    <h4>Demo Credentials</h4>
                    <p><strong>Username:</strong> sachin</p>
                    <p><strong>Password:</strong> 12345</p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                      placeholder="Choose a username"
                      required
                      minLength="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="Create a password"
                      required
                      minLength="4"
                    />
                    {signupForm.password && (
                      <div className="password-strength">
                        <span className={
                          signupForm.password.length < 6 ? 'strength-weak' :
                            signupForm.password.length < 8 ? 'strength-medium' : 'strength-strong'
                        }>
                          Password strength: {
                            signupForm.password.length < 6 ? 'Weak' :
                              signupForm.password.length < 8 ? 'Medium' : 'Strong'
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-input ${signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword ? 'error' : ''}`}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      required
                    />
                    {signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword && (
                      <span className="error-message">Passwords do not match</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={signupForm.password !== signupForm.confirmPassword}
                  >
                    Create Account
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Medicine Modal */}
        {showAddMedicine && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowAddMedicine(false);
                    setEditingMedicine(null);
                    setMedicineForm({
                      name: '',
                      type: 'Tablet',
                      availability: true,
                      location: ''
                    });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Medicine Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={medicineForm.name}
                      onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={medicineForm.type}
                      onChange={(e) => setMedicineForm({ ...medicineForm, type: e.target.value })}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Inhaler">Inhaler</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pharmacy Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicineForm.location}
                    onChange={(e) => setMedicineForm({ ...medicineForm, location: e.target.value })}
                    required
                  />
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={medicineForm.availability}
                    onChange={(e) => setMedicineForm({ ...medicineForm, availability: e.target.checked })}
                  />
                  <label htmlFor="availability">Available in stock</label>
                </div>
                <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                  {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-header">
            <h3 className="cart-title">Shopping Cart ({getCartItemCount()})</h3>
            <button
              className="close-btn"
              onClick={() => setIsCartOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-details">{item.type} • {item.manufacturer}</p>
                    <p className="cart-item-price">₹{item.price} each</p>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                        max={item.inStock}
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.inStock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {item.prescriptionRequired && (
                      <span className="prescription-badge" style={{ marginTop: '0.5rem' }}>
                        Prescription Required
                      </span>
                    )}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total: ₹{getCartTotal().toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>

        {/* Checkout Modal */}
        {isCheckoutOpen && (
          <div className="checkout-modal">
            <div className="checkout-content">
              <div className="checkout-header">
                <h3 className="checkout-title">Checkout</h3>
                <button
                  className="close-btn"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Order Summary</h4>
                {cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="order-item">
                  <span>Delivery Charges</span>
                  <span>₹50.00</span>
                </div>
                <div className="order-item">
                  <span><strong>Total Amount</strong></span>
                  <span><strong>₹{(getCartTotal() + 50).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={processOrder} className="checkout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={checkoutForm.customerName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={checkoutForm.pincode}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    required
                  />
                </div>

                {/* Prescription Upload */}
                {cart.some(item => item.prescriptionRequired) && (
                  <div className="form-group">
                    <label className="form-label">Upload Prescription *</label>
                    <div className={`file-input-wrapper ${checkoutForm.prescriptionFile ? 'has-file' : ''}`}>
                      <input
                        type="file"
                        className="file-input"
                        accept="image/*,.pdf"
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, prescriptionFile: e.target.files[0] })}
                        required
                      />
                      {checkoutForm.prescriptionFile ? (
                        <div>
                          <CheckCircle size={24} color="#059669" style={{ marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, color: '#059669', fontWeight: '600' }}>
                            {checkoutForm.prescriptionFile.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Package size={24} color="#6b7280" style={{ marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, color: '#6b7280' }}>
                            Click to upload prescription (PDF or Image)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div className="payment-methods">
                    <div
                      className={`payment-method ${checkoutForm.paymentMethod === 'cod' ? 'selected' : ''}`}
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'cod' })}
                    >
                      <Truck size={24} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: '600' }}>Cash on Delivery</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pay when delivered</div>
                    </div>
                    <div
                      className={`payment-method ${checkoutForm.paymentMethod === 'online' ? 'selected' : ''}`}
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'online' })}
                    >
                      <CreditCard size={24} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: '600' }}>Online Payment</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>UPI/Card/Wallet</div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="checkout-btn">
                  <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                  Place Order - ₹{(getCartTotal() + 50).toFixed(2)}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Customer Authentication Modal */}
        {showCustomerAuth && (
          <div className="auth-modal">
            <div className="auth-modal-content">
              <button
                className="close-btn"
                onClick={() => {
                  setShowCustomerAuth(false);
                  resetCustomerAuthForms();
                }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>

              <div className="auth-header">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <ShoppingCart size={48} color="#22c55e" />
                  <div>
                    <h2 className="auth-title" style={{ margin: 0, color: '#15803d' }}>Customer Account</h2>
                    <p className="auth-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Login or create account to purchase medicines</p>
                  </div>
                </div>
              </div>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${customerAuthMode === 'login' ? 'active' : ''}`}
                  onClick={() => setCustomerAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${customerAuthMode === 'signup' ? 'active' : ''}`}
                  onClick={() => setCustomerAuthMode('signup')}
                >
                  Sign Up
                </button>
              </div>

              {customerAuthMode === 'login' ? (
                <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isOtpSent}
                    />
                  </div>

                  {isOtpSent && (
                    <div className="form-group">
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        className="form-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        required
                        maxLength={6}
                      />
                      <small style={{ color: '#6b7280', display: 'block', marginTop: '5px' }}>Check your email inbox/spam folder.</small>
                    </div>
                  )}

                  <button type="submit" className="auth-submit-btn" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}>
                    {isOtpSent ? 'Verify & Login' : 'Send OTP'}
                  </button>

                  {isOtpSent && (
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#15803d',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        width: '100%',
                        marginTop: '1rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Change Email
                    </button>
                  )}

                  <div className="demo-credentials" style={{ marginTop: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <h4 style={{ color: '#166534' }}>OTP Login</h4>
                    <p style={{ color: '#15803d' }}>Enter any email and receive OTP.</p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCustomerSignup} className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={customerSignupForm.name}
                      onChange={(e) => setCustomerSignupForm({ ...customerSignupForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={customerSignupForm.email}
                      onChange={(e) => setCustomerSignupForm({ ...customerSignupForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={customerSignupForm.phone}
                      onChange={(e) => setCustomerSignupForm({ ...customerSignupForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={customerSignupForm.username}
                      onChange={(e) => setCustomerSignupForm({ ...customerSignupForm, username: e.target.value })}
                      placeholder="Choose a username"
                      required
                      minLength="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={customerSignupForm.password}
                      onChange={(e) => setCustomerSignupForm({ ...customerSignupForm, password: e.target.value })}
                      placeholder="Create a password"
                      required
                      minLength="4"
                    />
                    {customerSignupForm.password && (
                      <div className="password-strength">
                        <span className={
                          customerSignupForm.password.length < 6 ? 'strength-weak' :
                            customerSignupForm.password.length < 8 ? 'strength-medium' : 'strength-strong'
                        }>
                          Password strength: {
                            customerSignupForm.password.length < 6 ? 'Weak' :
                              customerSignupForm.password.length < 8 ? 'Medium' : 'Strong'
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-input ${customerSignupForm.confirmPassword && customerSignupForm.password !== customerSignupForm.confirmPassword ? 'error' : ''}`}
                      value={customerSignupForm.confirmPassword}
                      onChange={(e) => setCustomerSignupForm({ ...customerSignupForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      required
                    />
                    {customerSignupForm.confirmPassword && customerSignupForm.password !== customerSignupForm.confirmPassword && (
                      <span className="error-message">Passwords do not match</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}
                    disabled={customerSignupForm.password !== customerSignupForm.confirmPassword}
                  >
                    Create Account & Start Shopping
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* My Orders Modal */}
        {isMyOrdersOpen && (
          <div className="orders-modal">
            <div className="orders-content">
              <div className="orders-header">
                <h3 className="orders-title">
                  <Package size={24} />
                  My Orders
                </h3>
                <button
                  className="close-btn"
                  onClick={() => setIsMyOrdersOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              {getCustomerOrders().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3>No Orders Yet</h3>
                  <p>You haven&apos;t placed any orders yet. Start shopping to see your orders here!</p>
                </div>
              ) : (
                getCustomerOrders().map((order) => {
                  const status = getOrderStatus(order);
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <div className="order-id">Order #{order.id}</div>
                          <div className="order-date">{formatDate(order.orderDate)}</div>
                        </div>
                        <div className={`order-status status-${status.status}`}>
                          {status.message}
                        </div>
                      </div>

                      <div className="order-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${status.progress}%` }}
                          />
                        </div>
                        <div className="progress-text">
                          {status.progress}% Complete
                        </div>
                      </div>

                      <div className="order-items">
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Items:</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div>
                              <div className="order-item-name">{item.name}</div>
                              <div className="order-item-details">
                                Qty: {item.quantity} | {item.type}
                              </div>
                            </div>
                            <div className="order-item-price">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <span>Total Amount:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Payment: {order.paymentStatus === 'paid' ? '✅ Paid' : '💰 Cash on Delivery'}
                        </div>
                        <button
                          className="track-order-btn"
                          onClick={() => {
                            setTrackingOrderId(order.id.toString());
                            setIsMyOrdersOpen(false);
                            setIsOrderTrackingOpen(true);
                          }}
                        >
                          <MapPin size={16} />
                          Track Order
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Order Tracking Modal */}
        {isOrderTrackingOpen && (
          <div className="tracking-modal">
            <div className="tracking-content">
              <div className="tracking-header">
                <h3 className="orders-title">
                  <MapPin size={24} />
                  Track Your Order
                </h3>
                <button
                  className="close-btn"
                  onClick={() => {
                    setIsOrderTrackingOpen(false);
                    setTrackingOrderId('');
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Order Search */}
              <div className="tracking-search">
                <h4 className="tracking-search-title">Enter Order ID</h4>
                <div className="tracking-search-form">
                  <input
                    type="text"
                    className="tracking-input"
                    placeholder="Enter your Order ID (e.g., 1728123456789)"
                    value={trackingOrderId}
                    onChange={(e) => setTrackingOrderId(e.target.value)}
                  />
                  <button
                    className="tracking-submit-btn"
                    onClick={() => {
                      const order = trackOrderById(trackingOrderId);
                      if (!order) {
                        setTrackingOrderId('');
                      }
                    }}
                  >
                    <Search size={16} />
                    Track
                  </button>
                </div>
              </div>

              {/* Tracking Timeline */}
              {trackingOrderId && findOrderById(trackingOrderId) && (() => {
                const order = findOrderById(trackingOrderId);
                const status = getOrderStatus(order);

                return (
                  <div>
                    {/* Order Info */}
                    <div style={{
                      background: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '2rem'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Order #{order.id}</h4>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        Ordered: {formatDate(order.orderDate)}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        Expected Delivery: {formatDate(order.deliveryDate)}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        Total: ₹{order.total.toFixed(2)}
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="tracking-timeline">
                      <div className={`timeline-step ${status.progress >= 25 ? 'active' : ''}`}>
                        <div className={`timeline-icon ${status.progress >= 25 ? 'active' : ''}`}>
                          <CheckCircle size={20} />
                        </div>
                        <div className="timeline-content">
                          <h4 className={`timeline-title ${status.progress >= 25 ? 'active' : ''}`}>
                            Order Confirmed
                          </h4>
                          <p className="timeline-description">
                            Your order has been received and confirmed
                          </p>
                        </div>
                      </div>

                      <div className={`timeline-step ${status.progress >= 50 ? 'active' : ''}`}>
                        <div className={`timeline-icon ${status.progress >= 50 ? 'active' : ''}`}>
                          <Package size={20} />
                        </div>
                        <div className="timeline-content">
                          <h4 className={`timeline-title ${status.progress >= 50 ? 'active' : ''}`}>
                            Being Prepared
                          </h4>
                          <p className="timeline-description">
                            Your medicines are being prepared and packed
                          </p>
                        </div>
                      </div>

                      <div className={`timeline-step ${status.progress >= 75 ? 'active' : ''}`}>
                        <div className={`timeline-icon ${status.progress >= 75 ? 'active' : ''}`}>
                          <Truck size={20} />
                        </div>
                        <div className="timeline-content">
                          <h4 className={`timeline-title ${status.progress >= 75 ? 'active' : ''}`}>
                            Out for Delivery
                          </h4>
                          <p className="timeline-description">
                            Your order is on the way to your address
                          </p>
                        </div>
                      </div>

                      <div className={`timeline-step ${status.progress >= 100 ? 'active' : ''}`}>
                        <div className={`timeline-icon ${status.progress >= 100 ? 'active' : ''}`}>
                          <CheckCircle size={20} />
                        </div>
                        <div className="timeline-content">
                          <h4 className={`timeline-title ${status.progress >= 100 ? 'active' : ''}`}>
                            Delivered
                          </h4>
                          <p className="timeline-description">
                            Order delivered successfully
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div style={{
                      background: status.progress >= 100 ? '#d1fae5' : '#dbeafe',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <h4 style={{
                        margin: '0 0 0.5rem 0',
                        color: status.progress >= 100 ? '#065f46' : '#1e40af'
                      }}>
                        Current Status: {status.message}
                      </h4>
                      <p style={{
                        margin: 0,
                        color: status.progress >= 100 ? '#047857' : '#1d4ed8'
                      }}>
                        {status.progress >= 100
                          ? '🎉 Your order has been delivered!'
                          : `📦 Your order is ${status.progress}% complete`
                        }
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Cart Sidebar Overlay */}
        {isCartOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999
            }}
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </div>

      {/* Medicine Information Modal */}
      {showMedicineInfo && selectedMedicineInfo && (
        <div className="medicine-info-overlay" onClick={closeMedicineInfoModal}>
          <div className="medicine-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="medicine-info-header">
              <div className="medicine-info-title">
                <span className="info-icon">
                  {getMedicineInfoContent(selectedMedicineInfo, selectedInfoType).icon}
                </span>
                <div>
                  <h3>{getMedicineInfoContent(selectedMedicineInfo, selectedInfoType).title}</h3>
                  <p className="medicine-name">{selectedMedicineInfo.name}</p>
                </div>
              </div>
              <button className="close-info-modal" onClick={closeMedicineInfoModal}>
                <X size={24} />
              </button>
            </div>

            <div className="medicine-info-content">
              <div className="info-section">
                <ul className="info-list">
                  {getMedicineInfoContent(selectedMedicineInfo, selectedInfoType).content.map((item, index) => (
                    <li key={index} className="info-item">
                      <span className="info-bullet">•</span>
                      <span className="info-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedInfoType === 'Uses' && (
                <div className="additional-info">
                  <div className="info-card">
                    <h4>💊 Medicine Details</h4>
                    <p><strong>Type:</strong> {selectedMedicineInfo.type}</p>
                    <p><strong>Manufacturer:</strong> {selectedMedicineInfo.manufacturer}</p>
                    <p><strong>Strip Size:</strong> {selectedMedicineInfo.stripSize}</p>
                  </div>
                </div>
              )}

              {selectedInfoType === 'Dosage' && (
                <div className="additional-info">
                  <div className="dosage-chart">
                    <h4>📊 Dosage Information</h4>
                    <div className="dosage-row">
                      <span>Adults:</span>
                      <span>{selectedMedicineInfo.dosage || '1-2 tablets as needed'}</span>
                    </div>
                    <div className="dosage-row">
                      <span>Children:</span>
                      <span>Consult physician</span>
                    </div>
                    <div className="dosage-row">
                      <span>Maximum daily:</span>
                      <span>As prescribed</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedInfoType === 'Side effects' && (
                <div className="additional-info">
                  <div className="warning-box">
                    <h4>⚠️ Important</h4>
                    <p>If you experience any severe side effects, discontinue use and consult your healthcare provider immediately.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="medicine-info-footer">
              <p className="disclaimer">
                <strong>Disclaimer:</strong> This information is for educational purposes only.
                Always consult your healthcare provider before starting any medication.
              </p>
              <button className="understand-btn" onClick={closeMedicineInfoModal}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Pharmacy Styles */}
      <style>{`
        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }

        .medicine-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .medicine-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .medicine-image-container {
          position: relative;
          width: 100%;
          height: 250px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .medicine-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .medicine-card:hover .medicine-image {
          transform: scale(1.05);
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .medicine-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .medicine-card:hover .medicine-actions {
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .medicine-info {
          padding: 20px;
        }

        .medicine-header {
          margin-bottom: 16px;
        }

        .medicine-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1.4;
        }

        .manufacturer {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .strip-size {
          color: #374151;
          font-size: 14px;
          font-weight: 500;
        }

        .price-section {
          margin-bottom: 16px;
        }

        .price-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .current-price {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .original-price {
          font-size: 16px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .discount-percent {
          background: #ef4444;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .price-per-unit {
          color: #6b7280;
          font-size: 12px;
        }

        .delivery-info {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #059669;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .offer-info {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 16px;
        }

        .medicine-actions-bottom {
          margin-bottom: 20px;
        }

        .add-to-cart-primary {
          width: 100%;
          background: #059669;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .add-to-cart-primary:hover:not(:disabled) {
          background: #047857;
        }

        .add-to-cart-primary:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .out-of-stock {
          background: #fef2f2;
          color: #dc2626;
          text-align: center;
          padding: 8px;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 8px;
        }

        .quick-links {
          margin-bottom: 20px;
        }

        .link-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }

        .link-row span {
          color: #059669;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 6px 12px;
          border-radius: 8px;
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          display: inline-block;
          margin: 2px;
          position: relative;
          overflow: hidden;
        }

        .link-row span:hover {
          color: #047857;
          background: #e0f2fe;
          border-color: #bae6fd;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
        }

        .link-row span:active {
          transform: translateY(0);
          background: #0891b2;
          color: white;
        }

        .offers-section {
          background: #fef7f0;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .offers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .offers-header span {
          font-weight: 600;
          color: #111827;
        }

        .view-all {
          color: #059669;
          text-decoration: none;
          font-size: 14px;
        }

        .offer-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .offer-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .offer-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .offer-badge.save {
          background: #059669;
        }

        .offer-badge.discount {
          background: #0891b2;
        }

        .return-policy {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #374151;
        }

        .read-more {
          color: #059669;
          text-decoration: none;
          margin-left: auto;
        }

        .safety-info {
          margin-bottom: 16px;
        }

        .safety-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          color: #1e40af;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }

        .medicine-description h4 {
          color: #111827;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .medicine-description p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        /* Navigation breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #6b7280;
        }

        .breadcrumb a {
          color: #059669;
          text-decoration: none;
        }

        .breadcrumb span {
          color: #9ca3af;
        }

        /* Cart Header Section */
        .cart-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid #e5e7eb;
        }

        .cart-message {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
        }

        .view-cart-btn {
          background: #059669;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .view-cart-btn:hover:not(:disabled) {
          background: #047857;
        }

        .view-cart-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        /* Language Support */
        .language-support {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        .hindi-text {
          background: #eff6ff;
          color: #1e40af;
          padding: 8px 16px;
          border-radius: 20px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hindi-text:hover {
          background: #dbeafe;
        }

        /* Mobile Floating Action Button - Hidden by default */
        .mobile-cart-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-radius: 50%;
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
          z-index: 1000;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-cart-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 30px rgba(5, 150, 105, 0.5);
        }

        .mobile-cart-fab .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        /* Medicine Information Modal Styles */
        .medicine-info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .medicine-info-modal {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .medicine-info-header {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .medicine-info-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .info-icon {
          font-size: 32px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          height: 48px;
        }

        .medicine-info-title h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .medicine-info-title .medicine-name {
          margin: 4px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
          font-weight: 500;
        }

        .close-info-modal {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 12px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .close-info-modal:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .medicine-info-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .info-section {
          margin-bottom: 24px;
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-bullet {
          color: #059669;
          font-weight: 700;
          font-size: 16px;
          margin-top: 2px;
        }

        .info-text {
          color: #374151;
          line-height: 1.6;
          font-size: 15px;
        }

        .additional-info {
          margin-top: 24px;
        }

        .info-card {
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          border-radius: 12px;
          padding: 20px;
        }

        .info-card h4 {
          margin: 0 0 16px 0;
          color: #0c4a6e;
          font-size: 16px;
          font-weight: 600;
        }

        .info-card p {
          margin: 8px 0;
          color: #374151;
          font-size: 14px;
        }

        .dosage-chart {
          background: #fefbf3;
          border: 1px solid #fbbf24;
          border-radius: 12px;
          padding: 20px;
        }

        .dosage-chart h4 {
          margin: 0 0 16px 0;
          color: #92400e;
          font-size: 16px;
          font-weight: 600;
        }

        .dosage-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #fde68a;
        }

        .dosage-row:last-child {
          border-bottom: none;
        }

        .dosage-row span:first-child {
          font-weight: 500;
          color: #78350f;
        }

        .dosage-row span:last-child {
          font-weight: 600;
          color: #92400e;
        }

        .warning-box {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 12px;
          padding: 20px;
        }

        .warning-box h4 {
          margin: 0 0 12px 0;
          color: #dc2626;
          font-size: 16px;
          font-weight: 600;
        }

        .warning-box p {
          margin: 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.6;
        }

        .medicine-info-footer {
          background: #f9fafb;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .disclaimer {
          margin: 0 0 16px 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }

        .understand-btn {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .understand-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        /* Responsive design for mobile */
        @media (max-width: 768px) {
          .pharmacy-container {
            padding: 0;
          }

          .medicines-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }
          
          .medicine-card {
            margin: 0;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            background: white;
          }

          .medicine-card:active {
            transform: scale(0.98);
          }

          .medicine-image-container {
            height: 180px;
            border-radius: 16px 16px 0 0;
            position: relative;
            overflow: hidden;
          }

          .discount-badge {
            top: 12px;
            left: 12px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .medicine-info {
            padding: 16px;
          }

          .medicine-name {
            font-size: 16px;
            line-height: 1.3;
          }

          .manufacturer {
            font-size: 12px;
          }

          .strip-size {
            font-size: 12px;
          }

          .current-price {
            font-size: 22px;
            font-weight: 800;
            color: #059669;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .original-price {
            font-size: 16px;
            color: #9ca3af;
            text-decoration: line-through;
          }

          .discount-percent {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
          }

          .price-per-unit {
            font-size: 11px;
          }

          .delivery-info {
            font-size: 12px;
          }

          .offer-info {
            font-size: 11px;
          }

          .add-to-cart-primary {
            padding: 14px 16px;
            font-size: 15px;
            border-radius: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
            transition: all 0.3s ease;
            border: none;
            color: white;
            width: 100%;
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }

          .add-to-cart-primary:active:not(:disabled) {
            transform: scale(0.95);
          }

          .add-to-cart-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
          }

          .quick-links {
            margin-bottom: 16px;
          }

          .link-row {
            flex-direction: column;
            gap: 6px;
          }

          .link-row span {
            font-size: 12px;
            padding: 4px 0;
          }

          .offers-section {
            padding: 12px;
            border-radius: 12px;
          }

          .offers-header span {
            font-size: 14px;
          }

          .offer-item {
            font-size: 12px;
          }

          .return-policy {
            font-size: 12px;
          }

          .safety-badge {
            padding: 10px;
            font-size: 12px;
            border-radius: 12px;
          }

          .medicine-description h4 {
            font-size: 14px;
          }

          .medicine-description p {
            font-size: 12px;
          }

          /* Mobile-specific header styles */
          .search-container {
            margin: 1rem;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            background: white;
            position: relative;
            overflow: hidden;
          }

          .search-input {
            font-size: 16px;
            padding: 18px 60px 18px 20px;
            border-radius: 16px;
            border: 2px solid #e5e7eb;
            background: white;
            transition: all 0.3s ease;
            width: 100%;
            box-sizing: border-box;
          }

          .search-input:focus {
            border-color: #059669;
            outline: none;
            box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
          }

          .search-icon {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
          }

          .breadcrumb {
            margin: 1rem;
            font-size: 12px;
          }

          .cart-header-section {
            margin: 1rem;
            padding: 16px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .cart-message {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
          }

          .view-cart-btn {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
            transition: all 0.3s ease;
          }

          .view-cart-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
          }

          .view-cart-btn:disabled {
            background: #d1d5db;
            box-shadow: none;
            transform: none;
          }

          .language-support {
            margin: 1rem;
            text-align: center;
          }

          .hindi-text {
            padding: 12px 24px;
            font-size: 14px;
            border-radius: 25px;
            box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
          }

          /* Mobile cart sidebar */
          .cart-sidebar {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
          }

          /* Mobile floating action button for cart */
          .mobile-cart-fab {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
            z-index: 1000;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .mobile-cart-fab:hover {
            transform: scale(1.1);
            box-shadow: 0 10px 30px rgba(5, 150, 105, 0.5);
          }

          .mobile-cart-fab .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
          }

          /* Mobile Medicine Info Modal */
          .medicine-info-overlay {
            padding: 10px;
          }

          .medicine-info-modal {
            max-height: 95vh;
            border-radius: 16px;
          }

          .medicine-info-header {
            padding: 20px;
            border-radius: 16px 16px 0 0;
          }

          .medicine-info-title h3 {
            font-size: 20px;
          }

          .info-icon {
            font-size: 28px;
            min-width: 44px;
            height: 44px;
          }

          .medicine-info-content {
            padding: 20px;
          }

          .info-item {
            padding: 10px 0;
          }

          .info-text {
            font-size: 14px;
          }

          .medicine-info-footer {
            padding: 16px 20px;
          }

          .understand-btn {
            padding: 14px 20px;
            font-size: 15px;
          }

          /* Mobile cart FAB */
          .mobile-cart-fab {
            display: flex !important;
          }

          /* Better spacing for mobile */
          .stats-grid {
            margin: 1rem;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card {
            padding: 16px;
            border-radius: 12px;
          }

          .stat-number {
            font-size: 24px;
          }

          .stat-label {
            font-size: 12px;
          }
        }

        /* Extra small devices (phones in portrait) */
        @media (max-width: 480px) {
          .medicines-grid {
            padding: 0.75rem;
            gap: 1rem;
          }

          .medicine-card {
            border-radius: 20px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          }

          .medicine-image-container {
            height: 180px;
            border-radius: 20px 20px 0 0;
          }

          .medicine-info {
            padding: 16px;
          }

          .medicine-name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 6px;
          }

          .manufacturer {
            font-size: 13px;
            color: #6b7280;
          }

          .strip-size {
            font-size: 13px;
            color: #374151;
            font-weight: 500;
          }

          .current-price {
            font-size: 24px;
            font-weight: 800;
          }

          .add-to-cart-primary {
            padding: 16px 20px;
            font-size: 16px;
            border-radius: 16px;
            font-weight: 700;
            margin-top: 16px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
            transition: all 0.3s ease;
          }

          .add-to-cart-primary:active:not(:disabled) {
            transform: scale(0.97);
          }

          .cart-header-section {
            flex-direction: column;
            gap: 16px;
            text-align: center;
            margin: 1rem;
            padding: 20px;
            border-radius: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .cart-message {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
          }

          .view-cart-btn {
            width: 100%;
            padding: 16px 24px;
            font-size: 16px;
            border-radius: 16px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
          }

          .offers-section {
            padding: 16px;
            border-radius: 16px;
            background: linear-gradient(135deg, #fef7f0 0%, #fef3e2 100%);
          }

          .quick-links {
            margin-bottom: 16px;
          }

          .link-row span {
            background: #f0f9ff;
            padding: 8px 12px;
            border-radius: 8px;
            margin: 2px;
            display: inline-block;
            font-size: 12px;
            transition: all 0.2s ease;
          }

          .link-row span:active {
            transform: scale(0.95);
            background: #e0f2fe;
          }

          .safety-info {
            margin-bottom: 16px;
          }

          .safety-badge {
            padding: 16px;
            border-radius: 16px;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            font-size: 14px;
          }

          .mobile-cart-fab {
            width: 64px;
            height: 64px;
            bottom: 20px;
            right: 20px;
            box-shadow: 0 8px 30px rgba(5, 150, 105, 0.4);
          }

          .mobile-cart-fab:active {
            transform: scale(0.9);
          }

          /* Extra Small Device Modal Styles */
          .medicine-info-overlay {
            padding: 5px;
          }

          .medicine-info-modal {
            max-height: 98vh;
            border-radius: 12px;
          }

          .medicine-info-header {
            padding: 16px;
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .medicine-info-title {
            flex-direction: column;
            gap: 8px;
          }

          .medicine-info-title h3 {
            font-size: 18px;
          }

          .medicine-info-content {
            padding: 16px;
          }

          .info-item {
            padding: 8px 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .info-bullet {
            display: none;
          }

          .info-text {
            font-size: 13px;
            background: #f8fafc;
            padding: 8px 12px;
            border-radius: 8px;
            width: 100%;
            border-left: 3px solid #059669;
          }

          .info-card, .dosage-chart, .warning-box {
            padding: 16px;
            border-radius: 12px;
          }

          .medicine-info-footer {
            padding: 16px;
          }

          .disclaimer {
            font-size: 11px;
          }

          .understand-btn {
            padding: 16px 20px;
            font-size: 16px;
            border-radius: 12px;
          }

          /* Smooth scroll behavior */
          html {
            scroll-behavior: smooth;
          }

          /* Better touch feedback */
          * {
            -webkit-tap-highlight-color: rgba(5, 150, 105, 0.2);
          }
        }

        /* Landscape mode adjustments */
        @media (max-width: 768px) and (orientation: landscape) {
          .medicine-image-container {
            height: 140px;
          }

          .medicines-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      {/* Profile Sidebar */}
      {isProfileSidebarOpen && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
            onClick={() => setIsProfileSidebarOpen(false)}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '320px',
            height: '100%',
            background: 'white',
            zIndex: 1101,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'sans-serif'
          }}>
            {/* Header */}
            <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                  {currentCustomer?.name || 'User'}
                </h2>
                <button onClick={() => setIsProfileSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
                {currentCustomer?.abhaAddress ? `ABHA No: ${currentCustomer.abhaAddress}` : ''}
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                {currentCustomer?.gender ? `${currentCustomer.gender} | ` : ''}
                {currentCustomer?.age ? currentCustomer.age : ''}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                {currentCustomer?.phone || ''}
              </p>
            </div>

            {/* Menu */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
              {[
                { icon: User, label: 'Manage Profiles', action: handleOpenProfileModal },
                { icon: MapPin, label: 'Address Book' },
                { icon: Package, label: 'My Orders' },
                { icon: CreditCard, label: 'Transactions and Payments' },
                { icon: Award, label: 'One Nabha HealthCare Membership', color: '#eab308' },
                { icon: Ticket, label: 'Pharmacy Voucher Balance' },
                { icon: HelpCircle, label: 'Need Help' },
              ].map((item, index) => (
                <div key={index}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                  onClick={item.action}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <item.icon size={20} color={item.color || "#4b5563"} />
                    <span style={{ color: '#374151', fontSize: '0.95rem' }}>{item.label}</span>
                  </div>
                  <ChevronRight size={16} color="#9ca3af" />
                </div>
              ))}

              {/* Logout */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid #f9fafb', marginTop: '1rem' }}
                onClick={() => {
                  setIsProfileSidebarOpen(false);
                  handleCustomerLogout();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <LogOut size={20} color="#ef4444" />
                  <span style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: '500' }}>Logout</span>
                </div>
                <ChevronRight size={16} color="#ef4444" />
              </div>
            </div>
          </div>
        </>
      )}
      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Update Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Address</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '80px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Pincode</label>
                    <input
                      type="text"
                      value={profileForm.pincode}
                      onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>ABHA Number (Optional)</label>
                  <input
                    type="text"
                    value={profileForm.abhaAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, abhaAddress: e.target.value })}
                    placeholder="e.g. 12-3456-7890-1234"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '12px',
                    background: '#115E59',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;