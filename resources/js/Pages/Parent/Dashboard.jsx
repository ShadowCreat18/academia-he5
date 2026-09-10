import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { User, MapPin, Phone, ShieldCheck, Trophy, Calendar, Trash2, AlertTriangle, Info, X, Camera } from 'lucide-react';
import ParentLayout from '@/Layouts/ParentLayout';
import CameraCapture from '@/Components/CameraCapture';

export default function Dashboard({ auth, needsConsent = false, nextGame = null, childrenCount = 0, deletionRequest = null }) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(needsConsent);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
    const [deletionReason, setDeletionReason] = useState('');

    const profileForm = useForm({
        address: auth.user.address || '',
        phone: auth.user.phone || '',
        photo: null,
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.post(route('parent.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setIsEditingProfile(false),
        });
    };

    const handleAcceptConsent = () => {
        router.post(route('parent.accept-consent'), {}, {
            preserveScroll: true,
            onSuccess: () => setIsConsentModalOpen(false)
        });
    };

    const handleRequestDeletion = () => {
        router.post(route('parent.request-deletion'), { reason: deletionReason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeletionModalOpen(false);
                setDeletionReason('');
            }
        });
    };

    const handleCancelDeletion = () => {
        if (confirm('¿Estás seguro de que deseas cancelar tu solicitud de eliminación de datos?')) {
            router.delete(route('parent.cancel-deletion'), { preserveScroll: true });
        }
    };

    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        return new Date(dateStr.replace('T', ' ').replace('Z', '').substring(0, 16));
    };

    return (
        <ParentLayout title="Mi Portal">

            {/* Aviso de Privacidad Modal Bloqueante */}
            {isConsentModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 text-center">Aviso de Privacidad y Uso de Datos</h3>
                                <p className="text-center text-sm text-slate-500 mt-1">Academia de Fútbol HE-5 · Zacatecas, México</p>
                            </div>
                            <div className="p-6">
                                <div className="prose prose-sm text-slate-600 space-y-3 max-h-72 overflow-y-auto pr-2">
                                    <p>Conforme a la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, al aceptar confirmas que eres tutor legal del menor registrado y autorizas a la <strong>Academia de Fútbol HE-5</strong> a almacenar y procesar los siguientes datos:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Nombre completo del tutor y del jugador</li>
                                        <li>Fecha de nacimiento y CURP del jugador</li>
                                        <li>Número de teléfono y dirección del tutor</li>
                                        <li>Fotografías de perfil del tutor y del jugador</li>
                                    </ul>
                                    <p><strong>Finalidad:</strong></p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Organización interna de equipos, categorías y partidos</li>
                                        <li>Comunicación sobre asuntos deportivos vía WhatsApp</li>
                                        <li>Gestión de pagos y estados de cuenta</li>
                                        <li>Identificación del jugador en partidos y torneos oficiales</li>
                                    </ul>
                                    <p><strong>Cookies:</strong> Esta plataforma utiliza únicamente cookies técnicas de sesión necesarias para el funcionamiento del sistema. No usamos cookies de rastreo ni publicidad.</p>
                                    <p><strong>Tus derechos (ARCO):</strong> Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos. Puedes ejercerlos desde tu perfil en esta plataforma.</p>
                                    <p className="text-xs text-slate-400">Tus datos no serán vendidos ni compartidos con terceros ajenos a la academia o las ligas en las que participamos.</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={handleAcceptConsent} className="w-full sm:w-auto px-6 py-3 bg-[#E31837] text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md">
                                    He leído y Acepto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Términos y Condiciones Modal */}
            {isTermsModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTermsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Términos y Condiciones del Servicio</h3>
                                <button onClick={() => setIsTermsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-sm text-slate-700">
                                <p className="text-xs text-slate-400">Última actualización: Septiembre 2026 · Academia de Fútbol HE-5, Zacatecas, México</p>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">1. Servicio</h4>
                                    <p>La Academia de Fútbol HE-5 ofrece entrenamiento deportivo futbolístico para menores de edad en las categorías Diente de Leche y Pony, incluyendo acceso a esta plataforma digital de gestión para tutores.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">2. Inscripción y Mensualidad</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Las cuotas de inscripción y mensualidades son establecidas por la academia y pueden variar por temporada.</li>
                                        <li>El pago puntual es condición para la participación activa del jugador en partidos y eventos.</li>
                                        <li>La academia notificará con anticipación cualquier cambio en las tarifas.</li>
                                    </ul>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">3. Pagos en Línea</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Los pagos con tarjeta son procesados de forma segura a través de pasarelas de pago certificadas (Stripe / MercadoPago).</li>
                                        <li>La Academia de Fútbol HE-5 <strong>no almacena datos de tarjetas</strong> en sus servidores.</li>
                                        <li>Los pagos en efectivo se registran manualmente por el administrador.</li>
                                        <li>En caso de error en un cobro, contáctanos para resolverlo en un plazo máximo de 5 días hábiles.</li>
                                    </ul>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">4. Monedero (Saldo a Favor)</h4>
                                    <p>El saldo acumulado en el monedero de la plataforma solo puede utilizarse para el pago de mensualidades y conceptos dentro de la academia. No es reembolsable en efectivo.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">5. Comportamiento y Responsabilidades</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Los tutores son responsables de la conducta de sus hijos dentro y fuera de los entrenamientos.</li>
                                        <li>La academia puede suspender o dar de baja a un jugador por faltas graves o impago reiterado.</li>
                                    </ul>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">6. Fotografías e Imagen</h4>
                                    <p>Al inscribir a tu hijo, autorizas a la academia a fotografiarlo o filmarlo durante eventos deportivos con fines de comunicación interna y redes sociales. Si no deseas esto, infórmalo por escrito.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">7. Privacidad de Datos</h4>
                                    <p>El tratamiento de datos personales se rige por nuestro Aviso de Privacidad conforme a la LFPDPPP. Puedes solicitar la eliminación de tus datos en cualquier momento desde tu perfil.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-1">8. Modificaciones</h4>
                                    <p>La academia se reserva el derecho de modificar estos términos con previo aviso. El uso continuado de la plataforma implica aceptación de los términos vigentes.</p>
                                </section>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setIsTermsModalOpen(false)} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Solicitud de Eliminación Modal */}
            {isDeletionModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeletionModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <h3 className="text-lg font-bold text-red-800">Solicitar Eliminación de Datos</h3>
                                </div>
                                <button onClick={() => setIsDeletionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 space-y-4 text-sm text-slate-700">
                                <p>Conforme a la <strong>LFPDPPP</strong>, tienes derecho a solicitar la cancelación de tus datos personales. Al enviar esta solicitud:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                    <li>La academia procesará tu solicitud en un plazo de <strong>20 días hábiles</strong>.</li>
                                    <li>Se eliminarán tus datos personales y los de tus hijos de la plataforma.</li>
                                    <li>Los registros contables requeridos por ley se conservarán el tiempo mínimo necesario.</li>
                                    <li>Perderás acceso a la plataforma una vez procesada la solicitud.</li>
                                </ul>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo (opcional)</label>
                                    <textarea
                                        value={deletionReason}
                                        onChange={e => setDeletionReason(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-300 text-sm text-slate-900 bg-white p-2 focus:ring-2 focus:ring-red-400"
                                        placeholder="Puedes explicar brevemente el motivo de tu solicitud..."
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setIsDeletionModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
                                <button onClick={handleRequestDeletion} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">Enviar Solicitud</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {auth.user.profile_photo_path ? (
                                        <img src={`/storage/${auth.user.profile_photo_path}`} alt={auth.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-8 w-8 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{auth.user.name}</h2>
                                    <p className="text-sm text-slate-500">Tutor Legal</p>
                                </div>
                            </div>

                            {!isEditingProfile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-700">{auth.user.phone || 'No registrado'}</span>
                                    </div>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                                        <span className="text-slate-700">{auth.user.address || 'No registrada'}</span>
                                    </div>
                                    <button onClick={() => setIsEditingProfile(true)} className="w-full mt-4 px-4 py-2 text-sm text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        Editar Perfil
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitProfile} className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                            <input type="text" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm text-slate-900 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                                            <input type="text" value={profileForm.data.address} onChange={e => profileForm.setData('address', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm text-slate-900 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Foto de Perfil</label>
                                            <div className="flex items-center gap-3">
                                                <input type="file" accept="image/*" onChange={e => profileForm.setData('photo', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                                                <span className="text-xs text-slate-400 font-bold">O</span>
                                                <button type="button" onClick={() => setIsCameraOpen(true)} className="flex-shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-sm flex items-center gap-1.5 transition">
                                                    <Camera className="w-4 h-4" /> Cámara
                                                </button>
                                            </div>
                                            {profileForm.data.photo && <p className="text-xs text-green-600 mt-1">✓ Foto seleccionada lista para guardar.</p>}
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
                                            <button type="submit" disabled={profileForm.processing} className="px-4 py-2 text-sm bg-[#E31837] text-white font-medium rounded-lg hover:bg-red-700">Guardar</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Legal */}
                        <div className="border-t border-slate-100 px-6 py-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Legal</p>
                            <button onClick={() => setIsTermsModalOpen(true)} className="w-full text-left text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1.5 py-1">
                                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                Términos y Condiciones del Servicio
                            </button>
                            {deletionRequest && deletionRequest.status === 'pending' ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                                    <p className="text-xs text-amber-800 font-medium flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Solicitud de eliminación pendiente
                                    </p>
                                    <p className="text-xs text-amber-700">Enviada el {new Date(deletionRequest.created_at).toLocaleDateString('es-MX')}. Te contactaremos pronto.</p>
                                    <button onClick={handleCancelDeletion} className="text-xs text-amber-700 underline hover:text-amber-900">Cancelar solicitud</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsDeletionModalOpen(true)} className="w-full text-left text-xs text-red-500 hover:text-red-700 flex items-center gap-1.5 py-1">
                                    <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                                    Solicitar eliminación de mis datos
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a192f] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">¡Hola, {auth.user.name.split(' ')[0]}!</h2>
                            <p className="text-slate-300">Tienes <span className="font-bold text-white">{childrenCount}</span> jugador(es) registrado(s) en la academia.</p>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 opacity-10">
                            <Trophy className="h-48 w-48 -mr-10 -mt-10" />
                        </div>
                    </div>

                    {nextGame && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-start space-x-4">
                            <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                                <Calendar className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Próximo Partido</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    <span className="font-semibold text-slate-800">
                                        {parseLocalDate(nextGame.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </span><br />
                                    Rivales: {nextGame.opponent}<br />
                                    Lugar: {nextGame.location}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isCameraOpen && (
                <CameraCapture 
                    onCapture={(file) => {
                        profileForm.setData('photo', file);
                        setIsCameraOpen(false);
                    }}
                    onCancel={() => setIsCameraOpen(false)}
                />
            )}
        </ParentLayout>
    );
}
