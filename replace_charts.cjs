const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldSection = `      {/* Main Charts Area */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              نمودار فروش و مفاد
            </h3>
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => \`\${val/1000}k\`} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => name === 'مشتریان' ? [value, name] : [formatCurrency(value, 'AFN'), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="right" dataKey="مشتریان" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="left" type="monotone" dataKey="فروش" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line yAxisId="left" type="monotone" dataKey="مفاد" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              تفکیک فروش نقدی / قرضه
            </h3>
            
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-600">فروش نقدی</span>
                  <span className="font-black text-emerald-600">{formatCurrency(salesCashAFN, 'AFN')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: \`\${(salesCashAFN / (salesAFN || 1)) * 100}%\` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-600">فروش اعتباری (قرضه)</span>
                  <span className="font-black text-rose-500">{formatCurrency(salesCreditAFN, 'AFN')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: \`\${(salesCreditAFN / (salesAFN || 1)) * 100}%\` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (`;

const newSection = `      {/* Main Charts Area */}
      {hasData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                نمودار رشد فروشگاه (فروش و مفاد)
              </h3>
              <div className="h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => \`\${val/1000}k\`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number, name: string) => [formatCurrency(value, 'AFN'), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="رشد" name="رشد (مجموع فروش)" stroke="none" fillOpacity={1} fill="url(#colorGrowth)" />
                    <Line yAxisId="left" type="monotone" dataKey="فروش" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line yAxisId="left" type="monotone" dataKey="مفاد" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                سهم دسته‌بندی‌ها از فروش
              </h3>
              <div className="flex-1 min-h-[250px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, 'AFN')} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  روند روزمره مشتریان
                </h3>
                <div className="flex gap-4 text-[10px] sm:text-xs font-bold text-slate-500">
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">شلوغ‌ترین: {maxCustomers.date} ({maxCustomers.value})</span>
                  <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg">خلوت‌ترین: {minCustomers.date} ({minCustomers.value})</span>
                </div>
              </div>
              <div className="h-64 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [value, 'تعداد مشتریان']}
                    />
                    <Bar dataKey="مشتریان" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.date === maxCustomers.date ? '#10b981' : entry.date === minCustomers.date ? '#f43f5e' : '#fcd34d'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                تفکیک فروش نقدی / قرضه
              </h3>
              <div className="flex-1 flex flex-col justify-center gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">فروش نقدی</span>
                    <span className="font-black text-emerald-600">{formatCurrency(salesCashAFN, 'AFN')}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: \`\${(salesCashAFN / (salesAFN || 1)) * 100}%\` }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">فروش اعتباری (قرضه)</span>
                    <span className="font-black text-rose-500">{formatCurrency(salesCreditAFN, 'AFN')}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: \`\${(salesCreditAFN / (salesAFN || 1)) * 100}%\` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (`;

content = content.replace(oldSection, newSection);
fs.writeFileSync('src/components/Dashboard.tsx', content);
