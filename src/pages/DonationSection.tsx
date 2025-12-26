import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, CreditCard, Wallet, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const donationAmounts = [
  { value: 25000, label: "Rp 25.000", meals: "5 porsi makanan" },
  { value: 50000, label: "Rp 50.000", meals: "10 porsi makanan" },
  { value: 100000, label: "Rp 100.000", meals: "20 porsi makanan" },
  { value: 250000, label: "Rp 250.000", meals: "50 porsi makanan" },
];

const paymentMethods = [
  { id: "transfer", name: "Transfer Bank", icon: CreditCard },
  { id: "ewallet", name: "E-Wallet", icon: Wallet },
];

export default function DonationSection() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = selectedAmount || parseInt(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finalAmount || finalAmount < 10000) {
      toast({
        title: "Oops!",
        description: "Minimal donasi Rp 10.000",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Pilih metode pembayaran",
        description: "Silakan pilih metode pembayaran terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Terima kasih! ❤️",
      description: `Donasi sebesar Rp ${finalAmount.toLocaleString("id-ID")} berhasil diproses. Kami akan menghubungi Anda untuk konfirmasi.`,
    });

    // Reset form
    setSelectedAmount(null);
    setCustomAmount("");
    setSelectedPayment(null);
    setDonorName("");
    setDonorEmail("");
    setIsSubmitting(false);
  };

  return (
    <section id="donasi" className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-10 right-20 w-48 h-48 bg-highlight/20 blob-shape -z-10" />
      <div className="absolute bottom-20 left-10 w-36 h-36 bg-primary/30 blob-shape-2 -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-highlight/20 border-2 border-foreground shadow-cartoon-sm mb-4">
            <span className="font-fredoka font-semibold">Donasi</span>
          </div>
          <h2 className="font-fredoka text-3xl md:text-5xl font-bold mb-4">
            Berbagi <span className="text-highlight">Kebaikan</span>
          </h2>
          <p className="font-nunito text-lg text-muted-foreground max-w-2xl mx-auto">
            Setiap rupiah yang Anda donasikan akan digunakan untuk menyediakan
            makanan bagi mereka yang membutuhkan.
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
                  <div className="w-14 h-14 rounded-2xl bg-highlight border-2 border-foreground shadow-cartoon-sm flex items-center justify-center">
                    <Heart className="w-7 h-7 text-highlight-foreground" />
                  </div>
                  <div>
                    <CardTitle>Form Donasi</CardTitle>
                    <CardDescription>
                      Pilih nominal dan metode pembayaran
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <Label className="font-fredoka text-base mb-3 block">
                      Pilih Nominal Donasi
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {donationAmounts.map((amount) => (
                        <motion.button
                          key={amount.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedAmount(amount.value);
                            setCustomAmount("");
                          }}
                          className={`p-4 rounded-xl border-2 border-foreground text-left transition-all ${
                            selectedAmount === amount.value
                              ? "bg-primary shadow-cartoon"
                              : "bg-card shadow-cartoon-sm hover:shadow-cartoon"
                          }`}
                        >
                          <div className="font-fredoka font-bold text-lg">
                            {amount.label}
                          </div>
                          <div className="font-nunito text-sm text-muted-foreground">
                            ≈ {amount.meals}
                          </div>
                          {selectedAmount === amount.value && (
                            <Check className="absolute top-2 right-2 w-5 h-5 text-highlight" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <Label htmlFor="customAmount" className="font-fredoka text-base mb-2 block">
                      Atau masukkan nominal lain
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-fredoka font-semibold">
                        Rp
                      </span>
                      <Input
                        id="customAmount"
                        type="number"
                        placeholder="100000"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        className="pl-12"
                      />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="donorName" className="font-fredoka text-base mb-2 block">
                        Nama (opsional)
                      </Label>
                      <Input
                        id="donorName"
                        placeholder="Nama lengkap Anda"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="donorEmail" className="font-fredoka text-base mb-2 block">
                        Email (opsional)
                      </Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label className="font-fredoka text-base mb-3 block">
                      Metode Pembayaran
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <motion.button
                          key={method.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`p-4 rounded-xl border-2 border-foreground flex items-center gap-3 transition-all ${
                            selectedPayment === method.id
                              ? "bg-accent shadow-cartoon"
                              : "bg-card shadow-cartoon-sm hover:shadow-cartoon"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg border-2 border-foreground flex items-center justify-center ${
                              selectedPayment === method.id
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          >
                            <method.icon className="w-5 h-5" />
                          </div>
                          <span className="font-fredoka font-semibold">
                            {method.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {finalAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-xl bg-primary/20 border-2 border-foreground"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-nunito">Total Donasi:</span>
                        <span className="font-fredoka text-2xl font-bold text-highlight">
                          Rp {finalAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="highlight"
                    size="lg"
                    className="w-full text-lg"
                    disabled={isSubmitting || finalAmount < 10000}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-highlight-foreground border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Donasi Sekarang
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
