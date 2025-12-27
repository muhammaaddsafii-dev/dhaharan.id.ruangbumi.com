import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Users,
  Flame,
  Star,
  Heart,
  ArrowLeft,
  Share2,
  Printer,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data (sama seperti di Resep.tsx)
const recipes = [
  {
    id: 1,
    title: "Nasi Goreng Spesial",
    description:
      "Nasi goreng khas Indonesia dengan bumbu rempah pilihan yang kaya akan cita rasa. Cocok untuk santapan keluarga atau teman-teman.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    category: "Makanan Utama",
    difficulty: "Mudah",
    cookTime: "20 menit",
    prepTime: "10 menit",
    servings: 4,
    calories: 450,
    rating: 4.8,
    reviews: 128,
    ingredients: [
      { item: "Nasi putih", amount: "2 piring" },
      { item: "Telur ayam", amount: "2 butir" },
      { item: "Bawang putih (cincang halus)", amount: "3 siung" },
      { item: "Bawang merah (cincang halus)", amount: "5 siung" },
      { item: "Kecap manis", amount: "2 sdm" },
      { item: "Garam", amount: "1/2 sdt" },
      { item: "Merica bubuk", amount: "1/4 sdt" },
      { item: "Kaldu bubuk", amount: "1/2 sdt" },
      { item: "Minyak goreng", amount: "3 sdm" },
      { item: "Daun bawang (iris)", amount: "2 batang" },
      { item: "Cabai rawit (opsional)", amount: "5 buah" },
    ],
    steps: [
      "Panaskan minyak dalam wajan dengan api sedang. Tumis bawang putih dan bawang merah hingga harum dan berwarna keemasan.",
      "Masukkan telur, orak-arik hingga setengah matang. Aduk rata dengan bumbu yang sudah ditumis.",
      "Tambahkan nasi putih, aduk rata dengan telur dan bumbu. Pastikan nasi tidak menggumpal.",
      "Tuang kecap manis, tambahkan garam, merica, dan kaldu bubuk. Aduk rata hingga bumbu tercampur sempurna.",
      "Masak selama 3-5 menit sambil terus diaduk agar nasi tidak gosong dan bumbu meresap.",
      "Tambahkan irisan daun bawang dan cabai rawit (jika suka pedas). Aduk sebentar.",
      "Sajikan nasi goreng hangat dengan pelengkap seperti kerupuk, acar, dan telur mata sapi.",
    ],
    tips: [
      "Gunakan nasi yang sudah dingin atau nasi sisa kemarin agar tidak lengket",
      "Panaskan wajan dengan api besar saat menumis untuk hasil yang lebih wangi",
      "Jangan terlalu banyak mengaduk agar nasi tidak hancur",
      "Tambahkan sedikit kecap asin untuk rasa yang lebih gurih",
    ],
    nutrition: [
      { label: "Kalori", value: "450 kcal" },
      { label: "Protein", value: "12g" },
      { label: "Karbohidrat", value: "68g" },
      { label: "Lemak", value: "14g" },
      { label: "Serat", value: "2g" },
    ],
  },
  {
    id: 2,
    title: "Soto Ayam Kuning",
    description: "Soto ayam dengan kuah kuning yang segar dan gurih",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800",
    category: "Makanan Utama",
    difficulty: "Sedang",
    cookTime: "45 menit",
    prepTime: "20 menit",
    servings: 6,
    calories: 320,
    rating: 4.9,
    reviews: 95,
    ingredients: [
      { item: "Ayam potong", amount: "500g" },
      { item: "Air", amount: "2 liter" },
      { item: "Serai", amount: "3 batang" },
      { item: "Daun jeruk", amount: "4 lembar" },
      { item: "Kunyit bubuk", amount: "1 sdt" },
      { item: "Jahe", amount: "3 cm" },
      { item: "Lengkuas", amount: "2 cm" },
      { item: "Bawang goreng", amount: "secukupnya" },
    ],
    steps: [
      "Rebus ayam dengan air hingga empuk dan kaldu keluar",
      "Haluskan bumbu (kunyit, jahe, lengkuas, bawang merah, bawang putih)",
      "Tumis bumbu halus hingga harum",
      "Masukkan bumbu tumis ke dalam kaldu ayam",
      "Tambahkan serai dan daun jeruk, masak hingga mendidih",
      "Suwir-suwir daging ayam",
      "Sajikan dengan pelengkap: bihun, tauge, telur, bawang goreng",
    ],
    tips: [
      "Gunakan ayam kampung untuk rasa yang lebih gurih",
      "Jangan terlalu lama merebus ayam agar daging tidak keras",
    ],
    nutrition: [
      { label: "Kalori", value: "320 kcal" },
      { label: "Protein", value: "28g" },
      { label: "Karbohidrat", value: "25g" },
      { label: "Lemak", value: "12g" },
    ],
  },
];

export default function ResepDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Find recipe by id
  const recipe = recipes.find((r) => r.id === Number(id));

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-fredoka text-2xl font-bold mb-4">
            Resep tidak ditemukan
          </h2>
          <Button onClick={() => navigate("/resep")}>Kembali ke Resep</Button>
        </div>
      </div>
    );
  }

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Mudah":
        return "bg-accent";
      case "Sedang":
        return "bg-primary";
      case "Sulit":
        return "bg-highlight";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-between py-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate("/resep")}
              className="rounded-full shadow-lg bg-white border-2 border-black"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className="rounded-full shadow-lg bg-white border-2 border-black"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                  }`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg bg-white border-2 border-black"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg bg-white border-2 border-black"
              >
                <Printer className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Title Section */}
          <div className="pb-8">
            <div className="flex flex-wrap gap-3 mb-5">
              <Badge className="shadow-lg bg-white text-black border-2 border-black px-4 py-1.5">
                {recipe.category}
              </Badge>
              <Badge className="shadow-lg bg-primary  text-black border-2 border-black px-4 py-1.5 hover:bg-yellow-500">
                {recipe.difficulty}
              </Badge>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-fredoka text-3xl md:text-5xl font-bold text-black drop-shadow-sm leading-tight mb-5"
            >
              {recipe.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-nunito text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed mb-8"
            >
              {recipe.description}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-xs text-gray-600 mb-1">Total Waktu</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {recipe.cookTime}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-xs text-gray-600 mb-1">Porsi</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {recipe.servings} orang
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-xs text-gray-600 mb-1">Kalori</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {recipe.calories} kcal
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-700" />
              <p className="text-xs text-gray-600 mb-1">Tingkat</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {recipe.difficulty}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Ingredients & Nutrition */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ingredients */}
            <Card className="shadow-lg border-2 border-black bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <ChefHat className="w-5 h-5" />
                  Bahan-Bahan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black">
                        {ingredient.item}
                      </p>
                      <p className="text-xs text-gray-600">
                        {ingredient.amount}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Nutrition */}
            {recipe.nutrition && (
              <Card className="shadow-lg border-2 border-black bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Flame className="w-5 h-5" />
                    Informasi Nutrisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recipe.nutrition.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-black">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Instructions & Tips */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-black p-0 gap-0 rounded-xl overflow-hidden">
                <TabsTrigger
                  value="steps"
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-semibold text-center py-3 rounded-none data-[state=active]:rounded-tl-lg"
                >
                  Langkah Memasak
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-semibold text-center py-3 rounded-none data-[state=active]:rounded-tr-lg"
                >
                  Tips & Trik
                </TabsTrigger>
              </TabsList>

              {/* Cooking Steps */}
              <TabsContent value="steps" className="mt-6">
                <Card className="shadow-lg border-2 border-black bg-white">
                  <CardHeader>
                    <CardTitle className="text-black">Cara Membuat</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    {recipe.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          completedSteps.includes(index)
                            ? "bg-green-50 border-green-400"
                            : "bg-gray-50 border-gray-200 hover:border-black"
                        }`}
                        onClick={() => toggleStep(index)}
                      >
                        <div className="flex gap-4">
                          <div className="shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-fredoka font-bold transition-all ${
                                completedSteps.includes(index)
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "bg-primary  border-yellow-500 text-black"
                              }`}
                            >
                              {completedSteps.includes(index) ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p
                              className={`leading-relaxed text-black ${
                                completedSteps.includes(index)
                                  ? "line-through text-gray-500"
                                  : ""
                              }`}
                            >
                              {step}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tips */}
              <TabsContent value="tips" className="mt-6">
                <Card className="shadow-lg border-2 border-black bg-white">
                  <CardHeader>
                    <CardTitle className="text-black">Tips & Trik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recipe.tips ? (
                      recipe.tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200"
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed text-black">
                            {tip}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 py-8">
                        Belum ada tips untuk resep ini
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-8 bg-accent border-2 border-black shadow-lg">
          <CardContent className="p-6 md:p-8 text-center">
            <h3 className="font-fredoka text-2xl md:text-3xl font-bold mb-3 text-accent-foreground">
              Sudah Coba Resep Ini?
            </h3>
            <p className="text-accent-foreground/90 mb-6 max-w-xl mx-auto">
              Bagikan pengalaman memasak Anda dan beri rating untuk resep ini!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-yellow-300 text-black border-2 border-black font-bold"
              >
                Beri Rating
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-black border-2 border-black hover:bg-gray-100 font-semibold"
              >
                Lihat Resep Lainnya
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
