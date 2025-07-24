import { ShoppingCart, Store, Package, Truck, Building2 } from "lucide-react";

interface MarketplaceIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const MarketplaceIcon = ({ name, size = 24, className = "" }: MarketplaceIconProps) => {
  const getIcon = () => {
    switch (name.toLowerCase()) {
      case 'mercadolivre':
        return (
          <div 
            className={`flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-lg ${className}`}
            style={{ width: size, height: size }}
          >
            <Store size={size * 0.6} />
          </div>
        );
      case 'amazon':
        return (
          <div 
            className={`flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg ${className}`}
            style={{ width: size, height: size }}
          >
            <Package size={size * 0.6} />
          </div>
        );
      case 'shopee':
        return (
          <div 
            className={`flex items-center justify-center bg-red-100 text-red-600 rounded-lg ${className}`}
            style={{ width: size, height: size }}
          >
            <ShoppingCart size={size * 0.6} />
          </div>
        );
      case 'magalu':
      case 'magazineluiza':
        return (
          <div 
            className={`flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg ${className}`}
            style={{ width: size, height: size }}
          >
            <Building2 size={size * 0.6} />
          </div>
        );
      case 'casasbahia':
        return (
          <div 
            className={`flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg ${className}`}
            style={{ width: size, height: size }}
          >
            <Truck size={size * 0.6} />
          </div>
        );
      default:
        return (
          <div 
            className={`flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg ${className}`}
            style={{ width: size, height: size }}
          >
            <ShoppingCart size={size * 0.6} />
          </div>
        );
    }
  };

  return getIcon();
};