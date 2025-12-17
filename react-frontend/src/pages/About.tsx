import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Target, Users, Layers, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f5fbff] to-[#eef6fb]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white bg-[radial-gradient(circle_at_top,_#7dd3fc,_#0ea5e9,_#0369a1)]">
        <div className="absolute -top-24 -left-24 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-16 py-24 text-center">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm tracking-wide">
            Healthcare • Technology • Trust
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            About <span className="text-[#E0F7FF]">BookMyDoc</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
            BookMyDoc is a next-generation digital healthcare platform that
            simplifies doctor discovery, appointment booking, and seamless
            interaction between patients and healthcare professionals.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg hover:scale-105 transition">
              <h3 className="text-2xl font-bold">Fast</h3>
              <p className="text-sm text-white/80">Quick doctor discovery</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg hover:scale-105 transition">
              <h3 className="text-2xl font-bold">Secure</h3>
              <p className="text-sm text-white/80">Protected user data</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg hover:scale-105 transition">
              <h3 className="text-2xl font-bold">Reliable</h3>
              <p className="text-sm text-white/80">Trusted appointments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-16 py-20 space-y-24">
        {/* Purpose & Motivation */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[
            {
              icon: Target,
              title: "Purpose of the Product",
              color: "#2D9CDB",
              text: "BookMyDoc centralizes healthcare access by enabling patients to easily find doctors, book appointments, and manage their care digitally. For doctors, it reduces administrative overhead and improves schedule efficiency.",
            },
            {
              icon: Users,
              title: "Motivation",
              color: "#56CCF2",
              text: "Inspired by real-world issues like long queues and appointment delays, BookMyDoc leverages modern web technology to create a transparent, fast, and reliable healthcare experience.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-3xl shadow-card p-10 hover:-translate-y-2 hover:shadow-xl transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <item.icon className="h-7 w-7" style={{ color: item.color }} />
                <h2 className="text-2xl font-semibold text-gray-800">
                  {item.title}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </section>

        {/* MarkScape */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-card p-12 max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <Layers className="h-7 w-7 text-[#1c5a6a]" />
            <h2 className="text-2xl font-semibold text-gray-800">Markscape</h2>
          </div>

          <p className="text-gray-600 leading-relaxed max-w-3xl">
            Our mission goes beyond delivering services. We focus on building
            long-term partnerships rooted in trust, transparency, and shared
            growth. By understanding client needs and acting with integrity, we
            consistently deliver reliable, innovative, and high-quality
            solutions.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {["Official Website", "Documentation", "Resources"].map((label, i) => (
              <a
                key={i}
                href={`https://markscape.co.in/${
                  i === 1 ? "/docs" : i === 2 ? "/resources" : ""
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border p-5 hover:bg-gray-50 hover:shadow-md transition"
              >
                <span className="text-gray-700 font-medium group-hover:text-[#2D9CDB]">
                  {label}
                </span>
                <ExternalLink className="h-4 w-4 text-gray-500 group-hover:translate-x-1 transition" />
              </a>
            ))}
          </div>
        </motion.section>

        {/* Developer Team */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold text-gray-800 text-center mb-6"
          >
            Developer Team
          </motion.h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-14">
            A team of four developers collaborating across frontend, backend,
            UI/UX, and system integration to build a reliable healthcare platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {["Frontend", "Backend", "UI/UX", "Integration"].map((role, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl shadow-card p-8 text-center hover:-translate-y-3 hover:shadow-xl transition"
              >
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Developer {i + 1}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{role} Specialist</p>
                <p className="text-gray-600 mt-3 text-sm">
                  Contributed to the {role.toLowerCase()} development and
                  optimization of the BookMyDoc platform.
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
