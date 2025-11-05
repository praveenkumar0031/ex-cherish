import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, BookOpen, Users, Sparkles } from "lucide-react";
import Navbar from "../navbar/Navbar";

const DashBoard = () => {
  const navigate = useNavigate();

  const rooms = [
    { id: 1, name: "AI & Machine Learning", members: 23 },
    { id: 2, name: "Web Development", members: 45 },
    { id: 3, name: "Cyber Security", members: 19 },
    { id: 4, name: "Data Science", members: 32 },
  ];

  const courses = [
    {
      id: 1,
      title: "Introduction to AI",
      description:
        "Understand the fundamentals of artificial intelligence and its applications.",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    },
    {
      id: 2,
      title: "Web Development Bootcamp",
      description:
        "Learn full-stack development with hands-on projects using the MERN stack.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    },
    {
      id: 3,
      title: "Data Visualization with Python",
      description:
        "Master matplotlib, seaborn, and Plotly to visualize real-world data.",
      image: "https://images.unsplash.com/photo-1556767576-cfba2e339b4d?w=800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 🌟 Hero Section */}
      <section className="text-center py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-b-3xl shadow-lg">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles size={36} className="text-yellow-300" />
            Knowledge Sharing Platform
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Connect, Learn, and Grow together. Join vibrant communities, explore
            new courses, and share your expertise with peers around the world.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/learn")}
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-100 transition"
            >
              Explore Courses
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
            >
              Join a Chat Room
            </button>
          </div>
        </div>
      </section>

      {/* 💬 Chat Rooms */}
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="text-blue-600" size={28} />
            <h2 className="text-3xl font-semibold text-gray-800">Chat Rooms</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{room.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users size={16} className="mr-2 text-blue-500" />
                  {room.members} Members
                </div>
                <button
                  onClick={() => navigate("/chat")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition w-full"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 📚 Demo Courses */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-green-600" size={28} />
            <h2 className="text-3xl font-semibold text-gray-800">Demo Courses</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  <button
                    onClick={() => navigate("/learn")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition w-full"
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ⚡ Footer */}
      <footer className="bg-gray-100 py-6 mt-10 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} KnowledgeShare — Empowering collaborative learning.
      </footer>
    </div>
  );
};

export default DashBoard;
