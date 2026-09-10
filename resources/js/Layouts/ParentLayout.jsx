import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { User, Users, Wallet, Calendar, LogOut } from 'lucide-react';

export default function ParentLayout({ children, title }) {
    const { auth } = usePage().props;
    const { url } = usePage();

    const navigation = [
        { name: 'Inicio', href: '/parent/dashboard', icon: User, current: url === '/parent/dashboard' },
        { name: 'Jugadores', href: '/parent/children', icon: Users, current: url.startsWith('/parent/children') },
        { name: 'Finanzas', href: '/parent/finances', icon: Wallet, current: url.startsWith('/parent/finances') },
        { name: 'Partidos', href: '/parent/games', icon: Calendar, current: url.startsWith('/parent/games') },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row pb-16 md:pb-0">
            <Head title={title} />
            
            {/* Sidebar Desktop */}
            <aside className="w-64 bg-[#0a192f] text-white flex-col hidden md:flex sticky top-0 h-screen">
                <div className="p-6">
                    <img src="/images/he5-shield-logo.png" alt="HE-5 Logo" className="h-16 mb-4 object-contain" />
                    <h2 className="text-xl font-bold">Portal de Padres</h2>
                    <p className="text-sm text-slate-400 mt-1">{auth.user.name}</p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                                    item.current ? 'bg-[#E31837] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="p-4 border-t border-slate-700">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-white/10 rounded-xl hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-[#0a192f] text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
                <div className="flex items-center space-x-3">
                    <img src="/images/he5-shield-logo.png" alt="HE-5 Logo" className="h-8 object-contain bg-white rounded-full p-1" />
                    <h1 className="font-bold">{title}</h1>
                </div>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="text-slate-300 hover:text-white"
                >
                    <LogOut className="w-5 h-5" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden relative">
                {/* Desktop Top Bar */}
                <header className="bg-white shadow-sm border-b border-slate-200 hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-30">
                    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                    {auth.user.saldo_disponible !== undefined && (
                        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                            <Wallet className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Monedero: ${parseFloat(auth.user.saldo_disponible).toFixed(2)}</span>
                        </div>
                    )}
                </header>
                
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Nav Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
                                item.current ? 'text-[#E31837]' : 'text-slate-500'
                            }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${item.current ? 'fill-red-50' : ''}`} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
