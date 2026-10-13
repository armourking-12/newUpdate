"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:vm9678974@gmail.com?subject=${encodeURIComponent(
      formData.subject || "Contact from HelpJuniors"
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    window.location.href = mailtoLink;
  };

  return (
    <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_currentColor]">
      <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">Send us a message</h2>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        Fill out the form below and we&apos;ll get back to you soon.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_0px_currentColor]"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_0px_currentColor]"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="What's this about?"
            className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_0px_currentColor]"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us more..."
            className="w-full resize-none border-2 border-foreground bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_0px_currentColor]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground"
        >
          <Send className="h-4 w-4" />
          Send Message
        </button>
      </form>
    </div>
  );
}
