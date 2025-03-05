// App.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useShoeContext, ShoeCard } from '../context/ShoeContext';

const { width } = Dimensions.get('window');

const App = () => {
  const [shoes, setShoes] = useState<ShoeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const cardVisible = useRef(true);
  
  // Get context functions
  const { addLikedShoe, addDislikedShoe } = useShoeContext();

  // Fetch shoes from Google Spreadsheet
  useEffect(() => {
    const fetchShoes = async () => {
      try {
        setLoading(true);
        
        const spreadsheetId = '1-OYBE6xVNsynmvxMdrEKztjZdZe20kaoJiRUSopwg9E';
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
        
        const response = await fetch(url);
        const text = await response.text();
        const jsonText = text.substring(47).slice(0, -2);
        const data = JSON.parse(jsonText);
        
        if (data.table && data.table.rows) {
          const headers = data.table.cols.map((col: any) => col.label.toLowerCase());
          const parsedShoes = data.table.rows
            .map((row: any) => {
              const shoe: Partial<ShoeCard> = {};
              headers.forEach((header: string, i: number) => {
                shoe[header as keyof ShoeCard] = row.c[i]?.v?.toString() || '';
              });
              
              return {
                id: shoe.id || Math.random().toString(36).substr(2, 9),
                name: shoe.name || '',
                price: shoe.price || '',
                size: shoe.size || '',
                seller: shoe.seller || '',
                imageUrl: shoe.imageurl || '',
                productLink: shoe.productlink || '#',
              } as ShoeCard;
            })
            .filter((shoe): shoe is ShoeCard => 
              typeof shoe.name === 'string' && 
              typeof shoe.imageUrl === 'string' && 
              shoe.name !== '' && 
              shoe.imageUrl !== ''
            );
          
          setShoes(parsedShoes);
        } else {
          setError('No shoes found in the spreadsheet.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shoes:', err);
        setError('Failed to load shoes. Please try again later.');
        setLoading(false);
      }
    };

    fetchShoes();
  }, []);

  // Reset card position
  const resetCard = () => {
    // Cancel any ongoing animations
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    
    // Make sure the card is visible
    cardVisible.current = true;
    
    // Reset position and state
    pan.setValue({ x: 0, y: 0 });
    setIsDragging(false);
    setIsAnimating(false);
  };

  // Handle card swipe completion
  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const currentShoe = shoes[currentIndex];
    if (currentShoe) {
      if (direction === 'right') {
        addLikedShoe(currentShoe);
      } else {
        addDislikedShoe(currentShoe);
      }
    }
    
    // Hide the card before changing index
    cardVisible.current = false;
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
    
    // Reset position after a short delay to ensure smooth transition
    setTimeout(() => {
      resetCard();
    }, 50);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isAnimating && cardVisible.current,
    onMoveShouldSetPanResponder: () => !isAnimating && cardVisible.current,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (_, gesture) => {
      if (isAnimating || !cardVisible.current) return;
      pan.setValue({ x: gesture.dx, y: 0 });
    },
    onPanResponderRelease: (_, gesture) => {
      if (isAnimating || !cardVisible.current) return;
      
      setIsDragging(false);
      const swipeThreshold = width * 0.25;
      
      if (Math.abs(gesture.dx) > swipeThreshold) {
        setIsAnimating(true);
        const direction = gesture.dx > 0 ? 'right' : 'left';
        const toValue = gesture.dx > 0 ? width + 100 : -width - 100;
        
        // Store animation reference
        animationRef.current = Animated.timing(pan, {
          toValue: { x: toValue, y: 0 },
          duration: 250,
          useNativeDriver: true,
        });
        
        animationRef.current.start(({ finished }) => {
          if (finished) {
            handleSwipeComplete(direction);
          } else {
            resetCard();
          }
        });
      } else {
        // Return to center if not swiped far enough
        setIsAnimating(true);
        animationRef.current = Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
        });
        
        animationRef.current.start(({ finished }) => {
          setIsAnimating(false);
          if (!finished) {
            resetCard();
          }
        });
      }
    },
    onPanResponderTerminate: () => {
      resetCard();
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
        key={`shoe-${shoe.id}`}
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading shoes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            // Re-trigger the useEffect
            setShoes([]);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (shoes.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>No shoes found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentIndex < shoes.length && cardVisible.current ? (
        renderCard(shoes[currentIndex])
      ) : currentIndex >= shoes.length ? (
        <View style={[styles.card, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.name}>No more shoes!</Text>
        </View>
      ) : null}
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
  loadingContainer: {
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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