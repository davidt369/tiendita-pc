import { apiService, type Product, type User, type Order, type SavedBuild } from '@/lib/api-service';
import { mockData } from '@/lib/mock-data';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  // Clear localStorage and initialize with mock data before each test
  localStorageMock.clear();
  apiService.init(); // This will populate localStorage with initial mock data
});

describe('apiService', () => {
  describe('Products', () => {
    it('should get all products', async () => {
      const products = await apiService.getProducts();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
      // Check if the products have the expected structure based on mockData
      const mockProductCount = Object.values(mockData).reduce((acc, category) => acc + category.length, 0);
      expect(products.length).toBe(mockProductCount);
    });

    it('should get a product by ID and type', async () => {
      const products = await apiService.getProducts();
      const firstProduct = products[0];
      const fetchedProduct = await apiService.getProductById(firstProduct.tipo, firstProduct.id);
      expect(fetchedProduct).toEqual(firstProduct);
    });

    it('should return null for a non-existent product ID', async () => {
      const fetchedProduct = await apiService.getProductById('cpu', 99999);
      expect(fetchedProduct).toBeNull();
    });

    it('should create a new product', async () => {
      const newProductData: Omit<Product, 'id'> = {
        nombre: 'Test CPU',
        precio: 250,
        tipo: 'cpu',
        marca: 'TestBrand',
        stock: 10,
        descripcion: 'A test CPU.',
        especificaciones: { core: 8 },
        valoracion: 4.5,
        opiniones: 100,
      };
      const createdProduct = await apiService.createProduct(newProductData);
      expect(createdProduct).toHaveProperty('id');
      expect(createdProduct.nombre).toBe('Test CPU');
      const products = await apiService.getProducts();
      expect(products.find(p => p.id === createdProduct.id && p.tipo === 'cpu')).toBeDefined();
    });

    it('should update an existing product', async () => {
      const products = await apiService.getProducts();
      const productToUpdate = { ...products[0], nombre: 'Updated Name', precio: products[0].precio + 50 };
      const updatedProduct = await apiService.updateProduct(productToUpdate);
      expect(updatedProduct.nombre).toBe('Updated Name');
      expect(updatedProduct.precio).toBe(products[0].precio + 50);
      const fetchedProduct = await apiService.getProductById(productToUpdate.tipo, productToUpdate.id);
      expect(fetchedProduct?.nombre).toBe('Updated Name');
    });

    it('should delete a product', async () => {
      const productsBeforeDelete = await apiService.getProducts();
      const productToDelete = productsBeforeDelete[0];
      const result = await apiService.deleteProduct(productToDelete.tipo, productToDelete.id);
      expect(result).toBe(true);
      const productsAfterDelete = await apiService.getProducts();
      expect(productsAfterDelete.find(p => p.id === productToDelete.id && p.tipo === productToDelete.tipo)).toBeUndefined();
      expect(productsAfterDelete.length).toBe(productsBeforeDelete.length - 1);
    });
  });

  describe('Users', () => {
    it('should get all users', async () => {
      const users = await apiService.getUsers();
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);
      // Based on generateMockData, there are 5 initial users
      expect(users.length).toBe(5);
    });

    it('should get a user by ID', async () => {
      const users = await apiService.getUsers();
      const firstUser = users[0];
      const fetchedUser = await apiService.getUserById(firstUser.id);
      expect(fetchedUser).toEqual(firstUser);
    });

    it('should return null for a non-existent user ID', async () => {
      const fetchedUser = await apiService.getUserById('non-existent-id');
      expect(fetchedUser).toBeNull();
    });

    it('should update an existing user', async () => {
      const users = await apiService.getUsers();
      const userToUpdate = { ...users[0], name: 'Updated User Name' };
      const updatedUser = await apiService.updateUser(userToUpdate);
      expect(updatedUser.name).toBe('Updated User Name');
      const fetchedUser = await apiService.getUserById(userToUpdate.id);
      expect(fetchedUser?.name).toBe('Updated User Name');
    });

    it('should delete a user', async () => {
      const usersBeforeDelete = await apiService.getUsers();
      const userToDelete = usersBeforeDelete[0];
      const result = await apiService.deleteUser(userToDelete.id);
      expect(result).toBe(true);
      const usersAfterDelete = await apiService.getUsers();
      expect(usersAfterDelete.find(u => u.id === userToDelete.id)).toBeUndefined();
      expect(usersAfterDelete.length).toBe(usersBeforeDelete.length - 1);
    });
  });

  describe('Orders', () => {
    it('should get all orders', async () => {
      const orders = await apiService.getOrders();
      expect(orders).toBeInstanceOf(Array);
      expect(orders.length).toBeGreaterThan(0);
      // Based on generateMockData, there are 5 initial orders
      expect(orders.length).toBe(5);
    });

    it('should get an order by ID', async () => {
      const orders = await apiService.getOrders();
      const firstOrder = orders[0];
      const fetchedOrder = await apiService.getOrderById(firstOrder.id);
      expect(fetchedOrder).toEqual(firstOrder);
    });

    it('should get orders by user ID', async () => {
      const orders = await apiService.getOrders();
      const targetUserId = orders[0].userId;
      const userOrders = await apiService.getOrdersByUserId(targetUserId);
      expect(userOrders).toBeInstanceOf(Array);
      userOrders.forEach(order => {
        expect(order.userId).toBe(targetUserId);
      });
      const allOrdersForUser = orders.filter(o => o.userId === targetUserId);
      expect(userOrders.length).toBe(allOrdersForUser.length);
    });

    it('should create a new order', async () => {
      const newOrderData: Omit<Order, 'id'> = {
        userId: '2',
        userName: 'Test User',
        userEmail: 'user@example.com',
        date: new Date().toISOString(),
        status: 'processing',
        total: 199.99,
        items: [{
          id: 'prod1',
          type: 'cpu',
          name: 'Test CPU Order',
          price: 199.99,
          quantity: 1,
        }],
        shippingDetails: {
          name: 'Test User',
          email: 'user@example.com',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Testland',
        },
      };
      const createdOrder = await apiService.createOrder(newOrderData);
      expect(createdOrder).toHaveProperty('id');
      expect(createdOrder.id.startsWith('ORD-')).toBe(true);
      expect(createdOrder.total).toBe(199.99);
      const orders = await apiService.getOrders();
      expect(orders.find(o => o.id === createdOrder.id)).toBeDefined();
    });

    it('should update an existing order', async () => {
      const orders = await apiService.getOrders();
      const orderToUpdate = { ...orders[0], status: 'shipped' as const };
      const updatedOrder = await apiService.updateOrder(orderToUpdate);
      expect(updatedOrder.status).toBe('shipped');
      const fetchedOrder = await apiService.getOrderById(orderToUpdate.id);
      expect(fetchedOrder?.status).toBe('shipped');
    });

    it('should delete an order', async () => {
      const ordersBeforeDelete = await apiService.getOrders();
      const orderToDelete = ordersBeforeDelete[0];
      const result = await apiService.deleteOrder(orderToDelete.id);
      expect(result).toBe(true);
      const ordersAfterDelete = await apiService.getOrders();
      expect(ordersAfterDelete.find(o => o.id === orderToDelete.id)).toBeUndefined();
      expect(ordersAfterDelete.length).toBe(ordersBeforeDelete.length - 1);
    });
  });

  describe('Saved Builds', () => {
    it('should get all saved builds (initially empty)', async () => {
      const savedBuilds = await apiService.getSavedBuilds();
      expect(savedBuilds).toBeInstanceOf(Array);
      expect(savedBuilds.length).toBe(0); // Initially empty as per initializeLocalStorage
    });

    it('should save a new build', async () => {
      const newBuildData: Omit<SavedBuild, 'id' | 'date'> = {
        name: 'My Awesome Build',
        userId: '2',
        components: {
          cpu: { id: 1, nombre: 'Test CPU', precio: 100, tipo: 'cpu' } as Product,
        },
        totalPrice: 100,
      };
      const savedBuild = await apiService.saveBuild(newBuildData);
      expect(savedBuild).toHaveProperty('id');
      expect(savedBuild).toHaveProperty('date');
      expect(savedBuild.name).toBe('My Awesome Build');
      const builds = await apiService.getSavedBuilds();
      expect(builds.length).toBe(1);
      expect(builds[0].id).toBe(savedBuild.id);
    });

    it('should update a saved build', async () => {
      const newBuildData: Omit<SavedBuild, 'id' | 'date'> = {
        name: 'My First Build',
        userId: '2',
        components: { cpu: { id: 1, nombre: 'Test CPU', precio: 100, tipo: 'cpu' } as Product },
        totalPrice: 100,
      };
      const buildToUpdate = await apiService.saveBuild(newBuildData);
      const updatedBuildData = { ...buildToUpdate, name: 'My Updated Awesome Build' };
      const updatedBuild = await apiService.updateSavedBuild(updatedBuildData);
      expect(updatedBuild.name).toBe('My Updated Awesome Build');
      const builds = await apiService.getSavedBuilds();
      expect(builds[0].name).toBe('My Updated Awesome Build');
    });

    it('should delete a saved build', async () => {
      const newBuildData: Omit<SavedBuild, 'id' | 'date'> = {
        name: 'Build to Delete',
        userId: '2',
        components: { cpu: { id: 1, nombre: 'Test CPU', precio: 100, tipo: 'cpu' } as Product },
        totalPrice: 100,
      };
      const buildToDelete = await apiService.saveBuild(newBuildData);
      const buildsBeforeDelete = await apiService.getSavedBuilds();
      expect(buildsBeforeDelete.length).toBe(1);

      const result = await apiService.deleteSavedBuild(buildToDelete.id);
      expect(result).toBe(true);

      const buildsAfterDelete = await apiService.getSavedBuilds();
      expect(buildsAfterDelete.length).toBe(0);
    });
  });

  describe('Dashboard Stats', () => {
    it('should get dashboard stats', async () => {
      // Add some orders to have data for stats
      await apiService.createOrder({
        userId: '2', userName: 'Test User', userEmail: 'user@example.com', date: new Date().toISOString(), status: 'delivered', total: 150,
        items: [], shippingDetails: {} as any
      });
      await apiService.createOrder({
        userId: '3', userName: 'Another User', userEmail: 'another@example.com', date: new Date().toISOString(), status: 'processing', total: 250,
        items: [], shippingDetails: {} as any
      });

      const stats = await apiService.getDashboardStats();
      expect(stats).toHaveProperty('totalSales');
      expect(stats).toHaveProperty('totalOrders');
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('averageOrderValue');
      expect(stats).toHaveProperty('salesByMonth');
      expect(stats).toHaveProperty('ordersByStatus');
      expect(stats).toHaveProperty('topProducts');

      // Initial orders (5) + 2 created in this test
      const orders = await apiService.getOrders();
      const users = await apiService.getUsers();
      const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

      expect(stats.totalOrders).toBe(orders.length);
      expect(stats.totalUsers).toBe(users.length);
      expect(stats.totalSales).toBeCloseTo(totalSales);
      if (stats.totalOrders > 0) {
        expect(stats.averageOrderValue).toBeCloseTo(totalSales / stats.totalOrders);
      }
      expect(stats.salesByMonth.length).toBe(12); // 12 months
      expect(stats.ordersByStatus.processing).toBe(orders.filter(o => o.status === 'processing').length);
      expect(stats.ordersByStatus.delivered).toBe(orders.filter(o => o.status === 'delivered').length);
      // topProducts are hardcoded in the mock for now
      expect(stats.topProducts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Initialization', () => {
    it('should initialize localStorage with products if empty', async () => {
      localStorageMock.clear(); // Clear it completely
      expect(localStorageMock.getItem('products')).toBeNull();
      await apiService.getProducts(); // Should trigger initialization
      const productsRaw = localStorageMock.getItem('products');
      expect(productsRaw).not.toBeNull();
      const products = JSON.parse(productsRaw!);
      const mockProductCount = Object.values(mockData).reduce((acc, category) => acc + category.length, 0);
      expect(products.length).toBe(mockProductCount);
    });

    it('should initialize localStorage with users if empty during init', () => {
      localStorageMock.clear();
      expect(localStorageMock.getItem('users')).toBeNull();
      apiService.init();
      expect(localStorageMock.getItem('users')).not.toBeNull();
      const users = JSON.parse(localStorageMock.getItem('users')!);
      expect(users.length).toBe(5); // As per generateMockData
    });

    it('should initialize localStorage with orders if empty during init', () => {
      localStorageMock.clear();
      expect(localStorageMock.getItem('orders')).toBeNull();
      apiService.init();
      expect(localStorageMock.getItem('orders')).not.toBeNull();
      const orders = JSON.parse(localStorageMock.getItem('orders')!);
      expect(orders.length).toBe(5); // As per generateMockData
    });

    it('should initialize localStorage with empty savedBuilds if empty during init', () => {
      localStorageMock.clear();
      expect(localStorageMock.getItem('savedBuilds')).toBeNull();
      apiService.init();
      expect(localStorageMock.getItem('savedBuilds')).not.toBeNull();
      const savedBuilds = JSON.parse(localStorageMock.getItem('savedBuilds')!);
      expect(savedBuilds.length).toBe(0);
    });
  });
});
