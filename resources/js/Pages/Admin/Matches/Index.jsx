import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    MapPin,
    Users,
    MessageCircle,
    Plus,
    X,
    Trophy,
    Shirt,
    Clock,
    Activity,
    Edit2,
    Trash2,
    Check,
    ArrowLeft,
    LogOut,
    Copy,
    ClipboardCheck
} from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Matches({ auth, games, players, categories, senderPhone = '', senderName = '' }) {
    // Parse date strings as LOCAL time (strip the Z so the browser doesn't shift to UTC)
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        // Remove Z or timezone offset so it's treated as local
        return new Date(dateStr.replace('T', ' ').replace('Z', '').substring(0, 16));
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [confirmedPlayers, setConfirmedPlayers] = useState([]);
    const [copied, setCopied] = useState(false);
    const [isArbitrationModalOpen, setIsArbitrationModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Todas');

    // Form for creating/editing game
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        opponent: '',
        date: '',
        location: '',
        category: '',
        uniform_type: '',
    });

    // Form for updating scores/goals
    const { data: scoreData, setData: setScoreData, put: putScore, processing: processingScore } = useForm({
        score_us: '',
        score_them: '',
        goals: [] // Array of {player_id, goals}
    });

    // Form for arbitration checklist
    const { data: arbData, setData: setArbData, post: postArb, processing: processingArb } = useForm({
        paid_players: []
    });

    const categoriesList = ['Diente de Leche', 'Pony'];
    const uniformOptions = ['Local (Rojo)', 'Visitante (Negro)', 'Alternativo'];

    const uniqueCategories = useMemo(() => {
        const cats = new Set(games.map(g => g.category).filter(Boolean));
        // Add categoriesList to ensure they always show up even if no games exist
        categoriesList.forEach(c => cats.add(c));
        return Array.from(cats).sort();
    }, [games]);

    const upcomingGames = useMemo(() => {
        let filtered = games.filter(g => !isPast(parseLocalDate(g.date)));
        if (activeCategory !== 'Todas') {
            filtered = filtered.filter(g => g.category === activeCategory);
        }
        return filtered;
    }, [games, activeCategory]);

    const pastGames = useMemo(() => {
        let filtered = games.filter(g => isPast(parseLocalDate(g.date)));
        if (activeCategory !== 'Todas') {
            filtered = filtered.filter(g => g.category === activeCategory);
        }
        return filtered;
    }, [games, activeCategory]);

    const openCreateModal = () => {
        reset();
        setSelectedGame(null);
        setIsModalOpen(true);
    };

    const openEditModal = (game) => {
        setSelectedGame(game);
        // Take the date string as-is from DB (stored without tz conversion), just trim to 16 chars
        const dateStr = game.date ? game.date.replace('Z', '').replace(' ', 'T').substring(0, 16) : '';
        setData({
            opponent: game.opponent,
            date: dateStr,
            location: game.location || '',
            category: game.category,
            uniform_type: game.uniform_type || '',
        });
        setIsModalOpen(true);
    };

    const openScoreModal = (game) => {
        setSelectedGame(game);
        
        // Initialize goals based on existing or empty
        const initialGoals = game.goals ? game.goals.map(g => ({
            player_id: g.player_id,
            goals: g.goals
        })) : [];

        setScoreData({
            score_us: game.score_us ?? '',
            score_them: game.score_them ?? '',
            goals: initialGoals
        });
        setIsScoreModalOpen(true);
    };

    const openWhatsAppModal = (game) => {
        setSelectedGame(game);
        setConfirmedPlayers([]);
        setCopied(false);
        const dateObj = parseLocalDate(game.date);
        const formattedDate = format(dateObj, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
        
        const arrivalDate = new Date(dateObj.getTime() - 30 * 60000);
        const arrivalTime = format(arrivalDate, "h:mm a", { locale: es });
        
        let uniformColor = '';
        let uniformImage = '';
        if (game.uniform_type === 'Local (Rojo)') {
            uniformColor = 'Rojo';
            uniformImage = `${window.location.origin}/images/uniforme_local.jpg`;
        } else if (game.uniform_type === 'Visitante (Negro)') {
            uniformColor = 'Negro';
            uniformImage = `${window.location.origin}/images/uniforme_visitante.jpg`;
        } else if (game.uniform_type) {
            uniformColor = game.uniform_type;
        }

        let uniformText = '';
        if (uniformColor) {
            uniformText = `\nFavor de presentarse con el uniforme: ${uniformColor}.`;
            if (uniformImage) {
                uniformText += `\nVer uniforme: ${uniformImage}`;
            }
        }

        const defaultMsg = `¡Hola! Te recordamos del próximo partido de la categoría ${game.category}.\n\nRival: ${game.opponent}\nCuándo: ${formattedDate}\nHora de llegada: ${arrivalTime} (30 minutos antes)\nDónde: ${game.location || 'Por confirmar'}${uniformText}\n\nFavor de confirmar asistencia.\n\n¡Nos vemos en la cancha!`;
        setWhatsappMessage(defaultMsg);
        setIsWhatsAppModalOpen(true);
    };

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(whatsappMessage).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    const toggleConfirmed = (playerId) => {
        if (confirmedPlayers.includes(playerId)) {
            setConfirmedPlayers(confirmedPlayers.filter(id => id !== playerId));
        } else {
            setConfirmedPlayers([...confirmedPlayers, playerId]);
        }
    };

    const openArbitrationModal = (game) => {
        setSelectedGame(game);
        
        // Find which players have already paid for this game
        const paidPlayers = [];
        if (game.financial_transactions) {
            game.financial_transactions.forEach(tx => {
                if (tx.status === 'paid' && tx.is_arbitration_penalty) {
                    paidPlayers.push(tx.player_id);
                }
            });
        }
        
        setArbData({ paid_players: paidPlayers });
        setIsArbitrationModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedGame) {
            put(route('matches.update', selectedGame.id), {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post(route('matches.store'), {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleScoreSubmit = (e) => {
        e.preventDefault();
        putScore(route('matches.update', selectedGame.id), {
            preserveScroll: true,
            onSuccess: () => setIsScoreModalOpen(false)
        });
    };

    const handleArbitrationSubmit = (e) => {
        e.preventDefault();
        postArb(route('matches.arbitration', selectedGame.id), {
            preserveScroll: true,
            onSuccess: () => setIsArbitrationModalOpen(false)
        });
    };

    const toggleArbitrationPayment = (playerId) => {
        const isPaid = arbData.paid_players.includes(playerId);
        if (isPaid) {
            setArbData('paid_players', arbData.paid_players.filter(id => id !== playerId));
        } else {
            setArbData('paid_players', [...arbData.paid_players, playerId]);
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este partido?')) {
            destroy(route('matches.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Calculate WhatsApp Link
    const generateWhatsAppLink = (phone) => {
        const raw = phone.trim();
        let cleanPhone;
        if (raw.startsWith('+')) {
            // International format: strip the + but keep the country code digits
            cleanPhone = raw.replace(/\D/g, '');
        } else {
            cleanPhone = raw.replace(/\D/g, '');
            // If 10 digits, assume Mexican number
            if (cleanPhone.length === 10) cleanPhone = '52' + cleanPhone;
        }
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    };

    // Filter players for selected category (including reinforcements)
    const playersInCategory = selectedGame ? players.filter(p => 
        p.category === selectedGame.category || p.secondary_category === selectedGame.category
    ) : [];

    const handleAddGoalScorer = (playerId) => {
        const existing = scoreData.goals.find(g => g.player_id === playerId);
        if (existing) {
            setScoreData('goals', scoreData.goals.map(g => 
                g.player_id === playerId ? { ...g, goals: g.goals + 1 } : g
            ));
        } else {
            setScoreData('goals', [...scoreData.goals, { player_id: playerId, goals: 1 }]);
        }
    };

    const handleRemoveGoalScorer = (playerId) => {
        const existing = scoreData.goals.find(g => g.player_id === playerId);
        if (existing && existing.goals > 1) {
            setScoreData('goals', scoreData.goals.map(g => 
                g.player_id === playerId ? { ...g, goals: g.goals - 1 } : g
            ));
        } else {
            setScoreData('goals', scoreData.goals.filter(g => g.player_id !== playerId));
        }
    };

    const getScorerName = (playerId) => {
        const player = players.find(p => p.id === playerId);
        return player ? `${player.first_name} ${player.last_name}` : 'Desconocido';
    };

    const GameCard = ({ game }) => {
        const isUpcoming = !isPast(parseLocalDate(game.date));
        
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className={clsx(
                    "px-4 py-3 border-b flex justify-between items-center",
                    isUpcoming ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-200"
                )}>
                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "px-2 py-1 text-xs font-bold rounded-md",
                            isUpcoming ? "bg-blue-600 text-white" : "bg-slate-600 text-white"
                        )}>
                            {game.category}
                        </span>
                        {isUpcoming ? (
                            <span className="flex items-center text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                                <Activity className="w-3 h-3 mr-1" /> Próximo
                            </span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-slate-700 bg-slate-200 px-2 py-1 rounded-md">
                                <Check className="w-3 h-3 mr-1" /> Finalizado
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(game)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(game.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-4 text-xl font-bold text-slate-800">
                            <div className="flex-1 text-right truncate">HE-5</div>
                            <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                                {game.score_us ?? '-'} : {game.score_them ?? '-'}
                            </div>
                            <div className="flex-1 text-left truncate">{game.opponent}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start text-sm text-slate-600">
                            <CalendarIcon className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-slate-400" />
                            <span className="capitalize">{format(parseLocalDate(game.date), "EEEE d 'de' MMMM, yyyy • h:mm a", { locale: es })}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="w-4 h-4 mr-3 shrink-0 text-slate-400" />
                            <span className="truncate">{game.location || 'Por confirmar'}</span>
                        </div>
                        {game.uniform_type && (
                            <div className="flex items-start text-sm text-slate-600">
                                <Shirt className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-slate-400" />
                                <div>
                                    <span>Uniforme: <span className="font-medium text-slate-800">{game.uniform_type}</span></span>
                                    {game.uniform_type === 'Local (Rojo)' && (
                                        <div className="mt-2"><img src="/images/uniforme_local.jpg" alt="Local" className="h-20 rounded-md object-contain border" /></div>
                                    )}
                                    {game.uniform_type === 'Visitante (Negro)' && (
                                        <div className="mt-2"><img src="/images/uniforme_visitante.jpg" alt="Visitante" className="h-20 rounded-md object-contain border" /></div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Goal Scorers Preview */}
                    {!isUpcoming && game.goals && game.goals.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                                <Trophy className="w-3 h-3 mr-1" /> Goleadores
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {game.goals.map((g, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                                        {getScorerName(g.player_id)} 
                                        <span className="ml-1 bg-green-200 text-green-800 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                            {g.goals}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {isUpcoming ? (
                        <>
                            <button
                                onClick={() => openWhatsAppModal(game)}
                                className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Notificar
                            </button>
                            <button
                                onClick={() => openArbitrationModal(game)}
                                className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Asistencia y Arbitraje
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => openScoreModal(game)}
                            className="col-span-2 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Trophy className="w-4 h-4 mr-2" />
                            Registrar Resultado y Goles
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Partidos" />

            <nav className="bg-[#0033A0] text-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <span className="font-heading font-bold text-xl tracking-wider">HE-5 Admin</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link href="/dashboard" className="hidden sm:flex items-center space-x-2 hover:text-blue-200 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span>Volver</span>
                            </Link>
                            <Link href="/logout" method="post" as="button" className="hover:text-red-300 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Calendario de Partidos</h1>
                            <p className="text-slate-500 text-sm mt-1">Programa juegos, notifica padres y lleva estadísticas.</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Partido
                        </button>
                    </div>

                    {uniqueCategories.length > 0 && (
                        <div className="mb-8 overflow-x-auto border-b border-slate-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {['Todas', ...uniqueCategories].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={clsx(
                                            activeCategory === cat
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
                                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}

                    <div className="space-y-12">
                        {/* Upcoming Games */}
                        <section>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-600" /> Próximos Juegos
                            </h2>
                            {upcomingGames.length === 0 ? (
                                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-sm font-medium text-slate-900">No hay próximos partidos</h3>
                                    <p className="text-sm text-slate-500 mt-1">Programa un nuevo partido para que aparezca aquí.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingGames.map(game => <GameCard key={game.id} game={game} />)}
                                </div>
                            )}
                        </section>

                        {/* Past Games */}
                        <section>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <Check className="w-5 h-5 mr-2 text-slate-500" /> Resultados Anteriores
                            </h2>
                            {pastGames.length === 0 ? (
                                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-sm font-medium text-slate-600">Aún no hay resultados</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                                    {pastGames.map(game => <GameCard key={game.id} game={game} />)}
                                </div>
                            )}
                        </section>
                    </div>

                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {selectedGame ? 'Editar Partido' : 'Nuevo Partido'}
                                    </h3>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Equipo Rival</label>
                                            <input
                                                type="text"
                                                className="w-full text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={data.opponent}
                                                onChange={e => setData('opponent', e.target.value)}
                                                required
                                            />
                                            {errors.opponent && <div className="text-red-500 text-xs mt-1">{errors.opponent}</div>}
                                        </div>
                                        
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                            <select
                                                className="w-full text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={data.category}
                                                onChange={e => setData('category', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {categoriesList.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={data.date}
                                                onChange={e => setData('date', e.target.value)}
                                                required
                                            />
                                            {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar (Campo)</label>
                                            <input
                                                type="text"
                                                className="w-full text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={data.location}
                                                onChange={e => setData('location', e.target.value)}
                                                placeholder="Ej. Campo 1"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Uniforme a Usar</label>
                                            <select
                                                className="w-full text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={data.uniform_type}
                                                onChange={e => setData('uniform_type', e.target.value)}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {uniformOptions.map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                            {data.uniform_type === 'Local (Rojo)' && (
                                                <div className="mt-3 flex justify-center"><img src="/images/uniforme_local.jpg" alt="Local" className="h-40 rounded-lg object-contain border border-slate-200 shadow-sm" /></div>
                                            )}
                                            {data.uniform_type === 'Visitante (Negro)' && (
                                                <div className="mt-3 flex justify-center"><img src="/images/uniforme_visitante.jpg" alt="Visitante" className="h-40 rounded-lg object-contain border border-slate-200 shadow-sm" /></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Score & Goals Modal */}
            {isScoreModalOpen && selectedGame && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsScoreModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleScoreSubmit}>
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                                        Resultado Final
                                    </h3>
                                    <button type="button" onClick={() => setIsScoreModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    
                                    <div className="flex justify-center items-center gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-center">
                                            <div className="font-bold text-slate-800 mb-2">HE-5</div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-16 text-center text-xl font-bold text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={scoreData.score_us}
                                                onChange={e => setScoreData('score_us', e.target.value)}
                                            />
                                        </div>
                                        <div className="font-bold text-2xl text-slate-300">-</div>
                                        <div className="text-center">
                                            <div className="font-bold text-slate-800 mb-2 truncate max-w-[100px]" title={selectedGame.opponent}>{selectedGame.opponent}</div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-16 text-center text-xl font-bold text-slate-900 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                value={scoreData.score_them}
                                                onChange={e => setScoreData('score_them', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-semibold text-slate-700 flex items-center mb-3">
                                            ⚽ ¿Quién anotó los goles?
                                        </h4>
                                        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                                            {playersInCategory.map(player => {
                                                const goalRecord = scoreData.goals.find(g => g.player_id === player.id);
                                                const goals = goalRecord ? goalRecord.goals : 0;
                                                return (
                                                    <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {player.first_name} {player.last_name}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveGoalScorer(player.id)}
                                                                disabled={goals === 0}
                                                                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-4 text-center font-bold text-slate-800">{goals}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleAddGoalScorer(player.id)}
                                                                className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-200"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {playersInCategory.length === 0 && (
                                                <div className="text-center text-sm text-slate-500 py-4">
                                                    No hay jugadores activos en esta categoría.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setIsScoreModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingScore}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Guardar Resultados
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Notifications Modal */}
            {isWhatsAppModalOpen && selectedGame && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsWhatsAppModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                                        Notificar Padres ({selectedGame.category})
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Edita el mensaje y haz clic en cada botón para enviar.</p>
                                </div>
                                <button type="button" onClick={() => setIsWhatsAppModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 max-h-[70vh] overflow-y-auto bg-slate-50/50">
                                {/* Mensaje Editable */}
                                <div className="mb-5">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">📝 Mensaje a enviar</label>
                                    <textarea
                                        value={whatsappMessage}
                                        onChange={e => setWhatsappMessage(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-900 bg-white resize-y"
                                    />
                                </div>

                                {/* PASO 1: Enviar al grupo */}
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <h4 className="font-bold text-green-800 text-sm mb-2">Paso 1: Enviar al grupo de WhatsApp</h4>
                                    <p className="text-xs text-green-700 mb-3">Copia el mensaje y pégalo en el grupo de la categoría.</p>
                                    <button
                                        onClick={handleCopyMessage}
                                        className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                                            copied 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
                                        }`}
                                    >
                                        {copied ? (
                                            <><ClipboardCheck className="w-4 h-4" /><span>¡Mensaje copiado! Pégalo en el grupo</span></>
                                        ) : (
                                            <><Copy className="w-4 h-4" /><span>Copiar mensaje para el grupo</span></>
                                        )}
                                    </button>
                                </div>

                                {/* PASO 2: Individuales para quienes no confirman */}
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">Paso 2: Marca quién confirmó en el grupo</h4>
                                    <p className="text-xs text-slate-500 mb-3">Los que NO marques tendrán botón para enviarles WhatsApp individual.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {playersInCategory.map(player => {
                                        const parentsList = player.parents || [];
                                        const isConfirmed = confirmedPlayers.includes(player.id);
                                        
                                        return (
                                            <div key={player.id} className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all ${
                                                isConfirmed 
                                                ? 'bg-green-50 border-green-200 opacity-70' 
                                                : 'bg-white border-slate-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{player.first_name} {player.last_name}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {player.secondary_category === selectedGame.category ? 'Refuerzo' : 'Titular'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleConfirmed(player.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
                                                            isConfirmed
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>{isConfirmed ? 'Confirmó' : 'Confirmar'}</span>
                                                    </button>
                                                </div>
                                                
                                                {!isConfirmed && (
                                                    <div className="space-y-2 mt-2">
                                                        {parentsList.length > 0 ? parentsList.map(parent => (
                                                            parent.phone ? (
                                                                <a 
                                                                    key={parent.id}
                                                                    href={generateWhatsAppLink(parent.phone)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center w-full px-3 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold rounded-lg transition-colors"
                                                                >
                                                                    <MessageCircle className="w-3.5 h-3.5 mr-2" />
                                                                    {parent.name} ({parent.phone})
                                                                </a>
                                                            ) : (
                                                                <div key={parent.id} className="text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                                                    {parent.name} — Sin teléfono
                                                                </div>
                                                            )
                                                        )) : (
                                                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 text-center">
                                                                Sin padres registrados
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {playersInCategory.length > 0 && (
                                    <div className="mt-4 text-center text-xs text-slate-500">
                                        {confirmedPlayers.length} de {playersInCategory.length} confirmados
                                    </div>
                                )}

                                {playersInCategory.length === 0 && (
                                    <div className="text-center py-10 text-slate-500">
                                        No hay jugadores en esta categoría para notificar.
                                    </div>
                                )}
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}

            {/* Arbitration Modal */}
            {isArbitrationModalOpen && selectedGame && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsArbitrationModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleArbitrationSubmit}>
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-blue-500" />
                                            Asistencia y Arbitraje
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Marca a los niños que pagaron ($50). Los no marcados sumarán adeudo.</p>
                                    </div>
                                    <button type="button" onClick={() => setIsArbitrationModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    
                                    <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                        {playersInCategory.map(player => {
                                            const isPaid = arbData.paid_players.includes(player.id);
                                            return (
                                                <div 
                                                    key={player.id} 
                                                    onClick={() => toggleArbitrationPayment(player.id)}
                                                    className={clsx(
                                                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors",
                                                        isPaid ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div>
                                                        <div className={clsx("font-medium", isPaid ? "text-blue-800" : "text-slate-700")}>
                                                            {player.first_name} {player.last_name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {player.secondary_category === selectedGame.category ? 'Refuerzo' : 'Titular'}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={clsx(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                        isPaid ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 bg-white"
                                                    )}>
                                                        {isPaid && <Check className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {playersInCategory.length === 0 && (
                                            <div className="text-center py-10 text-slate-500">
                                                No hay jugadores en esta categoría.
                                            </div>
                                        )}
                                    </div>

                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                                    <div className="text-sm font-medium text-slate-600">
                                        Pagados: {arbData.paid_players.length} / {playersInCategory.length}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsArbitrationModalOpen(false)}
                                            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processingArb}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Guardar y Aplicar
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
