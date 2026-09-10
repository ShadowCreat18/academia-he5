import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Shield, Mail, Lock } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[32rem] bg-[#0033A0] transform -skew-y-6 -translate-y-20 z-0"></div>
            
            <Head title="Iniciar Sesión - HE-5" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex justify-center items-center group">
                    <div className="w-48 h-48 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                        <img src="/images/he5-shield-logo.png" alt="HE-5 Logo" className="w-full h-full object-contain filter drop-shadow-2xl" />
                    </div>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-heading font-black text-white tracking-wider drop-shadow-md">
                    HE-5 ZACATECAS
                </h2>
                <p className="mt-2 text-center text-sm text-blue-100 font-medium drop-shadow">
                    Portal Administrativo y de Padres
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700">
                                Nombre de Usuario
                            </label>
                            <div className="mt-2 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-300' : 'border-slate-300'} rounded-xl focus:ring-[#0033A0] focus:border-[#0033A0] sm:text-sm text-slate-900 bg-slate-50`}
                                    placeholder="Usuario"
                                    required
                                />
                            </div>
                            {errors.username && <p className="mt-2 text-sm text-red-600 font-medium">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700">
                                Contraseña
                            </label>
                            <div className="mt-2 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-[#0033A0] focus:border-[#0033A0] sm:text-sm text-slate-900 bg-slate-50"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#E31837] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Verificando...' : 'Entrar al Portal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
