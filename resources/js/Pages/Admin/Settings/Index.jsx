import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Settings, LogOut, ArrowLeft, Save, Trash2, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

export default function Index({ auth, settings, deletionRequests = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        settingsList: settings.map(s => ({ ...s }))
    });

    const addSetting = () => {
        const newKey = 'custom_' + Date.now();
        setData('settingsList', [...data.settingsList, { key: newKey, name: 'Nuevo Concepto', value: '0', type: 'string' }]);
    };

    const updateSetting = (index, field, val) => {
        const newList = [...data.settingsList];
        newList[index][field] = val;
        setData('settingsList', newList);
    };

    const removeSetting = (index) => {
        const newList = [...data.settingsList];
        newList.splice(index, 1);
        setData('settingsList', newList);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'), {
            data: { settings: data.settingsList },
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Configuración" />

            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href={route('dashboard')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="flex items-center">
                                <Settings className="w-8 h-8 text-[#0033A0]" />
                                <span className="ml-2 text-xl font-black text-slate-800 tracking-tight">Configuración</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-slate-600 hidden sm:block">{auth.user.name}</span>
                            <Link href={route('logout')} method="post" as="button" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800">Costos y Valores por Defecto</h2>
                        <p className="text-sm text-slate-500 mt-1">Estos valores se usarán al generar nuevos cobros masivos e individuales en la sección de Finanzas.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.settingsList.map((setting, index) => (
                                <div key={setting.key} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <input 
                                                type="text" 
                                                value={setting.name} 
                                                onChange={e => updateSetting(index, 'name', e.target.value)}
                                                className="w-full text-sm border-slate-300 rounded-lg focus:ring-[#0033A0] focus:border-[#0033A0] shadow-sm mb-1 text-slate-900"
                                            />
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-slate-400 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={setting.value}
                                                onChange={e => updateSetting(index, 'value', e.target.value)}
                                                className="w-full pl-7 pr-4 py-2 text-slate-900 border-slate-300 rounded-xl focus:ring-[#0033A0] focus:border-[#0033A0] shadow-sm"
                                            />
                                        </div>
                                    </div>
                                        <button type="button" onClick={() => removeSetting(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <button type="button" onClick={addSetting} className="text-sm font-bold text-[#0033A0] hover:text-blue-800 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Agregar nuevo concepto
                            </button>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-[#0033A0] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0033A0] disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Solicitudes de Eliminación de Datos */}
            {deletionRequests.length > 0 && (
                <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Solicitudes de Eliminación de Datos</h2>
                                <p className="text-sm text-slate-500">Derecho ARCO — LFPDPPP</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {deletionRequests.map(req => (
                                <div key={req.id} className={`rounded-xl border p-4 ${
                                    req.status === 'pending'   ? 'border-amber-200 bg-amber-50' :
                                    req.status === 'completed' ? 'border-green-200 bg-green-50' :
                                                                  'border-slate-200 bg-slate-50'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-800">{req.user?.name}</p>
                                            <p className="text-xs text-slate-500">{req.user?.email}</p>
                                            {req.reason && <p className="text-sm text-slate-600 mt-1 italic">"{req.reason}"</p>}
                                            <p className="text-xs text-slate-400 mt-1">
                                                Solicitado: {new Date(req.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            {req.processed_by && (
                                                <p className="text-xs text-slate-400">Procesado por: {req.processed_by}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {req.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                                    <Clock className="w-3 h-3" /> Pendiente
                                                </span>
                                            )}
                                            {req.status === 'completed' && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3" /> Procesada
                                                </span>
                                            )}
                                            {req.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                                    <XCircle className="w-3 h-3" /> Rechazada
                                                </span>
                                            )}
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2 mt-1">
                                                    <button
                                                        onClick={() => router.post(route('settings.deletion-requests.process', req.id), { action: 'completed' }, { preserveScroll: true })}
                                                        className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        Marcar Completada
                                                    </button>
                                                    <button
                                                        onClick={() => router.post(route('settings.deletion-requests.process', req.id), { action: 'rejected' }, { preserveScroll: true })}
                                                        className="text-xs px-3 py-1 bg-slate-500 text-white rounded-lg hover:bg-slate-600"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
