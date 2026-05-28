import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, MessageCircle,MessageSquare, Star, UserCheck, Users, BookOpen, Heart, Lightbulb, Globe, Book, Sparkles, Zap, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ y: -8 }}
    className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 group hover:border-blue-500/30 transition-all duration-500"
  >
    <div className="p-5 bg-white/5 rounded-2xl w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-all duration-500 shadow-inner">
      <Icon className="text-blue-500 group-hover:text-white" size={32} strokeWidth={2.5} />
    </div>
    <h3 className="font-[900] text-2xl text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const BenefitCard = ({ icon: Icon, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] flex items-center gap-6 border border-white/5 hover:bg-white/10 transition-all"
  >
    <div className="p-3 bg-indigo-500/20 rounded-xl flex-shrink-0">
      <Icon className="text-indigo-400" size={24} strokeWidth={2.5} />
    </div>
    <p className="text-slate-300 font-bold text-sm leading-snug">{text}</p>
  </motion.div>
);


const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* Immersive Hero Section */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[80px]" />
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full mb-10 shadow-2xl"
          >
             <Sparkles className="text-yellow-400" size={16} />
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Protocol v1.0.4 Online</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-[900] text-white leading-[1.05] tracking-tighter mb-8 italic uppercase"
          >
            Exchange <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 not-italic">Knowledge</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
          >
            The distributed operating system for human expertise. Connect with verified nodes, synchronize skills, and scale your collective intelligence.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="bg-white text-slate-900 font-[900] px-12 py-6 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] hover:bg-blue-500 hover:text-white transition-all duration-500 active:scale-95 flex items-center gap-4 uppercase tracking-[0.2em] text-[11px]"
            >
              {user ? "Enter Dashboard" : "Initialize Access"}
              <ArrowRight size={18} strokeWidth={3} />
            </button>
            <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white font-black px-10 py-6 rounded-[2rem] hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]">
                Technical Briefing
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/10 pt-16 max-w-4xl mx-auto"
          >
              <div className="text-center">
                  <p className="text-4xl font-[900] text-white mb-2 tracking-tighter">12K+</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
              </div>
              <div className="text-center">
                  <p className="text-4xl font-[900] text-white mb-2 tracking-tighter">4.8M</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Streams</p>
              </div>
              <div className="text-center">
                  <p className="text-4xl font-[900] text-white mb-2 tracking-tighter">99.9%</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync Uptime</p>
              </div>
              <div className="text-center">
                  <p className="text-4xl font-[900] text-white mb-2 tracking-tighter">256B</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AES Encryption</p>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Core Protocol / About */}
      <section className="py-32 px-6 bg-slate-950/50 relative border-y border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-blue-500" size={20} strokeWidth={3} />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Core Protocol</span>
                </div>
                <h2 className="text-5xl font-[900] text-white tracking-tighter mb-8 uppercase italic leading-tight">Collective <br/>Intelligence Engine.</h2>
                <p className="text-xl text-slate-400 leading-relaxed font-medium mb-10">Excherish isn't just a platform; it's a vibrant ecosystem where verified nodes share ideas, discover new perspectives, and synchronize knowledge in real-time.</p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-white font-bold text-sm">
                        <ShieldCheck size={18} className="text-green-500" />
                        Verified Peer-to-Peer Handshakes
                    </div>
                    <div className="flex items-center gap-4 text-white font-bold text-sm">
                        <ShieldCheck size={18} className="text-green-500" />
                        Dynamic Knowledge Mapping
                    </div>
                    <div className="flex items-center gap-4 text-white font-bold text-sm">
                        <ShieldCheck size={18} className="text-green-500" />
                        Secure Encrypted Channels
                    </div>
                </div>
            </motion.div>

            <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-slate-900 rounded-[4rem] border border-white/10 p-4 shadow-2xl overflow-hidden group"
                >
                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072" className="rounded-[3.5rem] opacity-50 grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-105" alt=""/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                            <Zap size={40} fill="currentColor" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
                <h2 className="text-4xl md:text-6xl font-[900] text-white tracking-tighter uppercase mb-6 italic">Grid Capabilities</h2>
                <p className="text-slate-400 max-w-xl mx-auto font-medium">Advanced tools designed for seamless expertise deployment across the distributed network.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard delay={0.1} icon={Lightbulb} title="Idea Broadcast" description="Deploy insights and shared experiences across the collective sector." />
              <FeatureCard delay={0.2} icon={MessageSquare} title="Sync Channels" description="Engage in high-bandwidth conversations through secure uplink protocols." />
              <FeatureCard delay={0.3} icon={Star} title="Curated Logs" description="Discover high-value data blocks contributed by verified network nodes." />
              <FeatureCard delay={0.4} icon={UserCheck} title="Node Identity" description="Showcase your expertise trajectory and learning lifecycle on the grid." />
              <FeatureCard delay={0.5} icon={Globe} title="Global Grid" description="Connect with expert nodes and learners across the global cluster." />
              <FeatureCard delay={0.6} icon={Heart} title="Co-Op Sync" description="Collaborative problem solving through deep neural network expansion." />
            </div>
        </div>
      </section>

      {/* Benefit Matrix */}
      <section className="py-32 px-6 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-white">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                <h2 className="text-5xl font-[900] tracking-tighter uppercase italic leading-none">Protocol <br/>Benefits</h2>
                <p className="max-w-sm text-blue-100 font-bold text-sm uppercase tracking-widest leading-relaxed">Optimize your personal operating system through active collective contribution.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <BenefitCard delay={0.1} icon={BookOpen} text="Deep dive into diverse domains and expand your dataset." />
                <BenefitCard delay={0.2} icon={Users} text="Establish links with high-value expert nodes." />
                <BenefitCard delay={0.3} icon={Heart} text="Participate in a resilient and inspiring network culture." />
                <BenefitCard delay={0.4} icon={Star} text="Accelerate professional scaling through collaboration." />
                <BenefitCard delay={0.5} icon={Book} text="Access high-fidelity guides shared by the network." />
                <BenefitCard delay={0.6} icon={Shield} text="Transmit securely in a trusted encrypted environment." />
            </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-500/20 group">
                    <Zap className="text-white group-hover:scale-125 transition-transform" size={56} fill="currentColor" />
                </div>
                <h2 className="text-5xl md:text-7xl font-[900] text-white tracking-tighter uppercase italic mb-6">Join the Collective.</h2>
                <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">Initiate your node deployment today and start synchronizing expertise across the global knowledge grid.</p>
            </motion.div>

            <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="bg-white text-slate-900 font-[900] px-16 py-8 rounded-[2.5rem] shadow-2xl hover:bg-blue-600 hover:text-white transition-all duration-500 active:scale-95 uppercase tracking-[0.4em] text-[12px] group"
            >
                Authorize New Node <ArrowRight className="inline-block ml-4 group-hover:translate-x-3 transition-transform" size={20} strokeWidth={3} />
            </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
            <div className="max-w-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-white p-2 rounded-xl">
                        <Sparkles className="text-black" size={24} />
                    </div>
                    <span className="font-[900] text-white uppercase tracking-tighter text-3xl">Excherish</span>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">Scaling human potential through distributed intelligence protocols and secure peer-to-peer expertise exchange.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
                <div className="space-y-6">
                    <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Operations</h4>
                    <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Discovery</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Clusters</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Signaling</a></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Network</h4>
                    <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Security</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Latency</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Uptime</a></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Portal</h4>
                    <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Console</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Settings</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">© {new Date().getFullYear()} EXCHERISH DISTRIBUTED OS</p>
            <div className="flex gap-10">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">SSL SECURED</span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">NODE AES-256</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
