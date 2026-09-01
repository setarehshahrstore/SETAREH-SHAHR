const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldChartData = `  const chartData = useMemo(() => {
    const dataMap: Record<string, { date: string, فروش: number, مفاد: number, مشتریان: number }> = {};
    filteredSales.forEach(s => {
      const d = s.date.split('T')[0];
      if (!dataMap[d]) dataMap[d] = { date: d, فروش: 0, مفاد: 0, مشتریان: 0 };
      
      const sCostUSD = (s.items || []).reduce((sum, item) => {
        const prod = state.products.find(p => p.id === item.productId);
        return sum + ((item.quantity * item.multiplier) * (prod?.costPriceUSD || 0));
      }, 0);
      dataMap[d].فروش += s.finalAFN;
      dataMap[d].مفاد += (s.finalAFN - (sCostUSD * state.exchangeRate));
      dataMap[d].مشتریان += 1;
    });
    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, state.products, state.exchangeRate]);`;

const newChartData = `  // Category Sales Data
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredSales.forEach(s => {
      (s.items || []).forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        const catName = prod ? prod.category : 'سایر';
        if (!catMap[catName]) catMap[catName] = 0;
        catMap[catName] += item.totalAFN;
      });
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
  }, [filteredSales, state.products]);

  const { chartData, maxCustomers, minCustomers } = useMemo(() => {
    const dataMap: Record<string, { date: string, فروش: number, مفاد: number, مشتریان: number, رشد: number }> = {};
    filteredSales.forEach(s => {
      const d = s.date.split('T')[0];
      if (!dataMap[d]) dataMap[d] = { date: d, فروش: 0, مفاد: 0, مشتریان: 0, رشد: 0 };
      
      const sCostUSD = (s.items || []).reduce((sum, item) => {
        const prod = state.products.find(p => p.id === item.productId);
        return sum + ((item.quantity * item.multiplier) * (prod?.costPriceUSD || 0));
      }, 0);
      dataMap[d].فروش += s.finalAFN;
      dataMap[d].مفاد += (s.finalAFN - (sCostUSD * state.exchangeRate));
      dataMap[d].مشتریان += 1;
    });

    const sortedData = Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
    
    let cumulativeSales = 0;
    let maxC = { date: '', value: -1 };
    let minC = { date: '', value: Infinity };

    sortedData.forEach(d => {
      cumulativeSales += d.فروش;
      d.رشد = cumulativeSales;

      if (d.مشتریان > maxC.value) maxC = { date: d.date, value: d.مشتریان };
      if (d.مشتریان < minC.value) minC = { date: d.date, value: d.مشتریان };
    });

    return { chartData: sortedData, maxCustomers: maxC, minCustomers: minC };
  }, [filteredSales, state.products, state.exchangeRate]);`;

content = content.replace(oldChartData, newChartData);
fs.writeFileSync('src/components/Dashboard.tsx', content);
