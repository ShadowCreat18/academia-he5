import React from 'react';
import { Head } from '@inertiajs/react';
import { Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import ParentLayout from '@/Layouts/ParentLayout';

export default function Games({ upcomingGames = [], pastGames = [] }) {
    return (
        <ParentLayout title="Partidos">
            <div className="space-y-6">
                {/* Próximos Partidos */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            Próximos Partidos
                        </h3>
                    </div>
                    <div className="p-0">
                        {upcomingGames.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {upcomingGames.map(game => (
                                    <div key={game.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="mb-4 sm:mb-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {game.category}
                                                </span>
                                                <span className="text-sm font-medium text-blue-600">
                                                    {new Date(game.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {new Date(game.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-800">HE-5 vs {game.opponent}</h4>
                                            <div className="flex items-center text-slate-500 mt-2 text-sm">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {game.location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h4 className="text-slate-800 font-medium">No hay partidos próximos programados</h4>
                                <p className="text-slate-500 text-sm mt-1">Consulta con tu entrenador para más detalles.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Historial de Partidos */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                            Resultados Anteriores
                        </h3>
                    </div>
                    <div className="p-0">
                        {pastGames.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {pastGames.map(game => {
                                    const isWin = game.score_us > game.score_them;
                                    const isLoss = game.score_us < game.score_them;
                                    
                                    return (
                                        <div key={game.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                                <div className="mb-4 sm:mb-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                            {game.category}
                                                        </span>
                                                        <span className="text-sm text-slate-500">
                                                            {new Date(game.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-medium text-slate-800">HE-5 vs {game.opponent}</h4>
                                                </div>
                                                
                                                <div className="flex items-center space-x-4">
                                                    <div className={`px-4 py-2 rounded-xl text-center min-w-[80px] ${
                                                        isWin ? 'bg-green-100 text-green-800' : 
                                                        isLoss ? 'bg-red-100 text-red-800' : 
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        <div className="text-sm font-medium opacity-80 mb-0.5">MARCADOR</div>
                                                        <div className="text-2xl font-black">{game.score_us} - {game.score_them}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {game.goals && game.goals.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <p className="text-sm font-medium text-slate-700 mb-2">Goles en este partido:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {game.goals.map((goal, idx) => (
                                                            <div key={goal.id ?? idx} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                                                                <span className="text-sm text-slate-700 font-medium">
                                                                    {goal.player?.first_name} {goal.player?.last_name}
                                                                </span>
                                                                <span className="bg-green-100 text-green-800 rounded-full min-w-[22px] h-[22px] flex items-center justify-center text-xs font-bold px-1">
                                                                    ⚽ {goal.goals}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h4 className="text-slate-800 font-medium">Aún no hay resultados</h4>
                                <p className="text-slate-500 text-sm mt-1">Los resultados aparecerán aquí cuando finalicen los partidos.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
