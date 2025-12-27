import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Users,
  Search,
  Filter,
  Flame,
  Star,
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

// Mock data resep
const recipes = [
  {
    id: 1,
    title: "Nasi Goreng Spesial",
    description: "Nasi goreng khas Indonesia dengan bumbu rempah pilihan",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    category: "Makanan Utama",
    difficulty: "Mudah",
    cookTime: "20 menit",
    servings: 4,
    calories: 450,
    rating: 4.8,
    ingredients: [
      "2 piring nasi putih",
      "2 butir telur",
      "3 siung bawang putih",
      "5 siung bawang merah",
      "2 sdm kecap manis",
      "Garam dan merica secukupnya",
    ],
    steps: [
      "Tumis bumbu halus hingga harum",
      "Masukkan telur, orak-arik",
      "Tambahkan nasi, aduk rata",
      "Beri kecap manis dan bumbu",
      "Sajikan hangat",
    ],
  },
  {
    id: 2,
    title: "Soto Ayam Kuning",
    description: "Soto ayam dengan kuah kuning yang segar dan gurih",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
    category: "Makanan Utama",
    difficulty: "Sedang",
    cookTime: "45 menit",
    servings: 6,
    calories: 320,
    rating: 4.9,
    ingredients: [
      "500g ayam",
      "2 liter air",
      "3 batang serai",
      "4 lembar daun jeruk",
      "Kunyit, jahe, lengkuas",
      "Bawang goreng untuk taburan",
    ],
    steps: [
      "Rebus ayam hingga empuk",
      "Tumis bumbu halus",
      "Masukkan ke dalam kaldu",
      "Tambahkan serai dan daun jeruk",
      "Sajikan dengan pelengkap",
    ],
  },
  {
    id: 3,
    title: "Rendang Daging Sapi",
    description: "Rendang daging sapi khas Padang yang kaya rempah",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
    category: "Makanan Utama",
    difficulty: "Sulit",
    cookTime: "3 jam",
    servings: 8,
    calories: 580,
    rating: 5.0,
    ingredients: [
      "1kg daging sapi",
      "1 liter santan kental",
      "Cabai merah, bawang merah",
      "Lengkuas, serai, daun jeruk",
      "Asam kandis",
      "Garam dan gula merah",
    ],
    steps: [
      "Tumis bumbu halus hingga harum",
      "Masukkan daging, aduk rata",
      "Tuang santan, masak dengan api kecil",
      "Masak hingga bumbu meresap",
      "Lanjutkan hingga kuah mengering",
    ],
  },
  {
    id: 4,
    title: "Gado-Gado Jakarta",
    description: "Salad sayuran dengan saus kacang yang nikmat",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    category: "Makanan Sehat",
    difficulty: "Mudah",
    cookTime: "30 menit",
    servings: 4,
    calories: 280,
    rating: 4.7,
    ingredients: [
      "Kangkung, kol, tauge",
      "Kentang, tahu, tempe",
      "Telur rebus",
      "200g kacang tanah",
      "Cabai, bawang putih",
      "Gula merah, asam jawa",
    ],
    steps: [
      "Rebus semua sayuran",
      "Goreng tahu dan tempe",
      "Haluskan bumbu kacang",
      "Tata sayuran di piring",
      "Siram dengan saus kacang",
    ],
  },
  {
    id: 5,
    title: "Martabak Manis",
    description: "Martabak manis dengan berbagai topping favorit",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600",
    category: "Camilan",
    difficulty: "Sedang",
    cookTime: "40 menit",
    servings: 4,
    calories: 520,
    rating: 4.9,
    ingredients: [
      "250g tepung terigu",
      "3 butir telur",
      "200ml susu",
      "1 sdt ragi instan",
      "Coklat meses, keju",
      "Mentega dan gula pasir",
    ],
    steps: [
      "Campur tepung, telur, susu, dan ragi",
      "Diamkan adonan 30 menit",
      "Tuang adonan di loyang panas",
      "Taburi topping kesukaan",
      "Lipat dan sajikan",
    ],
  },
  {
    id: 6,
    title: "Es Cendol Dawet",
    description: "Minuman segar khas Indonesia dengan santan dan gula merah",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600",
    category: "Minuman",
    difficulty: "Mudah",
    cookTime: "25 menit",
    servings: 6,
    calories: 180,
    rating: 4.8,
    ingredients: [
      "100g tepung hunkwe",
      "Daun pandan",
      "200ml santan kental",
      "150g gula merah",
      "Es batu secukupnya",
    ],
    steps: [
      "Masak tepung hunkwe dengan pandan",
      "Cetak cendol dengan cetakan",
      "Masak gula merah dengan air",
      "Susun cendol, santan, sirup",
      "Tambahkan es batu",
    ],
  },
  {
    id: 7,
    title: "Ayam Geprek Sambal Matah",
    description: "Ayam crispy dengan sambal matah yang pedas segar",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600",
    category: "Makanan Utama",
    difficulty: "Mudah",
    cookTime: "35 menit",
    servings: 2,
    calories: 420,
    rating: 4.9,
    ingredients: [
      "2 potong ayam fillet",
      "Tepung bumbu siap pakai",
      "10 cabai rawit",
      "5 siung bawang merah",
      "Daun jeruk, serai",
      "Minyak goreng secukupnya",
    ],
    steps: [
      "Lumuri ayam dengan tepung bumbu",
      "Goreng hingga crispy",
      "Iris tipis bawang merah dan cabai",
      "Campur dengan jeruk nipis",
      "Geprek ayam, beri sambal",
    ],
  },
  {
    id: 8,
    title: "Klepon Ketan",
    description: "Kue tradisional dengan isian gula merah",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600",
    category: "Camilan",
    difficulty: "Sedang",
    cookTime: "45 menit",
    servings: 20,
    calories: 95,
    rating: 4.6,
    ingredients: [
      "250g tepung ketan",
      "100g gula merah sisir",
      "Daun pandan",
      "100g kelapa parut",
      "Air secukupnya",
      "Garam 1/4 sdt",
    ],
    steps: [
      "Campur tepung ketan dengan air pandan",
      "Bentuk bulat, isi gula merah",
      "Rebus hingga mengapung",
      "Kukus kelapa parut dengan garam",
      "Gulingkan klepon di kelapa",
    ],
  },
];

const categories = [
  "Semua",
  "Makanan Utama",
  "Makanan Sehat",
  "Camilan",
  "Minuman",
];
const difficulties = ["Semua", "Mudah", "Sedang", "Sulit"];

export default function Resep() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Semua");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Filter logic
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || recipe.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "Semua" ||
      recipe.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
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
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
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
            {filteredRecipes.map((recipe, index) => (
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
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge
                        variant="secondary"
                        className="shadow-lg backdrop-blur-sm"
                      >
                        {recipe.category}
                      </Badge>
                      <Badge
                        className={`${getDifficultyColor(
                          recipe.difficulty
                        )} shadow-lg`}
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border-2 border-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(recipe.id)
                            ? "fill-highlight text-highlight"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-highlight transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {recipe.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Recipe Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>{recipe.servings} porsi</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Flame className="w-4 h-4 shrink-0" />
                        <span>{recipe.calories} kal</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>{recipe.steps.length} langkah</span>
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
            ))}
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
