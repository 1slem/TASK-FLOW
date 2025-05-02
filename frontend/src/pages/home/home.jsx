import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Home = () => {
  return (
    
    // Main content of the home page
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      {/* Hero Section */}
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 animate-fade-in">
            Master Your Workflow with Task Flow
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto opacity-90 animate-slide-up">
            Plan, track, and collaborate on tasks effortlessly with our modern, Trello-inspired platform designed for teams and individuals.
          </p>
          <Link
            to="/workspace"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Your Workspace
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12 animate-fade-in">
            Powerful Features to Boost Productivity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-full opacity-20"></div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Seamless Task Management</h4>
              <p className="text-gray-600">
                Drag and drop tasks across boards to organize projects with ease and efficiency.
              </p>
            </div>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-full opacity-20"></div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Real-Time Collaboration</h4>
              <p className="text-gray-600">
                Work together with your team, assign tasks, and get instant updates on progress.
              </p>
            </div>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-full opacity-20"></div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Flexible Workflows</h4>
              <p className="text-gray-600">
                Customize boards, lists, and labels to fit your unique project needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12 animate-fade-in">
            What Our Users Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <p className="text-gray-600 italic mb-4">
                "Task Flow transformed how our team manages projects. It's intuitive and powerful!"
              </p>
              <p className="text-gray-800 font-semibold">Sarah M., Project Manager</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <p className="text-gray-600 italic mb-4">
                "I love the flexibility and ease of use. Task Flow keeps me organized every day."
              </p>
              <p className="text-gray-800 font-semibold">James T., Freelancer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6 animate-fade-in">Ready to Get Started?</h3>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Join Task Flow Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 Task Flow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
