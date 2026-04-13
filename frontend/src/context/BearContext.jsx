import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { DEFAULT_CONFIG, calculatePrice } from '../data/catalog';

const BearContext = createContext(null);

const initialState = {
  config: { ...DEFAULT_CONFIG },
  savedAudioFilename: null,
  savedBears: [],
  cart: [],
  activeTab: 'bear',
};

function bearReducer(state, action) {
  switch (action.type) {
    case 'SET_CONFIG':    return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_SAVED_AUDIO': return { ...state, savedAudioFilename: action.filename };
    case 'SET_SAVED_BEARS': return { ...state, savedBears: action.payload };
    case 'SET_CART':      return { ...state, cart: action.payload };
    case 'ADD_TO_CART':   return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART': return { ...state, cart: state.cart.filter(i => i.id !== action.payload) };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'LOAD_BEAR':     return { ...state, config: action.payload };
    case 'RESET':         return { ...initialState, savedBears: state.savedBears, cart: state.cart };
    default:              return state;
  }
}

export function BearProvider({ children }) {
  const [state, dispatch] = useReducer(bearReducer, initialState);

  const setConfig      = useCallback(u  => dispatch({ type: 'SET_CONFIG', payload: u }), []);
  const setSavedAudio  = useCallback(f  => dispatch({ type: 'SET_SAVED_AUDIO', filename: f }), []);
  const setSavedBears  = useCallback(b  => dispatch({ type: 'SET_SAVED_BEARS', payload: b }), []);
  const setCart        = useCallback(c  => dispatch({ type: 'SET_CART', payload: c }), []);
  const addToCart      = useCallback(i  => dispatch({ type: 'ADD_TO_CART', payload: i }), []);
  const removeFromCart = useCallback(id => dispatch({ type: 'REMOVE_FROM_CART', payload: id }), []);
  const setActiveTab   = useCallback(t  => dispatch({ type: 'SET_ACTIVE_TAB', payload: t }), []);
  const loadBear       = useCallback(c  => dispatch({ type: 'LOAD_BEAR', payload: c }), []);
  const reset          = useCallback(() => dispatch({ type: 'RESET' }), []);

  const totalPrice = calculatePrice(state.config);

  return (
    <BearContext.Provider value={{
      ...state, totalPrice,
      setConfig, setSavedAudio, setSavedBears,
      setCart, addToCart, removeFromCart,
      setActiveTab, loadBear, reset,
    }}>
      {children}
    </BearContext.Provider>
  );
}

export function useBear() {
  const ctx = useContext(BearContext);
  if (!ctx) throw new Error('useBear must be used within BearProvider');
  return ctx;
}
