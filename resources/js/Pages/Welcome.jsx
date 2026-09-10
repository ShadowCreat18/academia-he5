import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Trophy, Calendar, MapPin, Shield, Star, Medal, ArrowRight, Camera, ArrowDown, Phone, Mail, X } from 'lucide-react';

const TiltCard = ({ children, className = "" }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
    
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div style={{ perspective: 1200 }} className={`w-full h-full ${className}`}>
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full h-full relative"
            >
                {/* Cristal Holográfico Layer */}
                <div 
                    style={{ transform: "translateZ(30px)" }} 
                    className="absolute inset-0 pointer-events-none rounded-3xl z-10 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 mix-blend-overlay transition-opacity"
                ></div>
                {children}
            </motion.div>
        </div>
    );
};

export default function Welcome() {
    const [scrolled, setScrolled] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const CrystalBallLogo = ({ className = "w-16 h-16 md:w-20 md:h-20" }) => (
        <div className={`relative group perspective-1000 ${className}`}>
            <div className="absolute inset-0 bg-white rounded-full shadow-[inset_0_0_20px_rgba(0,51,160,0.4),0_8px_16px_rgba(0,0,0,0.3)] border-2 border-white/80 transform transition-transform duration-500 group-hover:scale-110 flex items-center justify-center overflow-hidden">
                <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/90 to-transparent rounded-t-full z-10 pointer-events-none opacity-90"></div>
                
                <img 
                    src="/images/he5-shield-logo.png" 
                    alt="HE-5 Logo" 
                    className="w-[85%] h-[85%] object-contain mix-blend-multiply opacity-100 relative z-0 transform group-hover:scale-105 transition-transform duration-500"
                    style={{ filter: 'contrast(1.1) saturate(1.2)' }}
                />
                
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0033A0]/30 via-transparent to-transparent rounded-b-full pointer-events-none z-10"></div>
            </div>
        </div>
    );

    const timelineData = [
        {
            year: "1979",
            title: "Debut en 1ra División",
            team: "Deportivo Toluca",
            desc: "Inició su legendaria carrera como delantero, demostrando velocidad, técnica y una inmensa proyección.",
            icon: <Star />
        },
        {
            year: "1980s",
            title: "La Consagración",
            team: "Tampico Madero & Cruz Azul",
            desc: "Evolucionó hacia la defensa convirtiéndose en uno de los mejores laterales izquierdos de México. Con la 'Máquina Celeste' de Cruz Azul vivió su época dorada, siendo un líder nato, portando el gafete de Capitán y logrando disputar intensas finales.",
            icon: <Shield />
        },
        {
            year: "1987 - 1990",
            title: "Orgullo Nacional",
            team: "Selección Mexicana",
            desc: "Defendió la verde en múltiples ocasiones. Desde su participación en el Mundial Juvenil de Japón 1979 hasta ser convocado asiduamente a la Selección Mayor y Capitán de la Sub-23.",
            icon: <Medal />
        },
        {
            year: "1996",
            title: "El Cierre de un Ciclo",
            team: "Santos Laguna",
            desc: "Tras 18 temporadas consecutivas de entrega, disciplina y pasión en el máximo circuito, culminó su extraordinaria trayectoria como jugador activo, dejando un legado intachable.",
            icon: <Trophy />
        }
    ];

    const galleryData = Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        img: `historica-${i + 1}.jpg`,
        caption: ""
    }));

    const playersData = Array.from({ length: 16 }, (_, i) => ({
        id: `player-${i + 1}`,
        img: `jugadores-${i + 1}.jpg`,
        caption: ""
    }));

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#E31837] selection:text-white overflow-x-hidden">
            
            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0033A0]/95 backdrop-blur-md shadow-xl py-2 border-b border-white/20' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 cursor-pointer">
                            <CrystalBallLogo className="w-14 h-14 md:w-16 md:h-16" />
                            <span className="font-heading font-extrabold text-2xl tracking-widest text-white drop-shadow-md">
                                HE-5
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <a href="#historia" className="hidden md:block text-white hover:text-[#E31837] transition-colors font-bold text-sm tracking-wide uppercase drop-shadow-sm">La Leyenda</a>
                            <a href="#schedule" className="hidden md:block text-white hover:text-[#E31837] transition-colors font-bold text-sm tracking-wide uppercase drop-shadow-sm">Horarios</a>
                            <Link href="/login" className="relative group overflow-hidden bg-white text-[#0033A0] px-4 py-2 md:px-6 md:py-2.5 rounded-full font-black shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:bg-gray-100 text-xs md:text-base whitespace-nowrap">
                                <span className="relative z-10 flex items-center">
                                    <Shield className="w-4 h-4 mr-1 md:mr-2" />
                                    <span className="hidden md:inline">Ingresar al Portal</span>
                                    <span className="md:hidden">Ingresar</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section (Cruz Azul Theme) */}
            <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#0033A0]">
                {/* 3D Dynamic Background */}
                <div className="absolute inset-0 z-0 perspective-1000">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0047D4] via-[#0033A0] to-[#001b57] opacity-100"></div>
                    
                    {/* Cruz Azul Elements */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#E31837] opacity-[0.08] rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/3"></div>
                    
                    {/* Grid Floor */}
                    <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:rotateX(60deg)] origin-bottom opacity-30"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <CrystalBallLogo className="w-40 h-40 md:w-56 md:h-56 mx-auto drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-tight mb-4 drop-shadow-xl uppercase"
                    >
                        Escuela de Fútbol <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 text-6xl md:text-8xl">HE-5</span>
                    </motion.h1>
                    
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "200px" }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-1.5 bg-[#E31837] mx-auto rounded-full mb-6"
                    ></motion.div>

                    <motion.p 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-xl md:text-3xl text-blue-100 font-medium italic max-w-3xl mx-auto drop-shadow-md text-center px-4"
                    >
                        Fundada por la Leyenda: <strong className="text-white">Héctor Esparza</strong>
                    </motion.p>
                    
                    <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <a href="#historia" className="group flex items-center justify-center bg-[#E31837] text-white font-bold px-8 py-4 rounded-full transition-all hover:bg-red-700 hover:scale-105 shadow-[0_0_20px_rgba(227,24,55,0.4)]">
                            Descubre la Leyenda
                            <ArrowDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Timeline Section */}
            <div id="historia" className="py-24 relative bg-white overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-lg font-bold tracking-[0.2em] text-[#E31837] uppercase mb-3 flex items-center justify-center">
                            <Shield className="w-5 h-5 mr-2" /> Trayectoria Profesional
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-heading font-black text-[#0033A0]">Historia de una Leyenda</h3>
                    </motion.div>
                    
                    <div className="relative">
                        {/* Línea Central */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-gradient-to-b from-[#0033A0] via-[#E31837] to-[#0033A0] rounded-full opacity-20"></div>

                        <div className="space-y-16">
                            {timelineData.map((item, index) => (
                                <div key={index} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    
                                    {/* Icono Central */}
                                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full border-4 border-white bg-[#0033A0] text-white items-center justify-center shadow-xl z-20">
                                        {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                                    </div>

                                    {/* Contenido (Tarjeta 3D) */}
                                    <div className={`w-full md:w-5/12 flex justify-center ${index % 2 === 0 ? 'md:justify-start md:pl-12' : 'md:justify-end md:pr-12'}`}>
                                        <TiltCard className="w-full">
                                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0033A0] to-[#E31837] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                                <h4 className="text-5xl font-black text-gray-100 absolute top-4 right-4 z-0 pointer-events-none select-none">{item.year}</h4>
                                                <div className="relative z-10">
                                                    <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-[#0033A0] font-bold text-sm mb-4 border border-blue-100">
                                                        {item.team}
                                                    </span>
                                                    <h3 className="text-2xl font-bold text-slate-800 mb-4">{item.title}</h3>
                                                    <p className="text-slate-600 text-justify leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        </TiltCard>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Galería 3D */}
            <div className="py-24 bg-slate-900 relative border-y-4 border-[#E31837]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-lg font-bold tracking-[0.2em] text-[#E31837] uppercase mb-3 flex items-center justify-center">
                            <Camera className="w-5 h-5 mr-2" /> Galería Histórica
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-heading font-black text-white">Memorias en la Cancha</h3>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {galleryData.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 6) * 0.1 }}
                                onClick={() => setSelectedImg(item)}
                                className="cursor-pointer h-48 md:h-64"
                            >
                                <TiltCard className="w-full h-full">
                                    <div className="w-full h-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-white/10 group">
                                        {/* Placeholder de Foto - Aquí cargarán las imágenes reales cuando existan */}
                                        <div className="absolute inset-0 bg-[#0033A0]/20 flex flex-col items-center justify-center p-8 group-hover:scale-110 transition-transform duration-700">
                                            <div className="w-full h-full border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white/50 relative overflow-hidden bg-black/40">
                                                <img 
                                                    src={`/images/${item.img}`} 
                                                    alt={item.caption}
                                                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                                    onError={(e) => { e.target.style.opacity = 0; }}
                                                    onLoad={(e) => { e.target.parentElement.querySelector('div').style.display = 'none'; }}
                                                />
                                                <div className="flex flex-col items-center text-center">
                                                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                                                    <span className="font-bold text-sm">Espacio para Foto</span>
                                                    <span className="text-xs">{item.img}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {item.caption && (
                                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                <p className="text-white font-heading font-bold text-lg">{item.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Horarios e Información de la Escuela */}
            <div id="schedule" className="py-24 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-lg font-bold tracking-[0.2em] text-[#0033A0] uppercase mb-3 flex items-center justify-center">
                            <Calendar className="w-5 h-5 mr-2" /> Entrenamientos
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-heading font-black text-slate-800">Forjando el Futuro</h3>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {/* Info Cards */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0033A0]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                            <Calendar className="w-12 h-12 text-[#0033A0] mb-6" />
                            <h4 className="text-2xl font-bold text-slate-800 mb-4">Horarios</h4>
                            <ul className="space-y-4 text-slate-600 text-sm">
                                <li className="border-l-4 border-[#0033A0] pl-3">
                                    <strong className="text-[#0033A0] block text-base">Lunes y Miércoles (Cancha Chica)</strong>
                                    4:30 a 6:00 pm - Diente de Leche (8 y 9 años) y Pony (10 y 11 años)<br/>
                                    6:00 a 7:00 pm - Asquel, Biberón y menores (7 años y menores)
                                </li>
                                <li className="border-l-4 border-[#E31837] pl-3">
                                    <strong className="text-[#E31837] block text-base">Martes (Cancha Chica)</strong>
                                    4:30 a 6:00 pm - Asquel, Biberón y menores (7 años y menores), y Porteros
                                </li>
                                <li className="border-l-4 border-slate-800 pl-3">
                                    <strong className="text-slate-800 block text-base">Jueves (Cancha Grande)</strong>
                                    4:30 a 6:00 pm - Diente de Leche y Pony
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#0033A0] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group text-white"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                            <Shield className="w-12 h-12 text-white mb-6" />
                            <h4 className="text-2xl font-bold mb-4">Nuestros Valores</h4>
                            <p className="text-blue-100 leading-relaxed text-justify">
                                Fomentamos el trabajo en equipo, la disciplina, el respeto y la pasión por el deporte. Más que jugadores, formamos personas con mentalidad ganadora tanto dentro como fuera de la cancha.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E31837]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                            <Trophy className="w-12 h-12 text-[#E31837] mb-6" />
                            <h4 className="text-2xl font-bold text-slate-800 mb-4">Cuerpo Técnico</h4>
                            <p className="text-slate-600 leading-relaxed text-justify mb-4">
                                Entrenamientos dirigidos por <strong className="text-slate-800">Ex-Jugadores Profesionales</strong>.
                            </p>
                            <p className="text-sm text-slate-500 italic">
                                Transmitiendo la experiencia directa de la Primera División a las nuevas generaciones de Zacatecas.
                            </p>
                        </motion.div>
                    </div>

                    {/* Galería de Jugadores (Mosaico) */}
                    <div className="mb-20">
                        <div className="text-center mb-10">
                            <h4 className="text-3xl font-heading font-black text-slate-800">Futuras Estrellas en Acción</h4>
                            <p className="text-slate-500 mt-2">Nuestros talentos durante sus sesiones de entrenamiento</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {playersData.map((item, i) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i % 4) * 0.1 }}
                                    onClick={() => setSelectedImg(item)}
                                    className="cursor-pointer group relative rounded-2xl overflow-hidden h-48 md:h-56 shadow-md hover:shadow-xl transition-all"
                                >
                                    <div className="absolute inset-0 bg-[#0033A0]/10 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img 
                                        src={`/images/${item.img}`} 
                                        alt="Jugador entrenando"
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { e.target.style.opacity = 0; }}
                                        onLoad={(e) => { e.target.style.opacity = 1; e.target.parentElement.querySelector('.placeholder-text')?.remove(); }}
                                    />
                                    <div className="placeholder-text absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-bold text-sm bg-slate-100 -z-10">
                                        <Camera className="w-8 h-8 mb-2 opacity-30" />
                                        {item.img}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Mapa de Ubicación */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-t-8 border-[#E31837]"
                    >
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                                <MapPin className="w-8 h-8 text-[#E31837] mr-3" /> 
                                Unidad Deportiva Colinas del Padre
                            </h3>
                            <p className="text-slate-600">Zacatecas, Zacatecas. Únete a nuestros entrenamientos en la mejor sede de la ciudad.</p>
                        </div>
                        <div className="w-full h-[400px]">
                            <iframe 
                                src="https://www.google.com/maps?q=P,+Cerro+del+Cubilete+210,+Zona+A,+Colinas+del+Padre,+98083+Zacatecas,+Zac.&output=embed" 
                                className="w-full h-full border-0" 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mapa Unidad Deportiva Colinas del Padre">
                            </iframe>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#001b57] pt-16 pb-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-12 gap-12 mb-12">
                        <div className="md:col-span-5">
                            <div className="flex items-center space-x-4 mb-6">
                                <CrystalBallLogo className="w-14 h-14" />
                                <span className="font-heading font-extrabold text-2xl tracking-widest text-white">HE-5</span>
                            </div>
                            <p className="text-blue-200 text-sm leading-relaxed max-w-sm text-justify">
                                La misma garra, disciplina y amor por el fútbol que lo llevó a la Primera División, ahora enfocados en forjar a las futuras estrellas de Zacatecas.
                            </p>
                        </div>
                        
                        <div className="md:col-span-3">
                            <h5 className="text-white font-bold mb-6 tracking-wider">CONTACTO</h5>
                            <ul className="space-y-4">
                                <li>
                                    <a href="tel:+524921226800" className="group flex items-center text-blue-200 hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 group-hover:bg-[#E31837] transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        492 122 6800
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-4">
                            <h5 className="text-white font-bold mb-6 tracking-wider">SÍGUENOS</h5>
                            <a href="https://www.facebook.com/hectoresparzafc/" target="_blank" rel="noreferrer" className="block p-4 rounded-2xl bg-[#0033A0] border border-blue-400/30 hover:bg-blue-800 transition-colors shadow-lg">
                                <div className="flex items-center text-white">
                                    <svg className="w-8 h-8 fill-current mr-4" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <div>
                                        <p className="font-bold text-sm">Escuela de Futbol Hector Esparza</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
                        <p>&copy; {new Date().getFullYear()} Escuela de Fútbol Héctor Esparza.</p>
                        <a href="mailto:chrixesparza5@gmail.com" className="mt-4 md:mt-0 group flex items-center hover:text-white transition-colors">
                            <span>Desarrollado por</span>
                            <img src="/images/studio-logo.png" alt="" className="w-5 h-5 mx-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <strong className="text-purple-400 group-hover:text-purple-300 transition-colors font-heading tracking-widest">Dark Amethyst Studio</strong>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
                        onClick={() => setSelectedImg(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-5xl max-h-[90vh] w-full flex justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={`/images/${selectedImg.img}`} 
                                alt={selectedImg.caption}
                                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border-4 border-white/10"
                            />
                            
                            <button 
                                onClick={() => setSelectedImg(null)}
                                className="absolute -top-4 -right-4 md:-right-12 md:-top-0 text-white bg-[#E31837] p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            
                            <div className="absolute -bottom-12 left-0 w-full text-center">
                                <p className="text-white font-heading font-bold text-xl tracking-wide">{selectedImg.caption}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WhatsApp Floating Button */}
            <a 
                href="https://wa.me/524921226800?text=Hola,%20me%20gustaría%20solicitar%20información%20sobre%20la%20escuela%20de%20fútbol." 
                target="_blank" 
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_25px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center group"
                aria-label="Contactar por WhatsApp"
            >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
            </a>

            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
