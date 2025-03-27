// ShopScreen.js
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Header from '../components/Header';
import { UserContext } from '../UserContext';

// ---------------- Premium Card ---------------- //
const PremiumCard = () => {
  const [plan, setPlan] = useState('monthly'); // 'monthly' or 'annually'
  const [prices, setPrices] = useState({ premiumMonth: 0, premiumYear: 0 });
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const premiumFeatures = [
    'Cuz Why Not LOL',
    'Ad-free Experience',
    '25 Credits Monthly',
    'Extended Music Player',
    'Custom Profile URL',
  ];

  // Subscribe to Firestore for price updates
  useEffect(() => {
    const docRef = doc(db, 'shop', 'prices');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPrices(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const price = plan === 'monthly' ? prices.premiumMonth : prices.premiumYear;

  const onBuy = () => {
    console.log(`Buying premium ${plan === 'monthly' ? 'Monthly' : 'Annually'} Plan for $${price}`);
    Alert.alert('Buy Premium', `You selected the ${plan} plan for $${price}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>Buy PRO</Text>
        <MaterialCommunityIcons name="chess-knight" size={30} color="#FFF" />
      </View>

      {/* Lottie Animation */}
      <LottieView
        source={{ uri: 'https://assets-v2.lottiefiles.com/a/5a022e76-117b-11ee-88ed-e7a134fba5cb/aQXIz0BRr4.lottie' }}
        autoPlay
        loop
        style={styles.lottie}
      />

      {/* Modern Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, plan === 'monthly' && styles.toggleActive]}
          onPress={() => setPlan('monthly')}
        >
          <Text style={[styles.toggleText, plan === 'monthly' && styles.toggleTextActive]}>MONTHLY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, plan === 'annually' && styles.toggleActive]}
          onPress={() => setPlan('annually')}
        >
          <Text style={[styles.toggleText, plan === 'annually' && styles.toggleTextActive]}>ANNUALLY</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown: Why PRO? */}
      <TouchableOpacity style={styles.dropdownHeader} onPress={() => setFeaturesOpen(!featuresOpen)}>
        <Text style={styles.dropdownHeaderText}>Why PRO?</Text>
        {featuresOpen ? (
          <MaterialIcons name="expand-less" size={24} color="#FFF" />
        ) : (
          <MaterialIcons name="expand-more" size={24} color="#FFF" />
        )}
      </TouchableOpacity>
      {featuresOpen && (
        <View style={styles.dropdownContent}>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Price & Buy Button */}
      <Text style={styles.priceText}>
        ${price}{' '}
        <Text style={styles.periodText}>{plan === 'monthly' ? '/Month' : '/Year'}</Text>
      </Text>
      <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
        <Text style={styles.buyButtonText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------------- Credits Card ---------------- //
const CreditsCard = () => {
  const minQuantity = 2;
  const [quantity, setQuantity] = useState(minQuantity);
  const [pricePerCredit, setPricePerCredit] = useState(0);

  // Subscribe to Firestore for credit price (field: credit)
  useEffect(() => {
    const docRef = doc(db, 'shop', 'prices');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.credit !== undefined) {
          setPricePerCredit(data.credit);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const totalPrice = (pricePerCredit * quantity).toFixed(2);

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => {
    if (quantity > minQuantity) setQuantity((q) => q - 1);
  };

  const onBuy = () => {
    console.log(`Buying ${quantity} credits for $${totalPrice}`);
    Alert.alert('Buy Credits', `You are buying ${quantity} credits for $${totalPrice}`);
    // Example: Pass data to a modal for Stripe checkout if needed.
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>Buy Credits</Text>
        <MaterialCommunityIcons name="circle-multiple" size={30} color="#FFF" />
      </View>

      {/* Lottie Animation */}
      <LottieView
        source={{ uri: 'https://assets-v2.lottiefiles.com/a/ce38d508-f56c-11ee-9b29-f770b8fcb8fb/5hrf3OpgXE.lottie' }}
        autoPlay
        loop
        style={styles.lottie}
      />

      {/* Quantity Control */}
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
          <MaterialCommunityIcons name="minus" size={24} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          keyboardType="number-pad"
          value={String(quantity)}
          onChangeText={(val) => {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= minQuantity) setQuantity(num);
          }}
        />
        <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Total Price & Buy Button */}
      <Text style={styles.priceText}>Total: ${totalPrice}</Text>
      <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
        <Text style={styles.buyButtonText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------------- Coffee Card ---------------- //
const CoffeeCard = () => {
  const minQuantity = 1;
  const [quantity, setQuantity] = useState(minQuantity);
  // For this card the price per coffee is hardcoded to 1
  const pricePerCoffee = 1;
  const totalPrice = (pricePerCoffee * quantity).toFixed(1);

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => {
    if (quantity > minQuantity) setQuantity((q) => q - 1);
  };

  const onBuy = () => {
    console.log(`Buying ${quantity} coffees for $${totalPrice}`);
    Alert.alert('Buy Me A Coffee', `Donating ${quantity} coffee(s) for $${totalPrice}`);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>Buy Me A Coffee</Text>
        <MaterialCommunityIcons name="coffee" size={30} color="#FFF" />
      </View>

      {/* Lottie Animation */}
      <LottieView
        source={{ uri: 'https://assets-v2.lottiefiles.com/a/910d258a-1188-11ee-b88a-9bd716c2ab21/7Frf5sO43U.lottie' }}
        autoPlay
        loop
        style={[styles.lottie, { height: 200, width: 200 }]}
      />

      {/* Quantity Control */}
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
          <MaterialCommunityIcons name="minus" size={24} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          keyboardType="number-pad"
          value={String(quantity)}
          onChangeText={(val) => {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= minQuantity) setQuantity(num);
          }}
        />
        <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Total Price & Donate Button */}
      <Text style={styles.priceText}>Total: ${totalPrice}</Text>
      <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
        <Text style={styles.buyButtonText}>Donate</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------------- Shop Screen ---------------- //
const ShopScreen = () => {
  return (
    <View style={styles.container}>
    <Header isGoBack={true} isMail={false} title={"Shop"}/>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <PremiumCard />
        <CreditsCard />
        <CoffeeCard />
        <View style={{height: 120}}/>
      </ScrollView>
    </View>
  );
};

export default ShopScreen;

// ---------------- Styles ---------------- //
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1f2225',
    borderRadius: 12,
    padding: 20,
    width: 320,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardHeaderText: {
    color: '#acacac',
    fontSize: 25,
    fontWeight: 'bold',
  },
  lottie: {
    height: 200,
    width: 200,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 4,
    overflow: 'hidden',
    width: 250,
    marginVertical: 15,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleActive: {
    backgroundColor: '#FFF',
  },
  toggleText: {
    fontSize: 14,
    letterSpacing: 1,
    color: '#FFF',
  },
  toggleTextActive: {
    color: '#000',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  dropdownHeaderText: {
    color: '#FFF',
    fontSize: 16,
  },
  dropdownContent: {
    alignSelf: 'stretch',
    padding: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 5,
  },
  featureText: {
    color: '#ccc',
    fontSize: 14,
  },
  priceText: {
    fontSize: 20,
    marginVertical: 10,
    color: '#FFF',
  },
  periodText: {
    color: '#ccc',
    fontSize: 16,
  },
  buyButton: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginVertical: 15,
  },
  quantityButton: {
    padding: 5,
  },
  quantityInput: {
    width: 60,
    textAlign: 'center',
    fontSize: 18,
    padding: 5,
    borderWidth: 2,
    borderColor: '#2c5a80',
    borderRadius: 8,
    color: '#FFF',
  },
});
