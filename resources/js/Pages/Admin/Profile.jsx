import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, User as UserIcon, Lock, Loader2, Key, LogOut, ArrowLeft, Settings } from 'lucide-react';

export default function Profile({ auth, flash }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: auth.user.name,
        username: auth.user.username,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                if (isEditingPassword) {
                    reset('current_password', 'password', 'password_confirmation');
                    setIsEditingPassword(false);
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head title="Mi Perfil" />

            <nav className="bg-[#0033A0] text-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <span className="font-heading font-bold text-xl tracking-wider">HE-5 Admin</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <span className="hidden sm:inline font-medium">Hola, {auth?.user?.name || 'Admin'}</span>
                            <Link href="/dashboard" className="hidden sm:flex items-center space-x-2 hover:text-blue-200 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span>Volver</span>
                            </Link>
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

            <main className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl font-medium">
                            ✅ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium">
                            ⚠️ {flash.error}
                        </div>
                    )}

                    {/* Tarjeta Principal */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Ajustes de Perfil</h3>
                                <p className="text-sm text-slate-500">Actualiza tu información personal y credenciales de acceso.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            
                            {/* Datos Básicos */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de Usuario</label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={e => setData('username', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Seguridad (Contraseña) */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                        <h4 className="font-bold text-slate-800">Seguridad</h4>
                                    </div>
                                    {!isEditingPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingPassword(true)}
                                            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Key className="w-4 h-4" /> Cambiar Contraseña
                                        </button>
                                    )}
                                </div>

                                {isEditingPassword && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                value={data.current_password}
                                                onChange={e => setData('current_password', e.target.value)}
                                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            />
                                            {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Nueva Contraseña</label>
                                                <input
                                                    type="password"
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                />
                                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Contraseña</label>
                                                <input
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={e => setData('password_confirmation', e.target.value)}
                                                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingPassword(false);
                                                    reset('current_password', 'password', 'password_confirmation');
                                                    clearErrors('current_password', 'password');
                                                }}
                                                className="text-sm font-medium text-slate-500 hover:text-slate-700"
                                            >
                                                Cancelar cambio de contraseña
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón Guardar */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Guardar Perfil
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
