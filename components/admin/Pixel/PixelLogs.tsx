import { formatPrix } from '@/lib/utils/formatPrix'

export default function PixelLogs({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 font-medium">Aucun log enregistré.</div>
  }

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden">
       <table className="w-full text-left">
          <thead className="bg-[#0f172a]/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
             <tr>
                <th className="p-4">Événement</th>
                <th className="p-4">Source</th>
                <th className="p-4">Signal</th>
                <th className="p-4 text-right">Heure</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
             {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                   <td className="p-4">
                      <p className="text-sm font-bold text-white">{log.event_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono italic truncate max-w-[120px]">{log.event_id}</p>
                   </td>
                   <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                         log.source === 'server' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                         {log.source === 'server' ? '🌐 API (CAPI)' : '📱 Browser'}
                      </span>
                   </td>
                   <td className="p-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${log.statut === 'envoye' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                         <span className={`text-[10px] font-bold ${log.statut === 'envoye' ? 'text-green-400' : 'text-red-400'}`}>
                            {log.statut === 'envoye' ? 'Réussi' : 'Échec'}
                         </span>
                      </div>
                   </td>
                   <td className="p-4 text-right">
                      <p className="text-[10px] font-mono text-slate-500">
                         {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  )
}
