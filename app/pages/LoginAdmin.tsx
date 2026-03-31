'use client';
import React, { useState } from 'react';

import { Mail, Lock, Eye, EyeOff, AlertCircle, Check, Loader2, Phone, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { notificationService } from '@/lib/notificationService';
import { EnTete } from '@/app/components/ds/EnTete';

// Création du client Supabase (singleton)
const supabase = getSupabaseBrowserClient();

// African Pattern Shapes Component
function AfricanPatterns() {
  // Animated triangle patterns
  const triangles = [
    { size: 120, x: '10%', y: '15%', color: '#016B06', rotation: 0, delay: 0 },
    { size: 80, x: '75%', y: '25%', color: '#D4A800', rotation: 45, delay: 0.2 },
    { size: 100, x: '20%', y: '70%', color: '#EE0003', rotation: 30, delay: 0.4 },
    { size: 60, x: '85%', y: '80%', color: '#016B06', rotation: 15, delay: 0.6 },
    { size: 90, x: '50%', y: '45%', color: '#D4A800', rotation: 60, delay: 0.3 },
  ];

  // Diamond/Rhombus patterns
  const diamonds = [
    { size: 70, x: '30%', y: '30%', color: '#EE0003', delay: 0.5 },
    { size: 50, x: '65%', y: '60%', color: '#016B06', delay: 0.7 },
    { size: 85, x: '15%', y: '55%', color: '#D4A800', delay: 0.1 },
    { size: 55, x: '80%', y: '10%', color: '#EE0003', delay: 0.4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Triangles */}
      {triangles.map((tri, index) => (
        <motion.div
          key={`tri-${index}`}
          className="absolute"
          style={{
            left: tri.x,
            top: tri.y,
            width: tri.size,
            height: tri.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
            y: [-10, 10, -10],
            rotate: [tri.rotation, tri.rotation + 5, tri.rotation],
          }}
          transition={{
            duration: 8,
            delay: tri.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon 
              points="50,10 90,90 10,90" 
              fill={tri.color}
              opacity="0.6"
            />
          </svg>
        </motion.div>
      ))}

      {/* Diamonds */}
      {diamonds.map((dia, index) => (
        <motion.div
          key={`dia-${index}`}
          className="absolute"
          style={{
            left: dia.x,
            top: dia.y,
            width: dia.size,
            height: dia.size,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.3, 0.2],
            scale: [1, 1.15, 1],
            x: [-5, 5, -5],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 10,
            delay: dia.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon 
              points="50,5 95,50 50,95 5,50" 
              fill={dia.color}
              opacity="0.5"
            />
          </svg>
        </motion.div>
      ))}

      {/* Mud Cloth Inspired Patterns - Horizontal Lines */}
      <motion.div
        className="absolute left-0 top-1/4 w-full h-1"
        style={{ backgroundColor: '#D4A800' }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute left-0 top-3/4 w-full h-1"
        style={{ backgroundColor: '#EE0003' }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scaleX: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 7,
          delay: 0.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Circle patterns */}
      {[
        { size: 40, x: '40%', y: '10%', color: '#016B06', delay: 0.2 },
        { size: 30, x: '90%', y: '50%', color: '#D4A800', delay: 0.5 },
        { size: 35, x: '5%', y: '85%', color: '#EE0003', delay: 0.8 },
      ].map((circle, index) => (
        <motion.div
          key={`circle-${index}`}
          className="absolute rounded-full"
          style={{
            left: circle.x,
            top: circle.y,
            width: circle.size,
            height: circle.size,
            backgroundColor: circle.color,
            opacity: 0.2,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 5,
            delay: circle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export default function LoginAdmin() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Registration State
  const [registerData, setRegisterData] = useState({
    organisation_type: '',
    organisation_name: '',
    nom: '',
    prenom: '',
    fonction: '',
    pays: '',
    whatsapp: '',
    email: '',
    message: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);

    if (!loginData.email || !loginData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      // Call server-side login proxy with rate limiting
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });

      if (res.status === 429) {
        throw new Error('Trop de tentatives. Veuillez réessayer dans quelques minutes.');
      }

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error('Erreur de connexion au serveur. Veuillez réessayer.');
      }

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Erreur de connexion');
      }

      // Set the Supabase session from server-returned tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) throw sessionError;

      setShowSuccess(true);

      let redirectPath = '/admin/dashboard';
      if (result.role === 'Superadmin') redirectPath = '/superadmin/dashboard';

      setTimeout(() => router.push(redirectPath), 1000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message.includes('Invalid login credentials')
        ? 'Identifiants incorrects. Veuillez réessayer.'
        : err.message);
      console.error('Login error:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);

    // Basic validation
    const required = ['organisation_type', 'nom', 'prenom', 'fonction', 'pays', 'email'];
    for (const field of required) {
      if (!registerData[field as keyof typeof registerData]) {
        setError('Veuillez remplir tous les champs obligatoires (*)');
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('pre_inscriptions')
        .insert([registerData]);

      if (insertError) throw insertError;

      // Send Platform Notification to Admins
      try {
        await notificationService.notifyAdmins({
          type: 'pre_inscription_received',
          title: 'Nouvelle Demande d\'Inscription',
          message: `${registerData.prenom} ${registerData.nom} (${registerData.organisation_name || 'Particulier'}) a envoyé une demande d'inscription.`,
          data: {
            candidat_name: `${registerData.prenom} ${registerData.nom}`,
            candidat_email: registerData.email,
          }
        });
      } catch (notifErr) {
        console.error('Platform notification failed (non-blocking):', notifErr);
      }

      setShowSuccess(true);
      setIsLoading(false);
      
      // Reset form after success
      setTimeout(() => {
        setAuthMode('login');
        setShowSuccess(false);
        setRegisterData({
          organisation_type: '',
          organisation_name: '',
          nom: '',
          prenom: '',
          fonction: '',
          pays: '',
          whatsapp: '',
          email: '',
          message: '',
        });
      }, 3000);

    } catch (err: any) {
      setIsLoading(false);
      setError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex flex-col">
      <EnTete
        liens={[
          { label: 'Première visite', href: '/premiere-visite' },
          { label: 'Organisations membres', href: '/a-propos' },
          { label: 'Trouver une mission', href: '/missions' },
          { label: 'Proposer un projet', href: '/soumettre-projet' },
          { label: 'Soumettre votre profil', href: '/soumettre-profil' },
        ]}
      />

      {/* Main Content - Split Layout */}
      <div className="flex flex-1">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ backgroundColor: '#003A54' }}>
          <AfricanPatterns />

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
            <motion.div 
              className="max-w-md text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <img 
                  src="https://ilab.tn/wp-content/uploads/2026/02/jesuisaucameroun-logo-b.png" 
                  alt="Je suis au Cameroun"
                  className="h-48 w-auto mx-auto brightness-0 invert"
                />
              </div>

              <h1 className="mb-4" style={{ fontSize: '36px', fontWeight: 600, lineHeight: '1.3' }}>
                {authMode === 'login' ? 'Espace administrateur' : 'Rejoignez-nous'}
              </h1>
              <p className="text-white/90 mb-8" style={{ fontSize: '18px', fontWeight: 400, lineHeight: '1.6' }}>
                {authMode === 'login' 
                  ? 'Pilotez ici les actions et les candidatures de votre diaspora' 
                  : 'Faites partie du réseau qui connecte la diaspora au développement local'}
              </p>

              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setError('');
                    setShowSuccess(false);
                  }}
                  className="px-8 py-4 bg-white text-[#003A54] rounded-xl font-bold hover:bg-neutral-100 transition-all shadow-lg flex items-center gap-2 group"
                >
                  {authMode === 'login' ? 'S\'inscrire maintenant' : 'Retour à la connexion'}
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <Shield className="w-5 h-5 text-primary" />
                  </motion.div>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none"></div>
        </div>

        {/* RIGHT PANEL - Login or Register Form */}
        <div className="w-full lg:w-[55%] bg-white flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <motion.div 
            key={authMode}
            className="w-full max-w-[520px] py-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <img 
                src="https://ilab.tn/wp-content/uploads/2026/02/jesuisaucameroun-logo-b.png" 
                alt="Je suis au Cameroun"
                className="h-20 w-auto mx-auto"
              />
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 lg:p-10">
              {authMode === 'login' ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-neutral-900 mb-2" style={{ fontSize: '32px', fontWeight: 600, lineHeight: '1.3' }}>
                      Connexion
                    </h2>
                    <p className="text-neutral-600" style={{ fontSize: '16px', fontWeight: 400, lineHeight: '1.6' }}>
                      Accédez à votre espace de gestion
                    </p>
                  </div>

                  {showSuccess && (
                    <div className="mb-6 bg-green-50 border-l-4 border-primary rounded-r-lg p-4 flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" strokeWidth={3} />
                      <p className="text-primary font-semibold text-sm">Connexion réussie !</p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-accent rounded-r-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-accent font-semibold text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-neutral-900 mb-2 text-sm font-medium">Adresse électronique</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 flex items-center justify-center text-neutral-400 pointer-events-none">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          placeholder="votre.email@mairie.cm"
                          disabled={isLoading}
                          className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-neutral-200 focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-900 mb-2 text-sm font-medium">Mot de passe</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 flex items-center justify-center text-neutral-400 pointer-events-none">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="w-full h-12 pl-12 pr-12 rounded-lg border-2 border-neutral-200 focus:border-primary focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 flex items-center justify-center text-neutral-400 hover:text-neutral-600 h-10 w-10"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input id="rem" type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" />
                        <label htmlFor="rem" className="text-neutral-600 text-sm">Rester connecté</label>
                      </div>
                      <button type="button" className="text-primary text-sm font-medium hover:underline">Oublié ?</button>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-neutral-900 mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>Page d’inscription</h2>
                    <p className="text-neutral-600 mb-4" style={{ fontSize: '15px' }}>
                      Content de vous voir parmi nous ! <br />
                      <strong className="text-primary">Pré-inscrivez-vous immédiatement</strong>
                    </p>
                    
                    <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg mb-6">
                      <p className="text-[#003A54] text-xs leading-relaxed font-medium">
                        Après contrôle de votre éligibilité, vous recevrez sous 48 heures, un mail pour finaliser votre inscription définitive et générer votre mot de passe
                      </p>
                    </div>

                    <button 
                      onClick={() => setAuthMode('login')} 
                      className="text-primary text-sm font-bold hover:underline mb-2 flex items-center gap-1"
                    >
                      Vous avez déjà un compte? Connexion
                    </button>
                  </div>

                  {showSuccess && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-green-700 font-semibold text-sm">Demande envoyée avec succès ! Nous reviendrons vers vous sous 48h.</p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-accent rounded-r-lg p-4">
                      <p className="text-accent font-semibold text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Organisation *</label>
                      <select
                        value={registerData.organisation_type}
                        onChange={(e) => setRegisterData({ ...registerData, organisation_type: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm font-medium"
                        required
                      >
                        <option value="">Sélectionnez le type...</option>
                        <option value="Collectivité locale">Collectivité locale</option>
                        <option value="Entreprise">Entreprise</option>
                        <option value="Administration">Administration</option>
                        <option value="ONG">ONG</option>
                        <option value="Personne physique">Personne physique</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    {registerData.organisation_type && registerData.organisation_type !== 'Personne physique' && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Nom de l’organisation *</label>
                        <input
                          type="text"
                          value={registerData.organisation_name}
                          onChange={(e) => setRegisterData({ ...registerData, organisation_name: e.target.value })}
                          placeholder="Nom complet de la structure"
                          className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          required
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Nom *</label>
                        <input
                          type="text"
                          value={registerData.nom}
                          onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Prénom *</label>
                        <input
                          type="text"
                          value={registerData.prenom}
                          onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Fonction *</label>
                        <input
                          type="text"
                          value={registerData.fonction}
                          onChange={(e) => setRegisterData({ ...registerData, fonction: e.target.value })}
                          placeholder="Ex: Maire, CEO..."
                          className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Pays *</label>
                        <input
                          type="text"
                          value={registerData.pays}
                          onChange={(e) => setRegisterData({ ...registerData, pays: e.target.value })}
                          placeholder="Cameroun, France..."
                          className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">WhatsApp</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="tel"
                            value={registerData.whatsapp}
                            onChange={(e) => setRegisterData({ ...registerData, whatsapp: e.target.value })}
                            placeholder="+237..."
                            className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Email *</label>
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-700 text-xs font-bold uppercase mb-1.5 ml-1">Msj (Message)</label>
                      <textarea
                        value={registerData.message}
                        onChange={(e) => setRegisterData({ ...registerData, message: e.target.value })}
                        placeholder="Précisez votre besoin ou parlez-nous de votre organisation"
                        className="w-full h-24 px-4 py-2 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none text-sm resize-none"
                      />
                    </div>

                    <p className="text-[10px] text-neutral-500 italic">* Champ obligatoire</p>

                    <p className="text-[11px] text-neutral-600 text-center leading-relaxed">
                      En vous inscrivant, vous acceptez nos <span className="text-primary font-bold cursor-pointer hover:underline">termes et conditions</span> ainsi que notre <span className="text-primary font-bold cursor-pointer hover:underline">politique de confidentialité</span>
                    </p>

                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'S\'inscrire'}
                    </button>
                  </form>
                </>
              )}

              {/* FOOTER */}
              <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Shield className="w-4 h-4" />
                  <span style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Connexion sécurisée SSL
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}