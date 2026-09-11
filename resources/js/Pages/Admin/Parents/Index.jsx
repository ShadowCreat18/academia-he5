import React, { useState, useMemo } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Users, Search, Edit2, Key, Trash2, X, Phone, User as UserIcon, Camera, Save, Loader2, DollarSign, LogOut, ArrowLeft, Settings } from 'lucide-react';

export default function Index({ auth, parents, flash }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [editingParent, setEditingParent] = useState(null);

    const categories = useMemo(() => {
        const cats = new Set();
        parents.forEach(parent => {
            if (parent.players) {
                parent.players.forEach(child => {
                    if (child.category) cats.add(child.category);
                });
            }
        });
        return Array.from(cats).sort();
    }, [parents]);

    const tabs = ['Todas', ...categories];

    const editForm = useForm({
        name: '',
        username: '',
        phone: '',
        password: '',
    });

    const filteredParents = parents.filter(parent => {
        const matchesSearch = 
            parent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            parent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (parent.phone && parent.phone.includes(searchTerm)) ||
            (parent.players && parent.players.some(child => 
                `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        const matchesCategory = filterCategory === 'Todas' || 
            (parent.players && parent.players.some(child => child.category === filterCategory));

        return matchesSearch && matchesCategory;
    });

    const handleEditClick = (parent) => {
        setEditingParent(parent);
        editForm.setData({
            name: parent.name,
            username: parent.username,
            phone: parent.phone || '',
            password: '', // Leave blank unless they want to change it
        });
        editForm.clearErrors();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('parents.update', editingParent.id), {
            onSuccess: () => {
                setEditingParent(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (parent) => {
        if (confirm(`¿Estás seguro de que deseas eliminar al tutor "${parent.name}"? Esta acción no se puede deshacer y fallará si tienen historial de cobros.`)) {
            router.delete(route('parents.destroy', parent.id), {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head title="Tutores" />

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
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

                    {/* Header y Buscador */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Tutores ({parents.length})</h1>
                                <p className="text-sm text-slate-500">Administra los accesos y datos de los padres de familia.</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar tutor o hijo..."
                                    className="pl-10 w-full md:w-64 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm text-slate-900 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Pestañas de Categoría ── */}
                    {!searchTerm && tabs.length > 1 && (
                        <div className="flex overflow-x-auto hide-scrollbar space-x-2 mb-6 pb-2">
                            {tabs.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-colors ${
                                        filterCategory === cat 
                                        ? 'bg-[#0033A0] text-white shadow-md' 
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tabla de Tutores */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Tutor
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Jugadores Asignados
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Saldo Monedero
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredParents.length > 0 ? (
                                        filteredParents.map((parent) => (
                                            <tr key={parent.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {parent.profile_photo_path ? (
                                                                <img className="h-10 w-10 rounded-full object-cover border-2 border-slate-200" src={`/storage/${parent.profile_photo_path}`} alt="" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 text-slate-400">
                                                                    <UserIcon className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-slate-900">{parent.name}</div>
                                                            <div className="text-sm text-slate-500">Usuario: {parent.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900 flex items-center gap-1.5">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        {parent.phone || <span className="text-slate-400 italic">No registrado</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {parent.players && parent.players.length > 0 ? (
                                                            parent.players.map(player => (
                                                                <span key={player.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {player.first_name} {player.last_name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Ninguno</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        parseFloat(parent.saldo_disponible) > 0 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                        {parseFloat(parent.saldo_disponible || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(parent)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition"
                                                            title="Editar Perfil / Contraseña"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(parent)}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Users className="h-12 w-12 text-slate-300 mb-3" />
                                                    <p className="text-lg font-medium text-slate-900">No se encontraron tutores</p>
                                                    <p className="text-sm">Ajusta tu búsqueda o registra a un nuevo jugador para agregar a sus padres.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            {/* Modal de Edición */}
            {editingParent && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingParent(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Editar Tutor: {editingParent.name}</h3>
                                </div>
                                <button onClick={() => setEditingParent(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6">
                                {/* Información del perfil y foto */}
                                <div className="flex gap-6 mb-6">
                                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                        <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg relative flex items-center justify-center">
                                            {editingParent.profile_photo_path ? (
                                                <img src={`/storage/${editingParent.profile_photo_path}`} alt="Perfil" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-12 h-12 text-slate-300" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">Foto de Perfil</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={e => editForm.setData('name', e.target.value)}
                                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"
                                            />
                                            {editForm.errors.name && <p className="text-red-500 text-xs mt-1">{editForm.errors.name}</p>}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de Usuario</label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.username}
                                                    onChange={e => editForm.setData('username', e.target.value)}
                                                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"
                                                />
                                                {editForm.errors.username && <p className="text-red-500 text-xs mt-1">{editForm.errors.username}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.phone}
                                                    onChange={e => editForm.setData('phone', e.target.value)}
                                                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"
                                                    placeholder="Ej. 6141234567 o +593960957979"
                                                />
                                                {editForm.errors.phone && <p className="text-red-500 text-xs mt-1">{editForm.errors.phone}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Zona de peligro / Cambio de Contraseña */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        <Key className="w-4 h-4 text-slate-500" />
                                        Forzar Cambio de Contraseña
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Si el papá no puede entrar a su cuenta, puedes asignarle una nueva contraseña aquí. Déjalo en blanco si no quieres cambiarla.
                                    </p>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Nueva contraseña (mínimo 8 caracteres)"
                                            value={editForm.data.password}
                                            onChange={e => editForm.setData('password', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-slate-900"
                                            autoComplete="off"
                                        />
                                        {editForm.errors.password && <p className="text-red-500 text-xs mt-1">{editForm.errors.password}</p>}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingParent(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {editForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
}
