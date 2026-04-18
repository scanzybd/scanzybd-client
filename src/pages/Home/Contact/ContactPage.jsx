import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ContactPage = () => {
  const axiosSecure = useAxiosSecure();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // ✅ FIX: handleChange
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ FIX: submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosSecure.post("/api/contact", form);

      alert(res.data.message || "Message sent successfully");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">

      {/* HEADER */}
      <div className="bg-yellow-400 py-14 text-center">
        <h1 className="text-4xl font-bold text-white">
          Contact Us
        </h1>
        <p className="text-gray-800 mt-2">
          We’re here to help you anytime
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Get in Touch
          </h2>

          <p className="text-gray-600">
            Have any questions? Feel free to contact us.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-yellow-500" />
              <span>support@yourbrand.com</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-yellow-500" />
              <span>+880 1234 567 890</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-yellow-500" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">

          <h2 className="text-xl font-bold mb-4">
            Send Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded"
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              className="w-full border p-3 rounded"
              required
            />

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send Message
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;