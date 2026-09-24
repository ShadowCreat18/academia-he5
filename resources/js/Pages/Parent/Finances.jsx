import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { DollarSign, Wallet, AlertCircle, CreditCard, CheckCircle2, ArrowRight, Loader2, PlusCircle, X, History, Receipt } from 'lucide-react';
import ParentLayout from '@/Layouts/ParentLayout';

const getConceptCategory = (conceptName) => {
    const lower = (conceptName || '').toLowerCase();
    if (lower.includes('mensualidad')) return 'Mensualidades';
    if (lower.includes('inscripción anual') || lower.includes('inscripcion anual')) return 'Inscripción Anual';
    if ((lower.includes('inscripción') || lower.includes('inscripcion')) && lower.includes('torneo')) return 'Torneos';
    if (lower.includes('inscripción') || lower.includes('inscripcion')) return 'Inscripciones';
    if (lower.includes('material')) return 'Material Deportivo';
    if (lower.includes('torneo')) return 'Torneos';
    if (lower.includes('uniforme')) return 'Uniformes';
    if (lower.includes('arbitraje')) return 'Arbitrajes';
    return conceptName;
};

const ChildFinancesCard = ({ 
    child, 
    userBalance, 
    selectedTransactions, 
    toggleTransactionSelection, 
    setWalletModalOpen, 
    setSelectedWalletTx, 
    setWalletAmount, 
    handlePayWithStripe, 
    loadingAction 
}) => {
    const transactions = child.financial_transactions || child.financialTransactions || [];
    
    // Agrupar por año y luego por categoría
    const transactionsByYear = {};
    transactions.forEach(tx => {
        const year = tx.due_date ? tx.due_date.substring(0, 4) : String(new Date().getFullYear());
        const cat = getConceptCategory(tx.concept);
        
        if (!transactionsByYear[year]) {
            transactionsByYear[year] = {};
        }
        if (!transactionsByYear[year][cat]) {
            transactionsByYear[year][cat] = [];
        }
        transactionsByYear[year][cat].push(tx);
    });
    
    const sortedYears = Object.keys(transactionsByYear).sort((a, b) => b.localeCompare(a));
    const [activeYear, setActiveYear] = useState(sortedYears.length > 0 ? sortedYears[0] : null);
    const [activeConcept, setActiveConcept] = useState('Todas');

    const getSortedCategoriesForYear = (year) => {
        if (!transactionsByYear[year]) return [];
        return Object.keys(transactionsByYear[year]).sort((a, b) => {
            if (a === 'Mensualidades') return -1;
            if (b === 'Mensualidades') return 1;
            return a.localeCompare(b);
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div>
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Estado de Cuenta</h3>
                        <p className="text-slate-500 font-medium">{child.first_name} {child.last_name}</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Pendiente</p>
                        <p className={`text-2xl font-black ${child.total_debt > 0 ? 'text-[#E31837]' : 'text-green-600'}`}>
                            ${child.total_debt.toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Pestañas de Años y Conceptos */}
                    {sortedYears.length > 0 && (
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                <span className="py-2 text-sm font-bold text-slate-400 mr-2 whitespace-nowrap">Año:</span>
                                {sortedYears.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => {
                                            setActiveYear(year);
                                            setActiveConcept('Todas');
                                        }}
                                        className={`px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
                                            activeYear === year 
                                            ? 'bg-[#E31837] text-white shadow-md' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                            
                            {activeYear && transactionsByYear[activeYear] && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <span className="py-2 text-sm font-bold text-slate-400 mr-2 whitespace-nowrap">Filtro:</span>
                                    <button
                                        onClick={() => setActiveConcept('Todas')}
                                        className={`px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
                                            activeConcept === 'Todas' 
                                            ? 'bg-[#0033A0] text-white shadow-md' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Todas
                                    </button>
                                    {getSortedCategoriesForYear(activeYear).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveConcept(cat)}
                                            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
                                                activeConcept === cat 
                                                ? 'bg-[#0033A0] text-white shadow-md' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tablas del Año Seleccionado */}
                    {transactions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                            <p className="text-sm font-medium">¡Todo al corriente! No hay adeudos.</p>
                        </div>
                    ) : (
                        activeYear && transactionsByYear[activeYear] && (
                            <div className="space-y-6">
                                {getSortedCategoriesForYear(activeYear)
                                    .filter(cat => activeConcept === 'Todas' || activeConcept === cat)
                                    .map(cat => {
                                    const catTxs = transactionsByYear[activeYear][cat];
                                    
                                    return (
                                        <div key={cat} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                                <h4 className="font-bold text-slate-700">📂 {cat}</h4>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {catTxs.map(tx => {
                                                    const debt = Math.max(0, tx.amount - tx.paid_amount);
                                                    const isSelected = selectedTransactions.some(item => item.id === tx.id);
                                                    
                                                    return (
                                                        <div key={tx.id} className={`p-4 flex items-center gap-4 transition-colors hover:bg-slate-50 ${isSelected ? 'bg-red-50/50' : ''}`}>
                                                            {debt > 0 && (
                                                                <div className="flex-shrink-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleTransactionSelection(tx.id, debt)}
                                                                        className="w-5 h-5 text-[#E31837] rounded border-slate-300 focus:ring-[#E31837] text-slate-900"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h4 className={`font-bold text-sm ${isSelected ? 'text-[#E31837]' : 'text-slate-800'}`}>
                                                                        {tx.concept}
                                                                        {debt === 0 && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Pagado</span>}
                                                                    </h4>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-slate-800 text-sm">
                                                                            ${tx.amount}
                                                                        </p>
                                                                        {debt > 0 && userBalance > 0 && (
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
                                                                        Fecha: {new Date(tx.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                    {tx.paid_amount > 0 && debt > 0 && (
                                                                        <span className="text-orange-600 font-medium">Abonado: ${tx.paid_amount} (Resta: ${debt})</span>
                                                                    )}
                                                                    {tx.paid_amount > 0 && debt === 0 && (
                                                                        <span className="text-green-600 font-medium">Pagado: ${tx.paid_amount}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>

            {child.total_debt > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={() => handlePayWithStripe({ type: 'player_total', player_id: child.id }, `player_${child.id}`)}
                        disabled={loadingAction === `player_${child.id}`}
                        className="text-[#E31837] hover:text-red-700 font-bold text-sm flex items-center gap-1.5 transition disabled:opacity-50 px-3 py-2 hover:bg-red-50 rounded-lg"
                    >
                        {loadingAction === `player_${child.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CreditCard className="w-4 h-4" />
                        )}
                        Liquidar todo el saldo de {child.first_name} (${child.total_debt.toFixed(2)})
                    </button>
                </div>
            )}
        </div>
    );
};

export default function Finances({ auth, children = [], userPayments = [] }) {
    const [loadingAction, setLoadingAction] = useState(null);
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
    const [topupAmount, setTopupAmount] = useState('');
    const [topupError, setTopupError] = useState('');
    const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' o 'historial'
    const [selectedTransactions, setSelectedTransactions] = useState([]);

    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const [selectedWalletTx, setSelectedWalletTx] = useState(null);
    const [walletAmount, setWalletAmount] = useState('');

    const userBalance = parseFloat(auth.user.saldo_disponible || 0);

    const handlePayWithStripe = async (payload, actionKey) => {
        setLoadingAction(actionKey);
        try {
            
            const response = await axios.post(route('parent.stripe.checkout'), payload);
                
                
                    
                    
                    
                
                
            

            const data = response.data;

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || data.message || 'No se pudo iniciar el proceso de pago. Intenta de nuevo.');
                setLoadingAction(null);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ocurrió un error al conectar con la pasarela de pago.');
            setLoadingAction(null);
        }
    };



    const handleTopupSubmit = (e) => {
        e.preventDefault();
        const num = parseFloat(topupAmount);
        if (isNaN(num) || num <= 0) {
            setTopupError('Por favor ingresa un monto válido mayor a $0');
            return;
        }

        setTopupError('');
        setIsTopupModalOpen(false);
        handlePayWithStripe({ type: 'wallet_topup', amount: num }, 'wallet_topup');
    };

    const toggleTransactionSelection = (txId, debt) => {
        setSelectedTransactions(prev => {
            const exists = prev.find(item => item.id === txId);
            if (exists) {
                return prev.filter(item => item.id !== txId);
            } else {
                return [...prev, { id: txId, debt }];
            }
        });
    };

    const selectedTotal = selectedTransactions.reduce((sum, item) => sum + item.debt, 0);

    const handlePayMultipleStripe = () => {
        if (selectedTransactions.length === 0) return;
        const ids = selectedTransactions.map(item => item.id);
        handlePayWithStripe({ type: 'multiple_charges', transaction_ids: ids }, 'multiple_charges');
    };

    return (
        <ParentLayout title="Finanzas">
            <div className="space-y-6 pb-24">

                {/* Modal de Recarga de Monedero */}
                {isTopupModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTopupModalOpen(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-green-600" />
                                        <h3 className="text-lg font-bold text-slate-800">Recargar Monedero Digital</h3>
                                    </div>
                                    <button onClick={() => setIsTopupModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleTopupSubmit} className="p-6 space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Ingresa el monto en pesos (MXN) que deseas abonar a tu cuenta usando tarjeta de crédito o débito a través de Stripe.
                                    </p>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monto a Recargar</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-slate-500 font-bold">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="1"
                                                min="10"
                                                placeholder="500"
                                                value={topupAmount}
                                                onChange={e => setTopupAmount(e.target.value)}
                                                className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold text-slate-900"
                                                autoFocus
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-xs font-semibold text-slate-400">MXN</span>
                                            </div>
                                        </div>
                                        {topupError && <p className="text-xs text-red-600 mt-1">{topupError}</p>}
                                    </div>

                                    {/* Botones de montos rápidos */}
                                    <div className="grid grid-cols-3 gap-2 pt-1">
                                        {[250, 500, 1000].map(monto => (
                                            <button
                                                type="button"
                                                key={monto}
                                                onClick={() => setTopupAmount(monto.toString())}
                                                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                                            >
                                                +${monto}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-3 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsTopupModalOpen(false)}
                                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Continuar al Pago
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Abono con Monedero */}
                {walletModalOpen && selectedWalletTx && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setWalletModalOpen(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800">Abonar con Monedero</h3>
                                    <button onClick={() => setWalletModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const amount = parseFloat(walletAmount);
                                    if(amount > 0 && amount <= selectedWalletTx.debt && amount <= userBalance) {
                                        router.post(route('parent.wallet.pay'), {
                                            transaction_id: selectedWalletTx.id,
                                            amount: amount
                                        }, { preserveScroll: true, onSuccess: () => setWalletModalOpen(false) });
                                    }
                                }} className="p-6 space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Concepto: <strong>{selectedWalletTx.concept}</strong><br/>
                                        Deuda Pendiente: <strong>${selectedWalletTx.debt.toFixed(2)}</strong><br/>
                                        Tu Saldo Disponible: <strong className="text-green-600">${userBalance.toFixed(2)}</strong>
                                    </p>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monto a Abonar</label>
                                        <div className="relative rounded-xl shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-slate-500 font-bold">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="1"
                                                max={Math.min(selectedWalletTx.debt, userBalance)}
                                                value={walletAmount}
                                                onChange={e => setWalletAmount(e.target.value)}
                                                placeholder={`Max: $${Math.min(selectedWalletTx.debt, userBalance).toFixed(2)}`}
                                                className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold text-slate-900"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-xs font-semibold text-slate-400">MXN</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-3">
                                        <button type="button" onClick={() => setWalletModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                                        <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow">Aplicar Abono</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensajes Flash */}
                {/* ... */}

                {/* Monedero Global */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-green-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-green-900 flex items-center">
                            <Wallet className="mr-2.5 text-green-600" />
                            Monedero Digital HE-5
                        </h2>
                        <p className="text-green-700 text-sm max-w-xl">
                            Puedes usar este saldo a favor para liquidar adeudos de tus hijos al instante. Ten en cuenta que los pagos y recargas con tarjeta generan una comisión por servicio.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-6 py-3.5 rounded-2xl border border-green-100 shadow-sm text-center">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Saldo Disponible</p>
                            <p className="text-2xl sm:text-3xl font-black text-green-600">${userBalance.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => setIsTopupModalOpen(true)}
                            disabled={loadingAction === 'wallet_topup'}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3.5 rounded-2xl shadow transition flex items-center gap-1.5 text-sm whitespace-nowrap disabled:opacity-50"
                        >
                            {loadingAction === 'wallet_topup' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <PlusCircle className="w-4 h-4" />
                            )}
                            Recargar
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('pendientes')}
                        className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'pendientes'
                                ? 'border-[#E31837] text-[#E31837]'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Adeudos Pendientes
                    </button>
                    <button
                        onClick={() => setActiveTab('historial')}
                        className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'historial'
                                ? 'border-green-600 text-green-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        Historial de Pagos
                    </button>
                </div>

                {/* Contenido de Tabs */}
                {activeTab === 'historial' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Historial de Pagos y Recargas</h3>
                                <p className="text-slate-500 font-medium">Todos tus movimientos financieros</p>
                            </div>
                        </div>
                        <div className="p-0">
                            {userPayments && userPayments.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {userPayments.map(payment => {
                                        const isTopup = !payment.financial_transaction_id;
                                        const player = !isTopup && payment.financial_transaction?.player 
                                            ? `${payment.financial_transaction.player.first_name} ${payment.financial_transaction.player.last_name}` 
                                            : null;
                                        let conceptLabel = 'Pago';
                                        if (isTopup) {
                                            conceptLabel = 'Recarga de monedero digital';
                                        } else if (payment.financial_transaction) {
                                            const txAmount = parseFloat(payment.financial_transaction.amount);
                                            const paidAmount = parseFloat(payment.amount);
                                            if (paidAmount < txAmount) {
                                                conceptLabel = `Abono a: ${payment.financial_transaction.concept}`;
                                            } else {
                                                conceptLabel = `Pago a: ${payment.financial_transaction.concept}`;
                                            }
                                        }
                                            
                                        return (
                                            <div key={payment.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isTopup ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {isTopup ? <PlusCircle className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-slate-800 text-sm">
                                                            {conceptLabel}
                                                        </h4>
                                                        <div className="text-right">
                                                            <p className={`font-bold text-sm ${isTopup ? 'text-green-600' : 'text-slate-800'}`}>
                                                                {isTopup ? '+' : ''}${payment.amount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                                        <span>
                                                            {new Date(payment.created_at).toLocaleDateString('es-MX', { 
                                                                day: 'numeric', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                        <span className="font-medium">
                                                            {isTopup ? 'Abono a monedero' : (player ? `Para: ${player}` : 'Pago realizado')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500">
                                    <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium">No hay pagos ni recargas registrados aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    children.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {children.map((child) => (
                                <ChildFinancesCard 
                                    key={child.id} 
                                    child={child} 
                                    userBalance={userBalance}
                                    selectedTransactions={selectedTransactions}
                                    toggleTransactionSelection={toggleTransactionSelection}
                                    setWalletModalOpen={setWalletModalOpen}
                                    setSelectedWalletTx={setSelectedWalletTx}
                                    setWalletAmount={setWalletAmount}
                                    handlePayWithStripe={handlePayWithStripe}
                                    loadingAction={loadingAction}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes jugadores vinculados</h3>
                            <p className="text-slate-500">Pide a administración que vincule a tus hijos para ver su estado de cuenta.</p>
                        </div>
                    )
                )}
            </div>

            {/* Sticky Floating Action Bar for Selected Payments */}
            {selectedTransactions.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-40 sm:left-64 flex justify-center animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-lg w-full flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Seleccionados: <span className="font-bold text-slate-800">{selectedTransactions.length}</span></p>
                            <p className="text-xl font-black text-[#E31837]">${selectedTotal.toFixed(2)} MXN</p>
                        </div>
                        <button
                            onClick={handlePayMultipleStripe}
                            disabled={loadingAction === 'multiple_charges'}
                            className="bg-[#E31837] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {loadingAction === 'multiple_charges' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CreditCard className="w-5 h-5" />
                            )}
                            Pagar Ahora
                        </button>
                    </div>
                </div>
            )}
        </ParentLayout>
    );
}
