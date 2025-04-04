import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
      const token = Cookies.get('token');

      if (!token && pathname !== '/login') {
        setIsRedirecting(true);
        router.replace('/login');
      } else if (token) {
        setIsLoading(false);
      }
    }, [pathname, router]); // Se agregan las dependencias necesarias

    if (isLoading && !isRedirecting) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-700">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#224f5a] border-solid mb-4"></div>
          <h2 className="text-xl font-semibold">Validating...</h2>
        </div>
      );
    }

    if (isRedirecting) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-700">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 border-solid mb-4"></div>
          <h2 className="text-xl font-semibold text-red-600">
            Unauthorized Access
          </h2>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  // Se asigna el displayName para facilitar la depuración
  ComponentWithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithAuth;
};

export default withAuth;
