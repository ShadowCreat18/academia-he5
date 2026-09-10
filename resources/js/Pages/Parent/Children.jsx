import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Users, SquarePen, User, ShieldCheck } from 'lucide-react';
import ParentLayout from '@/Layouts/ParentLayout';

export default function Children({ children = [] }) {
    const [editingChild, setEditingChild] = useState(null);

    const childForm = useForm({
        first_name: '',
        last_name: '',
        birth_date: '',
        curp: '',
        category: '',
        jersey_number: '',
    });

    const openChildEdit = (child) => {
        setEditingChild(child);
        childForm.setData({
            first_name: child.first_name,
            last_name: child.last_name,
            birth_date: child.birth_date ? child.birth_date.substring(0, 10) : '',
            curp: child.curp || '',
            category: child.category || '',
            jersey_number: child.jersey_number || '',
        });
    };

    const submitChildEdit = (e) => {
        e.preventDefault();
        childForm.put(route('parent.child.update', editingChild.id), {
            preserveScroll: true,
            onSuccess: () => setEditingChild(null),
        });
    };

    return (
        <ParentLayout title="Mis Jugadores">
            {/* Modal Editar Niño */}
            {editingChild && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setEditingChild(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative">
                            <form onSubmit={submitChildEdit}>
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800">Editar Datos del Jugador</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingChild(null)}
                                        className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"
                                    >
                                        <span className="sr-only">Cerrar</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={childForm.data.first_name}
                                                onChange={e => childForm.setData('first_name', e.target.value)}
                                                className="w-full rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-500 text-slate-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={childForm.data.last_name}
                                                onChange={e => childForm.setData('last_name', e.target.value)}
                                                className="w-full rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-500 text-slate-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                                            <input 
                                                type="date" 
                                                value={childForm.data.birth_date}
                                                onChange={e => childForm.setData('birth_date', e.target.value)}
                                                className="w-full rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-500 text-slate-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">CURP</label>
                                            <input 
                                                type="text" 
                                                value={childForm.data.curp}
                                                onChange={e => childForm.setData('curp', e.target.value.toUpperCase())}
                                                maxLength={18}
                                                placeholder="18 caracteres"
                                                className="w-full rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-500 text-slate-900 bg-white uppercase placeholder:normal-case"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría Actual</label>
                                        <input 
                                            type="text" 
                                            value={childForm.data.category}
                                            onChange={e => childForm.setData('category', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-500 text-slate-900 bg-white"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Modifica esto solo si el niño cambió de categoría.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">No. Uniforme</label>
                                        <input 
                                            type="number" 
                                            value={childForm.data.jersey_number}
                                            onChange={e => childForm.setData('jersey_number', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-500 text-slate-900 bg-white"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setEditingChild(null)}
                                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={childForm.processing}
                                            className="px-6 py-2 bg-[#E31837] text-white font-medium hover:bg-red-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
                                        >
                                            {childForm.processing ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {children.map((child) => (
                        <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                            {/* Card Header (Photo & Name) */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-200 flex-shrink-0 relative">
                                        {child.photo_path ? (
                                            <>
                                                <img 
                                                    src={`/storage/${child.photo_path}`} 
                                                    alt={child.first_name} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 absolute inset-0" style={{display: 'none'}}>
                                                    <User size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500">
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{child.first_name} {child.last_name}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                            {child.category}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openChildEdit(child)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Editar datos del jugador"
                                >
                                    <SquarePen className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Card Body (Details) */}
                            <div className="p-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <span className="text-slate-500">CURP</span>
                                        <span className="font-medium text-slate-800">{child.curp || 'No registrada'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <span className="text-slate-500">Nacimiento</span>
                                        <span className="font-medium text-slate-800">
                                            {child.birth_date ? child.birth_date.substring(0, 10).split('-').reverse().join('/') : 'No registrada'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">No. Uniforme</span>
                                        <span className="font-medium text-slate-800">{child.jersey_number || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes jugadores vinculados</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Al parecer aún no se ha vinculado a tus hijos a esta cuenta. Por favor, comunícate con la administración de la academia para que realicen la vinculación.
                    </p>
                </div>
            )}
        </ParentLayout>
    );
}
