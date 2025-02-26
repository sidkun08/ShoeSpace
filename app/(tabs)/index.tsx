// App.js
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, PanResponder, Animated, TouchableOpacity, Linking, GestureResponderEvent } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

// Define the shoe data interface
interface ShoeCard {
  id: number;
  name: string;
  price: number;
  size: number;
  seller: string;
  imageUrl: string;
  productLink: string;
}

const App = () => {
  const [shoes, setShoes] = useState<ShoeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    setIsDragging(false);
    setIsAnimating(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isAnimating,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (_, gesture) => {
      if (!isDragging || isAnimating) return;
      pan.setValue({ x: gesture.dx, y: 0 });
    },
    onPanResponderRelease: (_, gesture) => {
      if (isAnimating) return;
      
      setIsDragging(false);
      if (Math.abs(gesture.dx) > 100) {
        setIsAnimating(true);
        const direction = gesture.dx > 0 ? width : -width;
        
        Animated.timing(pan, {
          toValue: { x: direction, y: 0 },
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (currentIndex < shoes.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
          resetCard();
        });
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
        }).start(() => resetCard());
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 5,
      }).start(() => resetCard());
    },
  });

  const handleImagePress = (productLink: string) => {
    if (!isDragging && !isAnimating) {
      Linking.openURL(productLink);
    }
  };

  const renderCard = (shoe: ShoeCard) => {
    return (
      <Animated.View 
        key={shoe.id}
        style={[
          styles.card,
          {
            transform: pan.getTranslateTransform(),
            zIndex: 1,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => handleImagePress(shoe.productLink)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: shoe.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{shoe.name}</Text>
          <Text style={styles.price}>${shoe.price}</Text>
          <Text style={styles.details}>Size: {shoe.size}</Text>
          <Text style={styles.details}>Seller: {shoe.seller}</Text>
        </View>
      </Animated.View>
    );
  };

  useEffect(() => {
    const loadShoeData = async () => {
      try {
        const SHEET_ID = '1-OYBE6xVNsynmvxMdrEKztjZdZe20kaoJiRUSopwg9E';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
        
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        
        // Updated order: name, price, imageUrl, productLink, seller, size
        const rows = csvText.split('\n').slice(1);
        const formattedShoes = rows.map((row, index) => {
          const [name, price, imageUrl, productLink, seller, size] = row.split(',');
          return {
            id: index + 1,
            name: name.trim(),
            price: Number(price),
            imageUrl: imageUrl.trim(),
            productLink: productLink.trim(),
            seller: seller.trim(),
            size: Number(size)
          };
        });
        
        setShoes(formattedShoes);
      } catch (error) {
        console.error('Error loading shoe data:', error);
      }
    };

    loadShoeData();
  }, []);

  return (
    <View style={styles.container}>
      {currentIndex < shoes.length ? (
        renderCard(shoes[currentIndex])
      ) : (
        <View style={[styles.card, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.name}>No more shoes!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    position: 'absolute',
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#2ecc71',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});

export default App;