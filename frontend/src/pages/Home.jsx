import React from "react";
import { useNavigate } from "react-router-dom";

import { Shield, MessageCircle, Star, UserCheck, Users, BookOpen, Heart, Lightbulb, Globe, Book } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 hover:shadow-2xl border-l-4 border-blue-500">
    <div className="p-4 bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
      <Icon className="text-blue-600" size={24} />
    </div>
    <h3 className="font-semibold text-xl text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </div>
);

const BenefitCard = ({ icon: Icon, text }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex items-start gap-3 transform transition hover:scale-105 hover:shadow-xl border-l-4 border-purple-500">
    <div className="p-2 bg-purple-100 rounded-full">
      <Icon className="text-purple-600" size={20} />
    </div>
    <p className="text-gray-700">{text}</p>
  </div>
);


const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white py-24 px-6 text-center overflow-hidden rounded-b-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Welcome to Excherish</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 drop-shadow">
          Connect, share knowledge, and grow together. Excherish brings curious minds together to inspire learning and collaboration.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-blue-700 font-semibold px-6 md:px-8 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-105"
        >
          Get Started
        </button>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 bg-blue-50 rounded-3xl shadow-inner space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">About Excherish</h2>
        <p className="text-gray-700 text-center leading-relaxed">
          Excherish is a vibrant platform where individuals can connect, share ideas, and grow together. 
          Our mission is to foster a community of collaboration, inspiration, and continuous learning.
        </p>
      </section>

      {/* Features */}
      <section className="py-12 px-4 md:px-6 bg-white rounded-3xl shadow-inner">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">Features</h2>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Lightbulb} title="Idea Sharing" description="Share insights and experiences with the community." />
          <FeatureCard icon={MessageCircle} title="Discussion Forums" description="Engage in meaningful conversations and exchange perspectives." />
          <FeatureCard icon={Star} title="Curated Knowledge" description="Discover valuable knowledge from contributors." />
          <FeatureCard icon={UserCheck} title="Personal Profiles" description="Showcase your expertise and learning journey." />
          <FeatureCard icon={Globe} title="Global Community" description="Connect with learners and experts worldwide." />
          <FeatureCard icon={Heart} title="Collaborative Learning" description="Work together to solve problems and enhance understanding." />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 md:px-6 bg-blue-50 rounded-3xl shadow-inner">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">Benefits</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <BenefitCard icon={BookOpen} text="Explore diverse topics and expand your knowledge." />
          <BenefitCard icon={Users} text="Connect with like-minded learners and experts." />
          <BenefitCard icon={Heart} text="Participate in a supportive and inspiring community." />
          <BenefitCard icon={Star} text="Enhance personal and professional growth through collaboration." />
          <BenefitCard icon={Book} text="Access structured resources, tips, and guides shared by the community." />
          <BenefitCard icon={Shield} text="Feel secure sharing knowledge in a respectful and trustworthy environment." />
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-12 px-4 md:px-6 bg-white rounded-3xl shadow-inner">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">Community Impact</h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-center leading-relaxed">
          Excherish has empowered learners to share ideas, discover new perspectives, and collaborate on projects. 
          Our growing community fosters continuous learning and meaningful connections.
        </p>
      </section>

      {/* Vision */}
      <section className="py-12 px-4 md:px-6 bg-blue-50 rounded-3xl shadow-inner">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">Our Vision</h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-center leading-relaxed">
          Excherish aims to be the go-to platform for knowledge exchange, where learning is collaborative, ideas are celebrated, and every contribution helps grow a global community of curious minds.
        </p>
      </section>
    </div>
  );
};

export default Home;
