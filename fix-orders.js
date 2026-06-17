
const fs = require('fs');
let content = fs.readFileSync('src/AppContext.tsx', 'utf8');

const oldFunc = \  const updateDeliveryStatus = (saleId: string, status: string, driver?: string) => {
    setState((prev) => ({
      ...prev,
      sales: prev.sales.map(sale =>
        sale.id === saleId
          ? {
              ...sale,
              deliveryStatus: status as any,
              deliveryDriver: driver || sale.deliveryDriver,
              status: status === 'Delivered' ? 'Completed' : 'Pending Delivery'
            }
          : sale
      )
    }));
  };\;

const newFunc = \  const updateDeliveryStatus = (saleId: string, status: string, driver?: string) => {
    setState((prev) => ({
      ...prev,
      sales: prev.sales.map(sale => {
        if (sale.id === saleId) {
          const updatedSale: any = { ...sale, status: status };
          if (driver !== undefined) updatedSale.deliveryDriver = driver;
          if (status === 'Delivered' || status === 'Pending' || status === 'In Transit' || status === 'Cancelled') {
            updatedSale.deliveryStatus = status;
          }
          if (status === 'Delivered') {
            updatedSale.status = 'Completed';
          }
          
          // Remove any undefined values
          Object.keys(updatedSale).forEach(key => {
            if (updatedSale[key] === undefined) delete updatedSale[key];
          });
          
          return updatedSale;
        }
        return sale;
      })
    }));
  };\;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/AppContext.tsx', content);
console.log('Fixed updateDeliveryStatus');
