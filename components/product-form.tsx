'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function ProductForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: '',
    name: '',
    price: 0,
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const saveToLocalStorage = (updatedProducts: Product[]) => {
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      const updatedProducts = products.map(product => 
        product.id === currentProduct.id ? currentProduct : product
      );
      saveToLocalStorage(updatedProducts);
    } else {
      const newProduct = {
        ...currentProduct,
        id: Date.now().toString()
      };
      saveToLocalStorage([...products, newProduct]);
    }

    setCurrentProduct({ id: '', name: '', price: 0, description: '' });
    setIsEditing(false);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    saveToLocalStorage(updatedProducts);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Nombre del producto"
            value={currentProduct.name}
            onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Precio"
            value={currentProduct.price}
            onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
            required
          />
          <Input
            type="text"
            placeholder="Descripción"
            value={currentProduct.description}
            onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
            required
          />
          <Button type="submit">
            {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-green-600">Precio: ${product.price}</p>
            <p className="text-gray-600">{product.description}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleEdit(product)} variant="outline">
                Editar
              </Button>
              <Button onClick={() => handleDelete(product.id)} variant="destructive">
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
