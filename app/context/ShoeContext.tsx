import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the ShoeCard interface directly in this file to avoid import issues
export interface ShoeCard {
  id: string;
  name: string;
  price: number;
  size: string;
  seller: string;
  imageUrl: string;
  productLink: string;
}

interface ShoeContextType {
  likedShoes: ShoeCard[];
  dislikedShoes: ShoeCard[];
  addLikedShoe: (shoe: ShoeCard) => void;
  addDislikedShoe: (shoe: ShoeCard) => void;
}

const ShoeContext = createContext<ShoeContextType | undefined>(undefined);

export const ShoeProvider = ({ children }: { children: ReactNode }) => {
  const [likedShoes, setLikedShoes] = useState<ShoeCard[]>([]);
  const [dislikedShoes, setDislikedShoes] = useState<ShoeCard[]>([]);

  const addLikedShoe = (shoe: ShoeCard) => {
    setLikedShoes(prev => {
      // Check if shoe already exists to avoid duplicates
      if (prev.some(s => s.id === shoe.id)) return prev;
      return [...prev, shoe];
    });
  };

  const addDislikedShoe = (shoe: ShoeCard) => {
    setDislikedShoes(prev => {
      // Check if shoe already exists to avoid duplicates
      if (prev.some(s => s.id === shoe.id)) return prev;
      return [...prev, shoe];
    });
  };

  return (
    <ShoeContext.Provider value={{ likedShoes, dislikedShoes, addLikedShoe, addDislikedShoe }}>
      {children}
    </ShoeContext.Provider>
  );
};

export const useShoeContext = () => {
  const context = useContext(ShoeContext);
  if (context === undefined) {
    throw new Error('useShoeContext must be used within a ShoeProvider');
  }
  return context;
}; 