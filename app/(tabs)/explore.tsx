import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, Linking } from 'react-native';
import { useShoeContext, ShoeCard } from '../context/ShoeContext';

const { width } = Dimensions.get('window');

const ExploreScreen = () => {
  const [activeTab, setActiveTab] = useState<'liked' | 'disliked' | null>(null);
  const { likedShoes, dislikedShoes } = useShoeContext();

  const renderShoeItem = ({ item }: { item: ShoeCard }) => (
    <TouchableOpacity 
      style={styles.shoeCard}
      onPress={() => Linking.openURL(item.productLink)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.shoeImage}
        resizeMode="contain"
      />
      <View style={styles.shoeInfo}>
        <Text style={styles.shoeName}>{item.name}</Text>
        <Text style={styles.shoePrice}>${item.price}</Text>
        <Text style={styles.shoeDetails}>Size: {item.size}</Text>
        <Text style={styles.shoeDetails}>Seller: {item.seller}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Shoes</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'liked' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('liked')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'liked' && styles.activeTabText
          ]}>
            Liked Shoes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'disliked' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('disliked')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'disliked' && styles.activeTabText
          ]}>
            Disliked Shoes
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'liked' && (
        <FlatList
          data={likedShoes}
          renderItem={renderShoeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No liked shoes yet. Start swiping right!</Text>
          }
        />
      )}
      
      {activeTab === 'disliked' && (
        <FlatList
          data={dislikedShoes}
          renderItem={renderShoeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No disliked shoes yet. Start swiping left!</Text>
          }
        />
      )}
      
      {activeTab === null && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Select "Liked Shoes" or "Disliked Shoes" to view your swipe history
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#2ecc71',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  shoeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  shoeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f9f9f9',
  },
  shoeInfo: {
    padding: 12,
  },
  shoeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shoePrice: {
    fontSize: 15,
    color: '#2ecc71',
    marginBottom: 4,
  },
  shoeDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ExploreScreen;
