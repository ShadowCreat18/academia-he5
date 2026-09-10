import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { DollarSign, Wallet, AlertCircle, CreditCard, CheckCircle2, ArrowRight, Loader2, PlusCircle, X, History, Receipt } from 'lucide-react';
import ParentLayout from '@/Layouts/ParentLayout';

export default function Finances({ auth, children = [] }) {
    const [loadingAction, setLoadingAction] = useState(null);
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
    const [topupAmount, setTopupAmount] = useState('');
    const [topupError, setTopupError] = useState('');
    const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' o 'historial'
    const [selectedTransactions, setSelectedTransactions] = useState([]);

    const userBalance = parseFloat(auth.user.saldo_disponible || 0);

    const handlePayWithStripe = async (payload, actionKey) => {
        setLoadingAction(actionKey);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(route('parent.stripe.checkout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

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

    const handlePayWithWallet = (transactionId) => {
        if (!confirm('¿Deseas pagar este concepto con tu saldo disponible del monedero?')) {
            return;
        }

        router.post(route('parent.wallet.pay'), {
            transaction_id: transactionId,
        }, {
            preserveScroll: true,
        });
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
                                        Ingresa el monto en pesos (MXN) que deseas abonar a tu cuenta usando tarjeta de crédito o débito a través de Stripe:
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
                            Puedes usar este saldo a favor para liquidar adeudos de tus hijos al instante sin comisiones adicionales, o recargar saldo con tarjeta.
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
                {children.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {children.map((child) => {
                            // Fix: The relationship is serialized as `financial_transactions` in JSON
                            const transactions = child.financial_transactions || child.financialTransactions || [];
                            
                            let filteredTransactions = [];
                            if (activeTab === 'pendientes') {
                                filteredTransactions = transactions.filter(tx => (tx.amount - tx.paid_amount) > 0);
                            } else {
                                filteredTransactions = transactions.filter(tx => (tx.amount - tx.paid_amount) <= 0);
                            }

                            return (
                                <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">
                                                    {activeTab === 'pendientes' ? 'Estado de Cuenta' : 'Pagos Realizados'}
                                                </h3>
                                                <p className="text-slate-500 font-medium">{child.first_name} {child.last_name}</p>
                                            </div>
                                            {activeTab === 'pendientes' && (
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Pendiente</p>
                                                    <p className={`text-2xl font-black ${child.total_debt > 0 ? 'text-[#E31837]' : 'text-green-600'}`}>
                                                        ${child.total_debt.toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-0">
                                            {filteredTransactions.length > 0 ? (
                                                <div className="divide-y divide-slate-100">
                                                    {filteredTransactions.map(tx => {
                                                        const debt = Math.max(0, tx.amount - tx.paid_amount);
                                                        const isPaid = debt <= 0;
                                                        const isSelected = selectedTransactions.some(item => item.id === tx.id);
                                                        
                                                        return (
                                                            <div key={tx.id} className={`p-4 flex items-center gap-4 transition-colors hover:bg-slate-50 ${isSelected ? 'bg-red-50/50' : ''}`}>
                                                                {/* Checkbox para pagos pendientes */}
                                                                {!isPaid && (
                                                                    <div className="flex-shrink-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleTransactionSelection(tx.id, debt)}
                                                                            className="w-5 h-5 text-[#E31837] rounded border-slate-300 focus:ring-[#E31837]"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {isPaid && (
                                                                    <div className="flex-shrink-0">
                                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Info del concepto */}
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h4 className={`font-bold text-sm ${isSelected ? 'text-[#E31837]' : 'text-slate-800'}`}>
                                                                            {tx.concept}
                                                                        </h4>
                                                                        <p className="font-bold text-slate-800 text-sm">
                                                                            ${tx.amount}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-slate-500">
                                                                            Vence: {new Date(tx.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </span>
                                                                        {!isPaid && tx.paid_amount > 0 && (
                                                                            <span className="text-orange-600 font-medium">Abonado: ${tx.paid_amount} (Resta: ${debt})</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 text-slate-500">
                                                    {activeTab === 'pendientes' ? (
                                                        <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                                                    ) : (
                                                        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    )}
                                                    <p className="text-sm font-medium">
                                                        {activeTab === 'pendientes' ? '¡Todo al corriente! No hay adeudos.' : 'No hay pagos registrados aún.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón de Liquidar Todo con Tarjeta (Rediseñado) */}
                                    {activeTab === 'pendientes' && child.total_debt > 0 && (
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
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes jugadores vinculados</h3>
                        <p className="text-slate-500">Pide a administración que vincule a tus hijos para ver su estado de cuenta.</p>
                    </div>
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
