import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { UserPlus, Shield, ShieldAlert, Trash2, Mail, Calendar, Lock, Plus, X } from 'lucide-react';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [whitelist, setWhitelist] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [whitelistLoading, setWhitelistLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
  }, []);

  async function fetchWhitelist() {
    const { data } = await supabase.from('authorized_emails').select('*').order('created_at', { ascending: false });
    if (data) setWhitelist(data);
  }

  const handleAddWhitelist = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    setWhitelistLoading(true);
    try {
      const { error } = await supabase.from('authorized_emails').insert({ 
        email: newEmail.trim().toLowerCase(),
        authorized_by: currentUser.id 
      });
      if (error) throw error;
      setNewEmail('');
      await fetchWhitelist();
    } catch (err) {
      alert('Erro ao autorizar e-mail: ' + err.message);
    } finally {
      setWhitelistLoading(false);
    }
  };

  const removeWhitelist = async (email) => {
    if (!confirm(`Remover ${email} da lista de autorizados?`)) return;
    try {
      await supabase.from('authorized_emails').delete().eq('email', email);
      await fetchWhitelist();
    } catch (err) {
      alert('Erro ao remover e-mail');
    }
  };

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-brown dark:text-white">Acessos Internos</h2>
          <p className="text-gray-500 dark:text-white/30 text-sm mt-1">Gerencie a whitelist e permissões dos administradores.</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4 flex items-center gap-4">
          <Shield className="text-orange-500" size={24} />
          <div className="text-xs">
            <p className="font-bold text-orange-800 dark:text-orange-400 uppercase tracking-widest">Controle Super Admin</p>
            <p className="text-orange-600 dark:text-orange-300 opacity-80 mt-0.5">Acesso total às chaves do sistema.</p>
          </div>
        </div>
      </div>

      {/* Seção 1: Whitelist (Autorizar Cadastro) */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1a0a05] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-brown dark:text-white font-serif text-lg mb-4">Autorizar Novo E-mail</h3>
            <p className="text-gray-500 dark:text-white/30 text-xs leading-relaxed mb-6">
              Apenas e-mails nesta lista poderão utilizar o link de "Configurar Acesso" para criar uma conta.
            </p>
            <form onSubmit={handleAddWhitelist} className="space-y-4">
              <input 
                type="email" 
                required 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@autorizado.com" 
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
              <button 
                type="submit"
                disabled={whitelistLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {whitelistLoading ? '...' : <Plus size={14} />}
                Autorizar E-mail
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1a0a05] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="px-8 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">E-mails Pré-Aprovados</span>
              <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{whitelist.length}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[300px] overflow-auto">
              {whitelist.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-xs italic">Nenhum e-mail autorizado no momento.</div>
              )}
              {whitelist.map(item => (
                <div key={item.email} className="px-8 py-4 flex items-center justify-between group hover:bg-gray-50/30 dark:hover:bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-gray-300" />
                    <span className="text-sm font-bold text-brown dark:text-white/80">{item.email}</span>
                  </div>
                  <button onClick={() => removeWhitelist(item.email)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Usuários Ativos */}
      <div className="space-y-6">
        <h3 className="text-brown dark:text-white font-serif text-xl pl-2">Administradores do Sistema</h3>
        <div className="bg-white dark:bg-[#1a0a05] border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 text-gray-400 dark:text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                  <th className="px-8 py-5">E-mail</th>
                  <th className="px-8 py-5">Nível de Acesso</th>
                  <th className="px-8 py-5 text-right">Controles</th>
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
                          {user.id === currentUser.id && <span className="text-[9px] text-orange-500 font-bold uppercase tracking-tighter">Sessão Atual</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        {user.role !== 'super_admin' && (
                          <>
                            {user.role === 'admin' ? (
                              <button onClick={() => updateRole(user.id, 'pending')} disabled={actionLoading === user.id}
                                className="p-2.5 text-gray-400 hover:text-orange-500 bg-gray-50 dark:bg-white/5 hover:bg-white rounded-xl transition-all" title="Remover Admin">
                                <ShieldAlert size={16} />
                              </button>
                            ) : (
                              <button onClick={() => updateRole(user.id, 'admin')} disabled={actionLoading === user.id}
                                className="p-2.5 text-gray-400 hover:text-green-500 bg-gray-50 dark:bg-white/5 hover:bg-white rounded-xl transition-all" title="Tornar Admin">
                                <Shield size={16} />
                              </button>
                            )}
                            <button onClick={() => deleteUser(user.id)} disabled={actionLoading === user.id}
                              className="p-2.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-white/5 hover:bg-white rounded-xl transition-all" title="Remover Acesso">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {user.role === 'super_admin' && <Lock size={16} className="text-gray-200 dark:text-white/5 mr-2" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
