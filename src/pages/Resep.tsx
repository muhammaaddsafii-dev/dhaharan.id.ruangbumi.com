import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Users,
  Search,
  Filter,
  Flame,
  Heart,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResepAPI } from "@/types";
import { resepAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const categories = [
  "Semua",
  "makanan",
  "minuman",
  "dessert",
  "snack",
];

const categoryLabels: { [key: string]: string } = {
  "makanan": "Makanan",
  "minuman": "Minuman",
  "dessert": "Dessert",
  "snack": "Snack",
};

const difficulties = ["Semua", "mudah", "sedang", "sulit"];

const difficultyLabels: { [key: string]: string } = {
  "mudah": "Mudah",
  "sedang": "Sedang",
  "sulit": "Sulit",
};

export default function Resep() {
  const [recipes, setRecipes] = useState<ResepAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Semua");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await resepAPI.getAll();
        setRecipes(data);
      } catch (error) {
        console.error("Error loading resep:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data resep",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter logic
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || recipe.kategori === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "Semua" ||
      recipe.tingkat_kesulitan === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
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
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
            <ChefHat className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat resep...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="highlight">
            <ChefHat className="w-4 h-4 mr-1" />
            Resep Pilihan
          </Badge>

          <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-4">
            Resep Masakan Nusantara
          </h1>

          <p className="font-nunito text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai resep masakan Indonesia yang lezat dan mudah dibuat
            untuk keluarga tercinta.
          </p>
        </motion.div>

        {/* Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-md border-2 border-foreground shadow-cartoon-sm">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua</SelectItem>
                  {categories.slice(1).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Flame className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-md border-2 border-foreground shadow-cartoon-sm">
                  <SelectValue placeholder="Tingkat Kesulitan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua</SelectItem>
                  {difficulties.slice(1).map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {difficultyLabels[diff]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari resep favorit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe, index) => {
              const mainImage = recipe.foto?.[0]?.file_path || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
              const totalTime = recipe.waktu_persiapan + recipe.waktu_memasak;
              
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden h-full group hover:shadow-cartoon-lg transition-shadow">
                    {/* Image Section */}
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={mainImage}
                        alt={recipe.judul}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                        }}
                      />

                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge
                          variant="secondary"
                          className="shadow-lg backdrop-blur-sm"
                        >
                          {categoryLabels[recipe.kategori] || recipe.kategori}
                        </Badge>
                        <Badge
                          className={`${getDifficultyColor(
                            recipe.tingkat_kesulitan
                          )} shadow-lg`}
                        >
                          {difficultyLabels[recipe.tingkat_kesulitan] || recipe.tingkat_kesulitan}
                        </Badge>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(recipe.id!)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border-2 border-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(recipe.id!)
                              ? "fill-highlight text-highlight"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-highlight transition-colors">
                        {recipe.judul}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {recipe.deskripsi}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Recipe Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{formatTime(totalTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-4 h-4 shrink-0" />
                          <span>{recipe.porsi} porsi</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Flame className="w-4 h-4 shrink-0" />
                          <span>{recipe.kalori} kal</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <span>{recipe.steps?.length || 0} langkah</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link to={`/resep/${recipe.id}`}>
                        <Button className="w-full mt-4" size="sm">
                          Lihat Resep Lengkap
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-muted-foreground" />
            </div>

            <h3 className="font-fredoka text-xl font-semibold mb-2">
              Resep tidak ditemukan
            </h3>

            <p className="font-nunito text-muted-foreground">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
