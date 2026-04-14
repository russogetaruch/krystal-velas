import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { UserPlus, Shield, ShieldAlert, Trash2, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateRole = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      alert('Erro ao atualizar permissão: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja remover este acesso? O usuário não conseguirá mais entrar no painel.')) return;
    
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      alert('Erro ao remover usuário: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200">Super Admin</span>;
      case 'admin':
        return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200">Administrador</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200">Pendente</span>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-gray-400">
      <UserPlus size={48} className="mb-4 opacity-20" />
      <p className="text-xs uppercase tracking-widest">Carregando Gestão de Acessos...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-brown dark:text-white">Gestão de Administradores</h2>
          <p className="text-gray-500 dark:text-white/30 text-sm mt-1">Controle quem pode editar o conteúdo da Krystal Velas.</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4 flex items-center gap-4">
          <ShieldCheck className="text-orange-500" size={24} />
          <div className="text-xs">
            <p className="font-bold text-orange-800 dark:text-orange-400 uppercase tracking-widest">Atenção</p>
            <p className="text-orange-600 dark:text-orange-300 opacity-80 mt-0.5">Apenas o Super Admin pode gerenciar permissões.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a0a05] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-5">E-mail</th>
                <th className="px-8 py-5">Nível de Acesso</th>
                <th className="px-8 py-5">Cadastro em</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone dark:bg-white/5 flex items-center justify-center text-brown dark:text-white uppercase font-bold text-sm border border-gray-100 dark:border-white/5">
                        {user.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brown dark:text-white">{user.email}</p>
                        {user.id === currentUser.id && <span className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Você</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-white/30 text-xs">
                      <Calendar size={12} />
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 pr-2">
                      {user.role !== 'super_admin' && (
                        <>
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => updateRole(user.id, 'pending')}
                              disabled={actionLoading === user.id}
                              className="p-2 text-gray-400 hover:text-orange-500 bg-gray-100 dark:bg-white/5 hover:bg-white dark:hover:bg-orange-500/10 rounded-lg transition-all"
                              title="Remover Permissão de Admin"
                            >
                              <ShieldAlert size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateRole(user.id, 'admin')}
                              disabled={actionLoading === user.id}
                              className="p-2 text-gray-400 hover:text-green-500 bg-gray-100 dark:bg-white/5 hover:bg-white dark:hover:bg-green-500/10 rounded-lg transition-all"
                              title="Tornar Admin"
                            >
                              <Shield size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-white/5 hover:bg-white dark:hover:bg-red-500/10 rounded-lg transition-all"
                            title="Excluir Acesso"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      
                      {user.role === 'super_admin' && (
                        <div className="p-2 text-gray-300 dark:text-white/10" title="Proteção de Super Admin">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-xl bg-orange-50 dark:bg-orange-500/5 rounded-3xl p-8 border border-orange-100 dark:border-orange-500/10">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <UserPlus size={24} />
          </div>
          <div>
            <h4 className="font-serif text-lg text-brown dark:text-white">Como adicionar um novo Admin?</h4>
            <ol className="mt-4 space-y-3 text-sm text-brown/70 dark:text-white/40 list-decimal list-inside font-light leading-relaxed">
              <li>Peça para a pessoa se cadastrar normalmente no painel admin.</li>
              <li>Ela ficará bloqueada em uma tela de "Acesso Restrito".</li>
              <li>Ela aparecerá automaticamente nesta lista acima com o status <span className="font-bold underline">Pendente</span>.</li>
              <li>Clique no ícone de escudo (<Shield size={14} className="inline mx-0.5" />) para promovê-la a <span className="font-bold text-green-600">Administrador</span>.</li>
            </ol>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
