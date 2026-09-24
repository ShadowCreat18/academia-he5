const fs = require('fs');

const path = '/Users/chrix/Desktop/HE-5/resources/js/Pages/Parent/Finances.jsx';
let content = fs.readFileSync(path, 'utf8');

// We want to replace the child map logic starting from `const filteredTransactions`
// to the end of the `child` mapping.

const oldChildRender = `
                                const filteredTransactions = transactions.filter(tx => (tx.amount - tx.paid_amount) > 0);

                                return (
                                    <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
                                        <div>
                                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">Estado de Cuenta</h3>
                                                    <p className="text-slate-500 font-medium">{child.first_name} {child.last_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Pendiente</p>
                                                    <p className={\`text-2xl font-black \${child.total_debt > 0 ? 'text-[#E31837]' : 'text-green-600'}\`}>
                                                        $\${child.total_debt.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-0">
                                                {filteredTransactions.length > 0 ? (
                                                    <div className="divide-y divide-slate-100">
                                                        {filteredTransactions.map(tx => {
                                                            const debt = Math.max(0, tx.amount - tx.paid_amount);
                                                            const isSelected = selectedTransactions.some(item => item.id === tx.id);
                                                            
                                                            return (
                                                                <div key={tx.id} className={\`p-4 flex items-center gap-4 transition-colors hover:bg-slate-50 \${isSelected ? 'bg-red-50/50' : ''}\`}>
                                                                    <div className="flex-shrink-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleTransactionSelection(tx.id, debt)}
                                                                            className="w-5 h-5 text-[#E31837] rounded border-slate-300 focus:ring-[#E31837] text-slate-900"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <h4 className={\`font-bold text-sm \${isSelected ? 'text-[#E31837]' : 'text-slate-800'}\`}>
                                                                                {tx.concept}
                                                                            </h4>
                                                                            <div className="text-right">
                                                                                <p className="font-bold text-slate-800 text-sm">
                                                                                    \${tx.amount}
                                                                                </p>
                                                                                {userBalance > 0 && (
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            setSelectedWalletTx({ id: tx.id, debt, concept: tx.concept });
                                                                                            setWalletAmount('');
                                                                                            setWalletModalOpen(true);
                                                                                        }}
                                                                                        className="text-[10px] bg-green-100 hover:bg-green-200 text-green-800 px-2 py-0.5 mt-1 rounded font-semibold transition"
                                                                                    >
                                                                                        Abonar con saldo
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-slate-500">
                                                                                Vence: {new Date(tx.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                            </span>
                                                                            {tx.paid_amount > 0 && (
                                                                                <span className="text-orange-600 font-medium">Abonado: \${tx.paid_amount} (Resta: \${debt})</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 text-slate-500">
                                                        <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                                                        <p className="text-sm font-medium">¡Todo al corriente! No hay adeudos.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {child.total_debt > 0 && (
                                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                                <button
                                                    onClick={() => handlePayWithStripe({ type: 'player_total', player_id: child.id }, \`player_\${child.id}\`)}
                                                    disabled={loadingAction === \`player_\${child.id}\`}
                                                    className="text-[#E31837] hover:text-red-700 font-bold text-sm flex items-center gap-1.5 transition disabled:opacity-50 px-3 py-2 hover:bg-red-50 rounded-lg"
                                                >
                                                    {loadingAction === \`player_\${child.id}\` ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CreditCard className="w-4 h-4" />
                                                    )}
                                                    Liquidar todo el saldo de {child.first_name} (\${child.total_debt.toFixed(2)})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
`;

const newChildRender = `
                                const getConceptCategory = (conceptName) => {
                                    const lower = conceptName.toLowerCase();
                                    if (lower.includes('mensualidad')) return 'Mensualidades';
                                    if (lower.includes('inscripción') || lower.includes('inscripcion')) return 'Inscripciones';
                                    if (lower.includes('material')) return 'Material Deportivo';
                                    if (lower.includes('torneo')) return 'Torneos';
                                    if (lower.includes('uniforme')) return 'Uniformes';
                                    if (lower.includes('arbitraje')) return 'Arbitrajes';
                                    return 'Otros';
                                };
                                
                                const transactionsByCategory = {};
                                transactions.forEach(tx => {
                                    const cat = getConceptCategory(tx.concept);
                                    if (!transactionsByCategory[cat]) transactionsByCategory[cat] = [];
                                    transactionsByCategory[cat].push(tx);
                                });
                                const sortedCategories = Object.keys(transactionsByCategory).sort((a, b) => {
                                    if (a === 'Mensualidades') return -1;
                                    if (b === 'Mensualidades') return 1;
                                    return a.localeCompare(b);
                                });

                                return (
                                    <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
                                        <div>
                                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">Estado de Cuenta</h3>
                                                    <p className="text-slate-500 font-medium">{child.first_name} {child.last_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Pendiente</p>
                                                    <p className={\`text-2xl font-black \${child.total_debt > 0 ? 'text-[#E31837]' : 'text-green-600'}\`}>
                                                        $\${child.total_debt.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-0">
                                                {sortedCategories.length > 0 ? (
                                                    <div className="divide-y divide-slate-100">
                                                        {sortedCategories.map(cat => (
                                                            <div key={cat} className="mb-4">
                                                                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 text-sm">📂 {cat}</div>
                                                                <div className="divide-y divide-slate-100">
                                                                {transactionsByCategory[cat].map(tx => {
                                                                    const debt = Math.max(0, tx.amount - tx.paid_amount);
                                                                    const isSelected = selectedTransactions.some(item => item.id === tx.id);
                                                                    
                                                                    return (
                                                                        <div key={tx.id} className={\`p-4 flex items-center gap-4 transition-colors hover:bg-slate-50 \${isSelected ? 'bg-red-50/50' : ''}\`}>
                                                                            <div className="flex-shrink-0">
                                                                                {debt > 0 ? (
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSelected}
                                                                                        onChange={() => toggleTransactionSelection(tx.id, debt)}
                                                                                        className="w-5 h-5 text-[#E31837] rounded border-slate-300 focus:ring-[#E31837] text-slate-900"
                                                                                    />
                                                                                ) : (
                                                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                                )}
                                                                            </div>

                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between items-start mb-1">
                                                                                    <h4 className={\`font-bold text-sm \${isSelected ? 'text-[#E31837]' : (debt === 0 ? 'text-green-700' : 'text-slate-800')}\`}>
                                                                                        {tx.concept}
                                                                                    </h4>
                                                                                    <div className="text-right">
                                                                                        <p className={\`font-bold text-sm \${debt === 0 ? 'text-green-700' : 'text-slate-800'}\`}>
                                                                                            $\${tx.amount}
                                                                                        </p>
                                                                                        {(userBalance > 0 && debt > 0) && (
                                                                                            <button 
                                                                                                onClick={() => {
                                                                                                    setSelectedWalletTx({ id: tx.id, debt, concept: tx.concept });
                                                                                                    setWalletAmount('');
                                                                                                    setWalletModalOpen(true);
                                                                                                }}
                                                                                                className="text-[10px] bg-green-100 hover:bg-green-200 text-green-800 px-2 py-0.5 mt-1 rounded font-semibold transition"
                                                                                            >
                                                                                                Abonar con saldo
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-between items-center text-xs">
                                                                                    <span className="text-slate-500">
                                                                                        Vence: {new Date(tx.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                    </span>
                                                                                    <span className={\`font-medium \${debt === 0 ? 'text-green-600' : 'text-orange-600'}\`}>
                                                                                        Abonado: $\${tx.paid_amount} {debt > 0 ? \`(Resta: $\${debt})\` : '(Pagado)'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 text-slate-500">
                                                        <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                                                        <p className="text-sm font-medium">¡Todo al corriente! No hay adeudos.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {child.total_debt > 0 && (
                                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                                <button
                                                    onClick={() => handlePayWithStripe({ type: 'player_total', player_id: child.id }, \`player_\${child.id}\`)}
                                                    disabled={loadingAction === \`player_\${child.id}\`}
                                                    className="text-[#E31837] hover:text-red-700 font-bold text-sm flex items-center gap-1.5 transition disabled:opacity-50 px-3 py-2 hover:bg-red-50 rounded-lg"
                                                >
                                                    {loadingAction === \`player_\${child.id}\` ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CreditCard className="w-4 h-4" />
                                                    )}
                                                    Liquidar todo el saldo de {child.first_name} (\${child.total_debt.toFixed(2)})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
`;

content = content.replace(oldChildRender, newChildRender);
fs.writeFileSync(path, content);
console.log("Updated Parent/Finances.jsx view logic");
