const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources', 'js', 'Pages', 'Admin', 'Players', 'Index.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add User to imports
if (!content.includes(' User,')) {
    content = content.replace("import { Users", "import { Users, User");
}

// 2. Add onError handler
const target = `                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 ml-4">
                                    {player.photo_path ? (
                                        <img src={\`/storage/\${player.photo_path}\`} alt="Foto" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>`;

const replacement = `                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 ml-4 relative">
                                    {player.photo_path ? (
                                        <>
                                            <img 
                                                src={\`/storage/\${player.photo_path}\`} 
                                                alt="Foto" 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 absolute inset-0" style={{display: 'none'}}>
                                                <User size={32} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed Players Index.jsx');
} else {
    console.log('Target block not found in Players Index.jsx');
}
