import { useState } from "react";
import { motion } from "framer-motion";
import { Users, User, Mail, Phone, MapPin, MessageSquare, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const skills = [
  { id: "cooking", label: "Memasak", emoji: "👨‍🍳" },
  { id: "driving", label: "Mengemudi", emoji: "🚗" },
  { id: "photography", label: "Fotografi", emoji: "📷" },
  { id: "social-media", label: "Social Media", emoji: "📱" },
  { id: "fundraising", label: "Fundraising", emoji: "💰" },
  { id: "event", label: "Event Organizer", emoji: "🎪" },
];

export default function VolunteerSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    motivation: "",
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Lengkapi data",
        description: "Mohon lengkapi nama, email, dan nomor telepon Anda",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Pendaftaran Berhasil! 🎉",
      description:
        "Terima kasih telah mendaftar sebagai volunteer. Tim kami akan menghubungi Anda segera.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      motivation: "",
    });
    setSelectedSkills([]);
    setIsSubmitting(false);
  };

  return (
    <section
      id="volunteer"
      className="py-24 bg-accent/20 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-primary/30 rounded-3xl rotate-12 -z-10" />
      <div className="absolute bottom-10 right-20 w-32 h-32 bg-secondary/50 blob-shape -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-accent/30 border-2 border-foreground shadow-cartoon-sm mb-4">
            <span className="font-fredoka font-semibold">Volunteer</span>
          </div>
          <h2 className="font-fredoka text-3xl md:text-5xl font-bold mb-4">
            Bergabung Sebagai <span className="text-accent">Volunteer</span>
          </h2>
          <p className="font-nunito text-lg text-muted-foreground max-w-2xl mx-auto">
            Jadilah bagian dari tim dhaharan.id dan berkontribusi langsung dalam
            kegiatan sosial kami.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent border-2 border-foreground shadow-cartoon-sm flex items-center justify-center">
                    <Users className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle>Form Pendaftaran Volunteer</CardTitle>
                    <CardDescription>
                      Isi data diri dan keahlian Anda
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="font-fredoka text-base mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Domisili
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Kota/Kabupaten"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label className="font-fredoka text-base mb-3 block">
                      Keahlian yang Anda miliki
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skills.map((skill) => (
                        <motion.button
                          key={skill.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSkill(skill.id)}
                          className={`p-3 rounded-xl border-2 border-foreground flex items-center gap-2 transition-all relative ${
                            selectedSkills.includes(skill.id)
                              ? "bg-primary shadow-cartoon"
                              : "bg-card shadow-cartoon-sm hover:shadow-cartoon"
                          }`}
                        >
                          <span className="text-xl">{skill.emoji}</span>
                          <span className="font-nunito font-semibold text-sm">
                            {skill.label}
                          </span>
                          {selectedSkills.includes(skill.id) && (
                            <Check className="w-4 h-4 absolute top-1 right-1 text-highlight" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <Label htmlFor="motivation" className="font-fredoka text-base mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Motivasi bergabung
                    </Label>
                    <Textarea
                      id="motivation"
                      name="motivation"
                      placeholder="Ceritakan mengapa Anda ingin menjadi volunteer di dhaharan.id..."
                      value={formData.motivation}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Daftar Sebagai Volunteer
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
