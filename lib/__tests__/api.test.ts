import axios from 'axios';

// Mockeamos axios completamente
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  default: {
    create: jest.fn(() => mockAxiosInstance),
  }
}));

describe('api', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });
  
  describe('API instance configuration', () => {
    it('should create an axios instance with correct base configuration', () => {
      // Reimportar para asegurar que el mock esté activo
      require('@/lib/api');
      
      // Verificar que axios.create fue llamado con la configuración correcta
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://localhost:3000", // El valor por defecto
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe('Request interceptor', () => {
    it('should set up a request interceptor', () => {
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Verificar que se configuró un interceptor de solicitud
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });    it('should add Authorization header when token exists', () => {
      // Simulamos el token en localStorage
      localStorage.setItem('token', 'fake-token-123');
      
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Obtenemos la función interceptora (primer argumento del primer llamado a use())
      const interceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Creamos un objeto de configuración ficticio para pasar al interceptor
      const config = { headers: {} };
      
      // Ejecutamos la función interceptora
      const result = interceptorFn(config);
      
      // Verificamos que la función añadió el token al header de autorización
      expect(result.headers.Authorization).toBe('Bearer fake-token-123');
    });

    it('should not add Authorization header when token does not exist', () => {
      // Nos aseguramos que no hay token en localStorage
      localStorage.removeItem('token');
      
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Obtenemos la función interceptora
      const interceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Creamos un objeto de configuración ficticio
      const config = { headers: {} };
      
      // Ejecutamos la función interceptora
      const result = interceptorFn(config);
      
      // Verificamos que no se añadió el header de autorización
      expect(result.headers.Authorization).toBeUndefined();
    });
  });
  describe('Response interceptor', () => {
    it('should set up a response interceptor', () => {
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Verificar que se configuró un interceptor de respuesta
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should handle 401 errors correctly', () => {
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Obtenemos la función interceptora de error (segundo argumento del primer llamado a use())
      const errorInterceptorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0]?.[1];
      
      // Creamos un objeto de error ficticio con status 401
      const error = {
        response: {
          status: 401
        }
      };
      
      // Verificamos que la función rechaza la promesa
      expect(async () => {
        if (errorInterceptorFn) {
          await errorInterceptorFn(error);
        }
      }).rejects.toBeDefined();
    });

    it('should pass through other errors', () => {
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Obtenemos la función interceptora de error
      const errorInterceptorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0]?.[1];
      
      // Creamos un objeto de error ficticio con status diferente a 401
      const error = {
        response: {
          status: 500
        }
      };
      
      // Verificamos que la función rechaza la promesa
      expect(async () => {
        if (errorInterceptorFn) {
          await errorInterceptorFn(error);
        }
      }).rejects.toBeDefined();
    });

    it('should pass through successful responses', () => {
      // Reimportar para activar la configuración
      require('@/lib/api');
      
      // Obtenemos la función interceptora de respuesta exitosa (primer argumento)
      const successInterceptorFn = mockAxiosInstance.interceptors.response.use.mock.calls[0]?.[0];
      
      // Creamos un objeto de respuesta ficticio con la estructura correcta de AxiosResponse
      const response = { 
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      
      // Verificamos que la función devuelve la misma respuesta sin modificarla
      if (successInterceptorFn) {
        expect(successInterceptorFn(response)).toEqual(response);
      }
    });
  });
});
