import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, LogOut, Search, Plus, Edit, Trash2, DollarSign, X, Users, CheckCircle, Clock, AlertTriangle, CreditCard, Banknote, Send, ListPlus, Filter } from 'lucide-react';

const CONCEPTS = [
    { label: 'Inscripción', amount: 1250 },
    { label: 'Apoyo Material Deportivo', amount: 1000 },
    { label: 'Inscripción Torneo', amount: 250 },
    { label: 'Mensualidad', amount: 500 },
    { label: 'Uniformes', amount: 2000 },
    { label: 'Arbitrajes', amount: 50 },
];

const CATEGORIES = [
    'Diente de Leche', 'Pony'
];

function statusBadge(status) {
    if (status === 'paid') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pagado</span>;
    if (status === 'partial') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Parcial</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Pendiente</span>;
}

export default function Index({ auth, players = [], selectedPlayer, transactions = [], selectedPlayerId, settings = [] }) {
    
    const dynamicConcepts = settings.map(s => ({
        label: s.name || s.key,
        amount: parseFloat(s.value) || 0,
        isArbitraje: s.key === 'cost_arbitraje' || (s.name || '').toLowerCase().includes('arbitraje')
    }));

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
    
    // Modal states
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isMultiChargeModalOpen, setIsMultiChargeModalOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [payingTransaction, setPayingTransaction] = useState(null);
    const [activeTab, setActiveTab] = useState(null);

    // Group players by category
    const playersByCategory = {};
    players.forEach(player => {
        const cat = player.category || 'Sin Categoría';
        if (!playersByCategory[cat]) playersByCategory[cat] = [];
        playersByCategory[cat].push(player);
    });

    const activePlayers = playersByCategory[activeCategory] || [];
    const filteredPlayers = activePlayers.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Formulario nuevo cargo ──
    const chargeForm = useForm({
        player_id: selectedPlayerId || '',
        concept: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        is_arbitration_penalty: false,
    });

    // ── Formulario editar cargo ──
    const editForm = useForm({
        concept: '',
        amount: '',
        due_date: '',
    });

    // ── Formulario pago ──
    const paymentForm = useForm({
        amount: '',
        method: 'cash',
        notes: '',
    });

    // ── Formulario cobro masivo ──
    const bulkForm = useForm({
        category: '',
        concept: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        is_arbitration_penalty: false,
        include_secondary: true,
    });

    // ── Formulario múltiples cargos ──
    const multiChargeForm = useForm({
        player_id: selectedPlayerId || '',
        charges: [
            { concept: '', amount: '', due_date: '', paid_amount: '0' }
        ],
    });

    const addChargeRow = () => {
        multiChargeForm.setData('charges', [
            ...multiChargeForm.data.charges,
            { concept: '', amount: '', due_date: new Date().toISOString().split('T')[0], paid_amount: '0' }
        ]);
    };

    const removeChargeRow = (index) => {
        const newCharges = [...multiChargeForm.data.charges];
        newCharges.splice(index, 1);
        multiChargeForm.setData('charges', newCharges);
    };

    const updateChargeRow = (index, field, value) => {
        const newCharges = [...multiChargeForm.data.charges];
        newCharges[index][field] = value;
        multiChargeForm.setData('charges', newCharges);
    };

    const applyConceptToRow = (index, concept) => {
        const newCharges = [...multiChargeForm.data.charges];
        newCharges[index].concept = concept.label;
        newCharges[index].amount = concept.amount;
        multiChargeForm.setData('charges', newCharges);
    };

    const submitMultiCharge = (e) => {
        e.preventDefault();
        multiChargeForm.post(route('finances.store-many'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsMultiChargeModalOpen(false);
                multiChargeForm.reset();
                multiChargeForm.setData('player_id', selectedPlayerId);
            },
        });
    };

    // ── Agrupar transacciones por Categoría ──
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
    
    // Sort logic: Year descending
    const sortedYears = Object.keys(transactionsByYear).sort((a, b) => b.localeCompare(a));

    useEffect(() => {
        if (selectedPlayerId && sortedYears.length > 0 && !activeTab) {
            setActiveTab(sortedYears[0]);
        } else if (!selectedPlayerId) {
            setActiveTab(null);
        }
    }, [selectedPlayerId, sortedYears]);

    const getSortedCategoriesForYear = (year) => {
        if (!transactionsByYear[year]) return [];
        return Object.keys(transactionsByYear[year]).sort((a, b) => {
            if (a === 'Mensualidades') return -1;
            if (b === 'Mensualidades') return 1;
            return a.localeCompare(b);
        });
    };

    const selectPlayer = (playerId) => {
        router.get('/finances', { player_id: playerId }, { preserveState: true, preserveScroll: true });
    };

    const closePlayerModal = () => {
        router.get('/finances', {}, { preserveState: true, preserveScroll: true });
    };

    const handleConceptSelect = (form, concept) => {
        form.setData(data => ({
            ...data,
            concept: concept.label,
            amount: concept.amount,
            is_arbitration_penalty: concept.isArbitraje,
        }));
    };

    const openWhatsAppModal = () => {
        if (!selectedPlayer) return;
        
        const parent = selectedPlayer.parents && selectedPlayer.parents.length > 0 ? selectedPlayer.parents[0] : null;
        const phone = parent?.phone || '';
        setWhatsappPhone(phone);

        let totalDebt = 0;
        let pendingDetails = [];
        
        transactions.forEach(tx => {
            let pending = Math.max(0, tx.amount - tx.paid_amount);
            if (pending > 0) {
                totalDebt += pending;
                pendingDetails.push(`- ${tx.concept}: $${pending.toFixed(2)}`);
            }
        });

        let defaultMsg = `Hola, te escribimos de la Escuela de Fútbol Héctor Esparza para recordarte el estado de cuenta de ${selectedPlayer.first_name} ${selectedPlayer.last_name}.\n\n`;
        
        if (totalDebt > 0) {
            defaultMsg += `Actualmente tienes un saldo pendiente de *$${totalDebt.toFixed(2)}*, correspondiente a:\n`;
            defaultMsg += pendingDetails.join('\n');
            defaultMsg += `\n\nPor favor, apóyanos poniéndote al corriente lo antes posible. `;
        } else {
            defaultMsg += `Actualmente *no tienes saldos pendientes*. ¡Muchas gracias por tu puntualidad!\n\n`;
        }

        defaultMsg += `Recuerda que puedes revisar el detalle ingresando a tu portal de padres o solicitarnos el PDF.\n\n¡Gracias!`;
        
        setWhatsappMessage(defaultMsg);
        setIsWhatsAppModalOpen(true);
    };

    const sendWhatsApp = () => {
        if (!whatsappPhone) {
            alert('El tutor principal de este jugador no tiene número de teléfono registrado.');
            return;
        }
        
        let cleanPhone = whatsappPhone.replace(/\D/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = '52' + cleanPhone;
        }
        
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(url, '_blank');
        setIsWhatsAppModalOpen(false);
    };

    const submitCharge = (e) => {
        e.preventDefault();
        chargeForm.post(route('finances.store-charge'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsChargeModalOpen(false);
                chargeForm.reset();
                chargeForm.setData('player_id', selectedPlayerId);
            },
        });
    };

    const openEditModal = (tx) => {
        setEditingTransaction(tx);
        editForm.setData({
            concept: tx.concept,
            amount: tx.amount,
            due_date: tx.due_date?.split('T')[0] || tx.due_date,
        });
        setIsEditModalOpen(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('finances.update-charge', editingTransaction.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingTransaction(null);
            },
        });
    };

    const openPaymentModal = (tx) => {
        setPayingTransaction(tx);
        const remaining = tx.amount - tx.paid_amount;
        paymentForm.setData({
            amount: remaining,
            method: 'cash',
            notes: '',
        });
        setIsPaymentModalOpen(true);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        paymentForm.post(route('finances.register-payment', payingTransaction.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setPayingTransaction(null);
            },
        });
    };

    const deleteCharge = (txId) => {
        if (!confirm('¿Estás seguro de eliminar este cargo? Esta acción no se puede deshacer.')) return;
        router.delete(route('finances.destroy-charge', txId), { preserveScroll: true });
    };

    const submitBulkCharge = (e) => {
        e.preventDefault();
        bulkForm.post(route('finances.bulk-charge'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsBulkModalOpen(false);
                bulkForm.reset();
            },
        });
    };

    // Resumen financiero del jugador seleccionado
    const totalCharged = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalPaid = transactions.reduce((sum, t) => sum + parseFloat(t.paid_amount || 0), 0);
    const totalPending = totalCharged - totalPaid;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head title="Gestión Financiera" />

            {/* Navbar */}
            <nav className="bg-[#0033A0] text-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <span className="font-heading font-bold text-xl tracking-wider">HE-5 Admin</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="flex items-center space-x-1 text-blue-200 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" /> <span>Volver</span>
                            </Link>
                            <Link href="/logout" method="post" as="button" className="text-blue-200 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Gestión Financiera</h1>
                        <p className="text-slate-500 mt-1">Administra cobros, pagos y adeudos por jugador.</p>
                    </div>
                    
                </div>

                {/* ── Buscador ── */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre en la categoría actual..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] sm:text-sm shadow-sm transition-shadow text-slate-900"
                    />
                </div>

                {/* ── Tabs de Categorías ── */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {CATEGORIES.map(category => {
                        const count = playersByCategory[category]?.length || 0;
                        return (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
                                    activeCategory === category
                                        ? 'bg-[#0033A0] text-white shadow-md transform scale-105'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <span>{category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    activeCategory === category ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Grid de Jugadores ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlayers.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <p>No se encontraron jugadores en esta categoría.</p>
                        </div>
                    ) : (
                        filteredPlayers.map(player => (
                            <div 
                                key={player.id + (player.is_refuerzo ? '-ref' : '')}
                                onClick={() => selectPlayer(player.id)}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
                            >
                                <div className="p-5 border-b border-slate-100">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-[#0033A0] transition-colors line-clamp-1">
                                        {player.first_name} {player.last_name}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                            {player.category || 'Sin Cat'}
                                        </span>
                                        {player.is_refuerzo && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                Refuerzo
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Adeudo total:</span>
                                        <span className={`font-bold text-lg ${player.total_debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${parseFloat(player.total_debt || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* ══════════════════════════════════════════════ */}
            {/* Modal Grande: Ficha Financiera del Jugador    */}
            {/* ══════════════════════════════════════════════ */}
            {selectedPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-full flex flex-col my-auto">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 rounded-t-3xl z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    Ficha Financiera: {selectedPlayer.first_name} {selectedPlayer.last_name}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {selectedPlayer.category}
                                    {selectedPlayer.secondary_category && (
                                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">+ {selectedPlayer.secondary_category}</span>
                                    )}
                                </p>
                            </div>
                            <button onClick={closePlayerModal} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Contenido Ficha */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            multiChargeForm.setData('player_id', selectedPlayer.id);
                                            setIsMultiChargeModalOpen(true);
                                        }}
                                        className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold hover:bg-green-200 transition-colors flex items-center space-x-2"
                                    >
                                        <ListPlus className="w-4 h-4" />
                                        <span>Registrar Varios</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            chargeForm.setData('player_id', selectedPlayer.id);
                                            setIsChargeModalOpen(true);
                                        }}
                                        className="bg-[#E31837] text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Nuevo Cargo</span>
                                    </button>
                                    <a
                                        href={route('pdf.statement', selectedPlayer.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center space-x-2 shadow-sm"
                                        title="Descargar PDF"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="hidden sm:inline">PDF</span>
                                    </a>
                                    <button
                                        onClick={openWhatsAppModal}
                                        className="bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center space-x-2 shadow-sm"
                                        title="Enviar WhatsApp"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span className="hidden sm:inline">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            {/* Resumen */}
                            {(() => {
                                const currentYear = new Date().getFullYear().toString();
                                let currentDebt = 0;
                                let historicalDebt = 0;
                                
                                transactions.forEach(tx => {
                                    const dateStr = tx.due_date?.split('T')[0] || tx.due_date || '';
                                    const year = dateStr.substring(0, 4) || 'Sin Fecha';
                                    const remaining = Math.max(0, tx.amount - tx.paid_amount);
                                    if (year === currentYear) {
                                        currentDebt += remaining;
                                    } else {
                                        historicalDebt += remaining;
                                    }
                                });

                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                                            <p className="text-sm text-slate-500 font-medium mb-1">Deuda Año Actual ({currentYear})</p>
                                            <p className="text-2xl font-black text-slate-800">${currentDebt.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center shadow-sm">
                                            <p className="text-sm text-orange-600 font-medium mb-1">Deuda Histórica</p>
                                            <p className="text-2xl font-black text-orange-700">${historicalDebt.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center shadow-sm">
                                            <p className="text-sm text-red-600 font-medium mb-1">Deuda Total</p>
                                            <p className="text-2xl font-black text-red-700">${totalPending.toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Tabs por Año */}
                            {transactions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {sortedYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setActiveTab(year)}
                                            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                                                activeTab === year 
                                                ? 'bg-[#0033A0] text-white shadow-md' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tablas de transacciones del año activo */}
                            {transactions.length === 0 ? (
                                <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-12 text-center text-slate-400">
                                    <DollarSign className="mx-auto w-12 h-12 mb-3 text-slate-300" />
                                    <p>Este jugador no tiene cargos registrados.</p>
                                </div>
                            ) : (
                                activeTab && transactionsByYear[activeTab] && (
                                    getSortedCategoriesForYear(activeTab).map(cat => {
                                        const catTxs = transactionsByYear[activeTab][cat];
                                        const catTotal = catTxs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
                                        const catPaid = catTxs.reduce((s, t) => s + parseFloat(t.paid_amount || 0), 0);
                                        const catPending = catTotal - catPaid;
                                        return (
                                            <div key={cat} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-2">
                                                    <h3 className="font-bold text-lg text-slate-700">📂 {cat}</h3>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                                        <span className="text-slate-500">Cargado: <strong className="text-slate-800">${catTotal.toFixed(2)}</strong></span>
                                                        <span className="text-green-600">Pagado: <strong>${catPaid.toFixed(2)}</strong></span>
                                                        <span className="text-red-600">Pendiente: <strong>${catPending.toFixed(2)}</strong></span>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left font-semibold">Concepto</th>
                                                                <th className="px-4 py-3 text-right font-semibold">Monto</th>
                                                                <th className="px-4 py-3 text-right font-semibold">Pagado</th>
                                                                <th className="px-4 py-3 text-right font-semibold">Pendiente</th>
                                                                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                                                                <th className="px-4 py-3 text-center font-semibold">Fecha</th>
                                                                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {catTxs.map(tx => {
                                                                const remaining = Math.max(0, tx.amount - tx.paid_amount);
                                                                return (
                                                                    <tr key={tx.id} className="hover:bg-slate-50/50">
                                                                        <td className="px-4 py-3 font-medium text-slate-800">
                                                                            {tx.concept}
                                                                            {tx.is_arbitration_penalty && (
                                                                                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Arbitraje</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right text-slate-800">${parseFloat(tx.amount).toFixed(2)}</td>
                                                                        <td className="px-4 py-3 text-right text-green-700 font-medium">${parseFloat(tx.paid_amount).toFixed(2)}</td>
                                                                        <td className="px-4 py-3 text-right text-red-700 font-medium">${remaining.toFixed(2)}</td>
                                                                        <td className="px-4 py-3 text-center">{statusBadge(tx.status)}</td>
                                                                        <td className="px-4 py-3 text-center text-slate-500">{tx.due_date?.split('T')[0] || tx.due_date}</td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="flex items-center justify-center space-x-1">
                                                                                {tx.status !== 'paid' && (
                                                                                    <button onClick={() => openPaymentModal(tx)} title="Registrar Pago" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                                                        <Banknote className="w-5 h-5" />
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => openEditModal(tx)} title="Editar" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                                    <Edit className="w-5 h-5" />
                                                                                </button>
                                                                                <button onClick={() => deleteCharge(tx.id)} title="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                                    <Trash2 className="w-5 h-5" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════ */}
            {/* Modal: Nuevo Cargo                            */}
            {/* ══════════════════════════════════════════════ */}
            {isChargeModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Nuevo Cargo</h3>
                            <button onClick={() => setIsChargeModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitCharge} className="p-6 space-y-4">
                            {/* Concept quick-select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Concepto Rápido</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dynamicConcepts.map(c => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => handleConceptSelect(chargeForm, c)}
                                            className="px-3 py-2 text-sm text-left border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                        >
                                            <span className="block font-medium text-slate-800">{c.label}</span>
                                            <span className="block text-slate-500">${c.amount}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto Personalizado</label>
                                <input
                                    type="text"
                                    value={chargeForm.data.concept}
                                    onChange={e => chargeForm.setData('concept', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={chargeForm.data.amount}
                                        onChange={e => chargeForm.setData('amount', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={chargeForm.data.due_date}
                                        onChange={e => chargeForm.setData('due_date', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="is_arbitration_penalty"
                                    checked={chargeForm.data.is_arbitration_penalty}
                                    onChange={e => chargeForm.setData('is_arbitration_penalty', e.target.checked)}
                                    className="rounded border-slate-300 text-[#0033A0] focus:ring-[#0033A0] text-slate-900"
                                />
                                <label htmlFor="is_arbitration_penalty" className="text-sm text-slate-700">
                                    Es cobro de Arbitraje
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsChargeModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
                                <button type="submit" disabled={chargeForm.processing} className="px-5 py-2 bg-[#E31837] text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50">Guardar Cargo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Cargo */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Editar Cargo</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Concepto (Atajo)</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900 mb-4"
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val) {
                                            const preset = dynamicConcepts.find(c => c.label === val);
                                            if (preset) {
                                                editForm.setData({
                                                    ...editForm.data,
                                                    concept: preset.label,
                                                    amount: preset.amount
                                                });
                                            }
                                        }
                                        // Reset select to default so it can be triggered again
                                        e.target.value = "";
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Elige un concepto para autocompletar...</option>
                                    {dynamicConcepts.map(c => (
                                        <option key={c.label} value={c.label}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto (Puedes editarlo)</label>
                                <input
                                    type="text"
                                    value={editForm.data.concept}
                                    onChange={e => editForm.setData('concept', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.amount}
                                        onChange={e => editForm.setData('amount', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={editForm.data.due_date}
                                        onChange={e => editForm.setData('due_date', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
                                <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-[#0033A0] text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50">Actualizar Cargo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Pago */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Registrar Pago</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitPayment} className="p-6 space-y-4">
                            <div className="bg-blue-50 text-[#0033A0] p-4 rounded-xl border border-blue-100 mb-4">
                                <p className="font-semibold">{payingTransaction?.concept}</p>
                                <p className="text-sm opacity-80 mt-1">Saldo pendiente: <strong>${Math.max(0, (payingTransaction?.amount || 0) - (payingTransaction?.paid_amount || 0)).toFixed(2)}</strong></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Monto a Pagar ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    max={Math.max(0, (payingTransaction?.amount || 0) - (payingTransaction?.paid_amount || 0))}
                                    value={paymentForm.data.amount}
                                    onChange={e => paymentForm.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                                <select
                                    value={paymentForm.data.method}
                                    onChange={e => paymentForm.setData('method', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                >
                                    <option value="cash">Efectivo</option>
                                    <option value="transfer">Transferencia</option>
                                    <option value="card">Tarjeta</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
                                <button type="submit" disabled={paymentForm.processing} className="px-5 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">Confirmar Pago</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Registro Masivo */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Cobro Masivo</h3>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitBulkCharge} className="p-6 space-y-4">
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                <select
                                    value={bulkForm.data.category}
                                    onChange={e => bulkForm.setData('category', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={bulkForm.data.include_secondary}
                                        onChange={e => bulkForm.setData('include_secondary', e.target.checked)}
                                        className="rounded border-slate-300 text-[#0033A0] focus:ring-[#0033A0] text-slate-900"
                                    />
                                    <span className="text-sm text-slate-700">Incluir refuerzos en esta categoría</span>
                                </label>
                            </div>

                            {/* Concept quick-select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Concepto Rápido</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dynamicConcepts.map(c => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => handleConceptSelect(bulkForm, c)}
                                            className="px-3 py-2 text-sm text-left border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                        >
                                            <span className="block font-medium text-slate-800">{c.label}</span>
                                            <span className="block text-slate-500">${c.amount}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto Personalizado</label>
                                <input
                                    type="text"
                                    value={bulkForm.data.concept}
                                    onChange={e => bulkForm.setData('concept', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={bulkForm.data.amount}
                                        onChange={e => bulkForm.setData('amount', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={bulkForm.data.due_date}
                                        onChange={e => bulkForm.setData('due_date', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#0033A0] text-slate-900"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="bulk_is_arbitration_penalty"
                                    checked={bulkForm.data.is_arbitration_penalty}
                                    onChange={e => bulkForm.setData('is_arbitration_penalty', e.target.checked)}
                                    className="rounded border-slate-300 text-[#0033A0] focus:ring-[#0033A0] text-slate-900"
                                />
                                <label htmlFor="bulk_is_arbitration_penalty" className="text-sm text-slate-700">
                                    Es cobro de Arbitraje
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
                                <button type="submit" disabled={bulkForm.processing} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50">Generar Cargos</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Registrar Múltiples Cargos (Tabla) */}
            {isMultiChargeModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Registrar Varios Cargos Anteriores</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Agrega conceptos históricos. Si el cargo ya está cubierto, ingresa el mismo monto en "Total Pagado".
                                </p>
                            </div>
                            <button onClick={() => setIsMultiChargeModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitMultiCharge} className="p-6">
                            
                            {/* Concept quick-select (Applies to the last row by default or we can just let them type) */}
                            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Atajos Rápidos de Llenado</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                    {dynamicConcepts.map(c => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => {
                                                // Apply to the last empty row or add a new one if all full
                                                const rows = [...multiChargeForm.data.charges];
                                                const lastRow = rows[rows.length - 1];
                                                if (lastRow && !lastRow.concept && !lastRow.amount) {
                                                    applyConceptToRow(rows.length - 1, c);
                                                } else {
                                                    multiChargeForm.setData('charges', [
                                                        ...rows,
                                                        { concept: c.label, amount: c.amount, due_date: new Date().toISOString().split('T')[0], paid_amount: '0' }
                                                    ]);
                                                }
                                            }}
                                            className="px-2 py-2 text-xs text-center border border-slate-300 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm text-slate-900"
                                        >
                                            <span className="block font-bold text-slate-800 truncate">{c.label}</span>
                                            <span className="block text-slate-500 mt-0.5">${c.amount}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-4">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#0033A0] text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold w-1/3">Concepto</th>
                                            <th className="px-4 py-3 text-left font-semibold">Monto Total ($)</th>
                                            <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                                            <th className="px-4 py-3 text-left font-semibold">Total Pagado ($)</th>
                                            <th className="px-4 py-3 text-center font-semibold w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {multiChargeForm.data.charges.map((charge, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={charge.concept}
                                                        onChange={e => updateChargeRow(index, 'concept', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] transition-shadow text-slate-900"
                                                        placeholder="Ej. Mensualidad Diciembre 2025"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={charge.amount}
                                                        onChange={e => updateChargeRow(index, 'amount', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] transition-shadow text-slate-900"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={charge.due_date}
                                                        onChange={e => updateChargeRow(index, 'due_date', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] transition-shadow text-slate-900"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <DollarSign className="h-4 w-4 text-slate-400" />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={charge.paid_amount}
                                                            onChange={e => updateChargeRow(index, 'paid_amount', e.target.value)}
                                                            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-slate-900"
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {multiChargeForm.data.charges.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChargeRow(index)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar fila"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    type="button"
                                    onClick={addChargeRow}
                                    className="flex items-center space-x-2 text-[#0033A0] font-bold hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Agregar Fila</span>
                                </button>
                                
                                <div className="flex space-x-3">
                                    <button type="button" onClick={() => setIsMultiChargeModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={multiChargeForm.processing} 
                                        className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-md transition-colors flex items-center space-x-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Guardar Historial ({multiChargeForm.data.charges.length})</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: WhatsApp */}
            {isWhatsAppModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#25D366]/10">
                            <h3 className="text-xl font-bold text-[#075E54] flex items-center">
                                <Send className="w-5 h-5 mr-2" />
                                Recordatorio de Cobranza
                            </h3>
                            <button onClick={() => setIsWhatsAppModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono del Tutor</label>
                                <input
                                    type="text"
                                    value={whatsappPhone}
                                    onChange={e => setWhatsappPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-[#25D366] text-slate-900 bg-slate-50"
                                    placeholder="Ej. 4921234567"
                                />
                                {!whatsappPhone && (
                                    <p className="mt-1 text-sm text-red-500">Este jugador no tiene teléfono registrado.</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                                <textarea
                                    rows="6"
                                    value={whatsappMessage}
                                    onChange={(e) => setWhatsappMessage(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-[#25D366] text-slate-900"
                                    placeholder="Escribe el mensaje aquí..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsWhatsAppModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={sendWhatsApp}
                                    disabled={!whatsappPhone}
                                    className="px-5 py-2 bg-[#25D366] text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
