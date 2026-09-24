import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Users, LogOut, DollarSign, Activity, FileText, Trophy, Wallet, Settings, AlertTriangle, MessageCircle, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard({ auth, categoriesStats = {}, validPayments = [], ...props }) {
    const categories = Object.keys(categoriesStats);
    const [activeTab, setActiveTab] = useState('General');

    // Extraer años disponibles de los pagos
    const availableYears = [...new Set(validPayments.map(p => new Date(p.created_at).getFullYear()))].sort((a,b) => b - a);
    const defaultYear = availableYears.length > 0 ? availableYears[0].toString() : new Date().getFullYear().toString();
    const [activeYear, setActiveYear] = useState(defaultYear);

    // Filtrar pagos por año y pestaña activa
    const filteredPayments = validPayments.filter(p => {
        const pYear = new Date(p.created_at).getFullYear().toString();
        if (pYear !== activeYear) return false;
        
        if (activeTab === 'General') return true;
        return p.player_category === activeTab;
    });

    // Calcular Datos Mensuales
    const monthlyIncome = {
        'Ene': 0, 'Feb': 0, 'Mar': 0, 'Abr': 0, 'May': 0, 'Jun': 0,
        'Jul': 0, 'Ago': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dic': 0
    };
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    filteredPayments.forEach(p => {
        const d = new Date(p.created_at);
        const monthStr = monthNames[d.getMonth()];
        monthlyIncome[monthStr] += parseFloat(p.amount || 0);
    });

    const monthlyChartData = Object.entries(monthlyIncome).map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }));

    // Calcular Datos del Pie Chart
    const distributionData = {};
    filteredPayments.forEach(p => {
        const firstWord = (p.concept || '').trim().split(' ')[0];
        const groupName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        
        if (!distributionData[groupName]) distributionData[groupName] = 0;
        distributionData[groupName] += parseFloat(p.amount || 0);
    });

    const pieChartData = Object.entries(distributionData)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => b.value - a.value);

    const currentStats = categoriesStats[activeTab] || { activePlayers: 0, income: 0, overdue: 0 };

    const topDebtors = props.topDebtors || [];
    const whatsappPhone = props.whatsappPhone || '4921226800';

    const PIE_COLORS = ['#0033A0', '#E31837', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

    const generateWhatsAppLink = (player) => {
        let parentPhone = player.parents && player.parents.length > 0 && player.parents[0].phone ? player.parents[0].phone : '';
        let cleanPhone = parentPhone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '52' + cleanPhone;
        
        const message = `⚽ ¡Hola! Nos comunicamos de HE-5 Academia. Queremos recordarte que la cuenta de ${player.first_name} presenta un saldo pendiente de $${Number(player.total_debt).toFixed(2)}. Si tienes dudas o quieres ver el desglose completo, ingresa al Portal para Padres. ¡Gracias!`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Admin Dashboard" />

            <nav className="bg-[#0033A0] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <span className="font-heading font-bold text-xl tracking-wider">HE-5 Admin</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <span className="font-medium">Hola, {auth?.user?.name || 'Admin'}</span>
                            <Link href="/profile" className="hover:text-blue-200 transition-colors" title="Mi Perfil">
                                <Settings className="w-5 h-5" />
                            </Link>
                            <Link href="/logout" method="post" as="button" className="hover:text-red-300 transition-colors" title="Cerrar Sesión">
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
                        <p className="text-slate-600 mt-2">Bienvenido al sistema de administración de la academia.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Link href="/players" className="flex-1 md:flex-none justify-center bg-[#E31837] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-md">
                            <Users className="w-5 h-5" />
                            <span>Jugadores</span>
                        </Link>
                        <Link href="/parents" className="flex-1 md:flex-none justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md">
                            <Users className="w-5 h-5" />
                            <span>Tutores</span>
                        </Link>
                        <Link href="/finances" className="flex-1 md:flex-none justify-center bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center space-x-2 shadow-md">
                            <Wallet className="w-5 h-5" />
                            <span>Finanzas</span>
                        </Link>
                        <Link href="/matches" className="flex-1 md:flex-none justify-center bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center space-x-2 shadow-md">
                            <Trophy className="w-5 h-5" />
                            <span>Partidos</span>
                        </Link>

                        <Link href="/settings" className="flex-1 md:flex-none justify-center bg-slate-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center space-x-2 shadow-md">
                            <Settings className="w-5 h-5" />
                            <span>Configuración</span>
                        </Link>
                    </div>
                </div>

                {/* ── Filtros (Año y Categoría) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    {categories.length > 0 && (
                        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2 sm:pb-0 w-full sm:w-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-colors ${
                                        activeTab === cat 
                                        ? 'bg-[#0033A0] text-white shadow-md' 
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {availableYears.length > 0 && (
                        <div className="flex items-center space-x-2 shrink-0">
                            <label className="text-sm font-bold text-slate-700">Año Gráficas:</label>
                            <select
                                value={activeYear}
                                onChange={(e) => setActiveYear(e.target.value)}
                                className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-semibold shadow-sm"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-[#0033A0] rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Jugadores Activos</p>
                            <p className="text-2xl font-bold text-slate-800">{currentStats.activePlayers}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Ingresos Totales</p>
                            <p className="text-2xl font-bold text-slate-800">${parseFloat(currentStats.income).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Cartera Vencida</p>
                            <p className="text-2xl font-bold text-slate-800">${parseFloat(currentStats.overdue).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Panel de Gráficas ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Gráfica de Ganancias Mensuales */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-800 mb-6">
                            <BarChart2 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold">Ganancias Mensuales</h3>
                        </div>
                        <div className="h-72">
                            {monthlyChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                                        <RechartsTooltip 
                                            cursor={{fill: '#f1f5f9'}}
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value) => [`$${value}`, 'Ingresos']}
                                        />
                                        <Bar dataKey="total" fill="#0033A0" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">Sin datos registrados este año</div>
                            )}
                        </div>
                    </div>

                    {/* Gráfica Circular de Conceptos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-800 mb-6">
                            <PieChartIcon className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-lg font-bold">Distribución de Ingresos (Conceptos)</h3>
                        </div>
                        <div className="h-72 flex items-center justify-center">
                            {pieChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value) => [`$${value}`, 'Total']}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">Sin datos de conceptos</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Panel de Alertas: Top Deudores ── */}
                {topDebtors.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Alertas de Cobranza (Top Deudores)</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="py-3 px-4 font-semibold text-sm text-slate-600">Jugador</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-slate-600">Categoría</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-slate-600">Tutor</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Adeudo</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {topDebtors.map(player => (
                                            <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 text-sm font-bold text-slate-800">
                                                    {player.first_name} {player.last_name}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600">
                                                    {player.category}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600">
                                                    {player.parents && player.parents.length > 0 ? player.parents[0].name : 'Sin Asignar'}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-red-600 text-right">
                                                    ${Number(player.total_debt).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {player.parents && player.parents.length > 0 && player.parents[0].phone ? (
                                                        <a
                                                            href={generateWhatsAppLink(player)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                                        >
                                                            <MessageCircle className="w-4 h-4 mr-1" />
                                                            Recordar
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Sin Teléfono</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
