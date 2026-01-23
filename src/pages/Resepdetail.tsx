import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResepAPI } from "@/types";
import { resepAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const categoryLabels: { [key: string]: string } = {
  "makanan": "Makanan",
  "minuman": "Minuman",
  "dessert": "Dessert",
  "snack": "Snack",
};

const difficultyLabels: { [key: string]: string } = {
  "mudah": "Mudah",
  "sedang": "Sedang",
  "sulit": "Sulit",
};

export default function ResepDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<ResepAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load recipe data from backend
  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await resepAPI.getById(Number(id));
        setRecipe(data);
      } catch (error) {
        console.error("Error loading recipe:", error);
        toast({
          title: "Error",
          description: "Gagal memuat detail resep",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "mudah":
        return "bg-accent";
      case "sedang":
        return "bg-primary";
      case "sulit":
        return "bg-highlight";
      default:
        return "bg-secondary";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
            <ChefHat className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat resep...</p>
        </div>
      </div>
    );
  }

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

  const mainImage = recipe.foto?.[0]?.file_path || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
  const totalTime = recipe.waktu_persiapan + recipe.waktu_memasak;
  const sortedSteps = [...(recipe.steps || [])].sort((a, b) => a.urutan - b.urutan);
  const sortedTips = [...(recipe.tips || [])].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={mainImage}
            alt={recipe.judul}
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
            }}
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
                {categoryLabels[recipe.kategori] || recipe.kategori}
              </Badge>
              <Badge className={`shadow-lg ${getDifficultyColor(recipe.tingkat_kesulitan)} text-black border-2 border-black px-4 py-1.5`}>
                {difficultyLabels[recipe.tingkat_kesulitan] || recipe.tingkat_kesulitan}
              </Badge>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-fredoka text-3xl md:text-5xl font-bold text-black drop-shadow-sm leading-tight mb-5"
            >
              {recipe.judul}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-nunito text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed mb-8"
            >
              {recipe.deskripsi}
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
                {formatTime(totalTime)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-xs text-gray-600 mb-1">Porsi</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {recipe.porsi} orang
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-xs text-gray-600 mb-1">Kalori</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {recipe.kalori} kcal
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-black bg-white">
            <CardContent className="p-4 text-center">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-700" />
              <p className="text-xs text-gray-600 mb-1">Tingkat</p>
              <p className="font-fredoka font-bold text-sm sm:text-base text-black">
                {difficultyLabels[recipe.tingkat_kesulitan] || recipe.tingkat_kesulitan}
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
                  Bahan-Bahan ({recipe.bahan?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.bahan && recipe.bahan.length > 0 ? (
                  recipe.bahan.map((ingredient, index) => (
                    <motion.div
                      key={ingredient.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-black">
                          {ingredient.nama}
                        </p>
                        <p className="text-xs text-gray-600">
                          {ingredient.takaran}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 py-4">Belum ada bahan</p>
                )}
              </CardContent>
            </Card>

            {/* Nutrition */}
            {recipe.nutrisi && recipe.nutrisi.length > 0 && (
              <Card className="shadow-lg border-2 border-black bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Flame className="w-5 h-5" />
                    Informasi Nutrisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recipe.nutrisi.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-black">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {item.nilai}
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
                  Langkah Memasak ({sortedSteps.length})
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-semibold text-center py-3 rounded-none data-[state=active]:rounded-tr-lg"
                >
                  Tips & Trik ({sortedTips.length})
                </TabsTrigger>
              </TabsList>

              {/* Cooking Steps */}
              <TabsContent value="steps" className="mt-6">
                <Card className="shadow-lg border-2 border-black bg-white">
                  <CardHeader>
                    <CardTitle className="text-black">Cara Membuat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-8">
                    {sortedSteps.length > 0 ? (
                      sortedSteps.map((step, index) => (
                        <motion.div
                          key={step.id || index}
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
                                    : "bg-primary border-yellow-500 text-black"
                                }`}
                              >
                                {completedSteps.includes(index) ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  step.urutan
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
                                {step.nama}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 py-8">
                        Belum ada langkah memasak
                      </p>
                    )}
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
                    {sortedTips.length > 0 ? (
                      sortedTips.map((tip, index) => (
                        <motion.div
                          key={tip.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200"
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed text-black">
                            {tip.nama}
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
                onClick={() => navigate("/resep")}
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
