"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const EXCHANGE_RATE_KEY = 'exchangeRate';

const ExchangeRateManager: React.FC = () => {
  const [rate, setRate] = useState<string>('');
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const storedRate = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (storedRate) {
      const numericRate = parseFloat(storedRate);
      if (!isNaN(numericRate)) {
        setCurrentRate(numericRate);
        setRate(numericRate.toString());
      }
    }
  }, []);
  const handleSaveRate = () => {
    const numericRate = parseFloat(rate);
    if (!isNaN(numericRate) && numericRate > 0) {
      localStorage.setItem(EXCHANGE_RATE_KEY, numericRate.toString());
      setCurrentRate(numericRate);
      setMessage('Tipo de cambio guardado exitosamente.');
      
      // Emitir evento personalizado para notificar a otras páginas
      window.dispatchEvent(new CustomEvent('exchangeRateChanged'));
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Por favor, ingrese un tipo de cambio válido.');
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Gestionar Tipo de Cambio (USD a BS)</CardTitle>
        <CardDescription>
          Establezca el tipo de cambio actual para la conversión de precios.
          {currentRate !== null && ` Tipo de cambio actual: ${currentRate.toFixed(2)} BS por USD.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="exchangeRate" className="text-sm font-medium">
            Nuevo Tipo de Cambio (Bs. por 1 USD)
          </label>
          <Input
            id="exchangeRate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Ej: 6.96"
            min="0.01"
            step="0.01"
          />
        </div>
        <Button onClick={handleSaveRate} className="w-full">
          Guardar Tipo de Cambio
        </Button>
        {message && <p className={`text-sm ${message.includes('exitosamente') ? 'text-green-600' : 'text-red-600'} mt-2`}>{message}</p>}
      </CardContent>
    </Card>
  );
};

export default ExchangeRateManager;
