import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  Clock,
  Users,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

// Types
interface Ingredient {
  item: string;
  amount: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  cookTime: string;
  prepTime: string;
  servings: number;
  calories: number;
  ingredients: Ingredient[];
  steps: string[];
  tips: string[];
  nutrition: { label: string; value: string }[];
}

// Initial mock data
const initialRecipes: Recipe[] = [
  {
    id: 1,
    title: "Nasi Goreng Spesial",
    description: "Nasi goreng khas Indonesia dengan bumbu rempah pilihan",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    category: "Makanan Utama",
    difficulty: "Mudah",
    cookTime: "20 menit",
    prepTime: "10 menit",
    servings: 4,
    calories: 450,
    ingredients: [
      { item: "Nasi putih", amount: "2 piring" },
      { item: "Telur ayam", amount: "2 butir" },
    ],
    steps: ["Panaskan minyak dalam wajan", "Tumis bumbu hingga harum"],
    tips: ["Gunakan nasi dingin untuk hasil terbaik"],
    nutrition: [
      { label: "Kalori", value: "450 kcal" },
      { label: "Protein", value: "12g" },
    ],
  },
];

const categories = ["Makanan Utama", "Makanan Sehat", "Camilan", "Minuman"];
const difficulties = ["Mudah", "Sedang", "Sulit"];

export default function ManageResep() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<Recipe>({
    id: 0,
    title: "",
    description: "",
    image: "",
    category: "Makanan Utama",
    difficulty: "Mudah",
    cookTime: "",
    prepTime: "",
    servings: 4,
    calories: 0,
    ingredients: [{ item: "", amount: "" }],
    steps: [""],
    tips: [""],
    nutrition: [{ label: "", value: "" }],
  });

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog for add/edit
  const openDialog = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setFormData(recipe);
    } else {
      setEditingRecipe(null);
      setFormData({
        id: Date.now(),
        title: "",
        description: "",
        image: "",
        category: "Makanan Utama",
        difficulty: "Mudah",
        cookTime: "",
        prepTime: "",
        servings: 4,
        calories: 0,
        ingredients: [{ item: "", amount: "" }],
        steps: [""],
        tips: [""],
        nutrition: [{ label: "", value: "" }],
      });
    }
    setIsDialogOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Judul dan deskripsi wajib diisi!",
        variant: "destructive",
      });
      return;
    }

    if (editingRecipe) {
      // Update existing
      setRecipes(
        recipes.map((r) => (r.id === editingRecipe.id ? formData : r))
      );
      toast({
        title: "Berhasil!",
        description: "Resep berhasil diperbarui",
      });
    } else {
      // Add new
      setRecipes([...recipes, formData]);
      toast({
        title: "Berhasil!",
        description: "Resep baru berhasil ditambahkan",
      });
    }

    setIsDialogOpen(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteId) {
      setRecipes(recipes.filter((r) => r.id !== deleteId));
      toast({
        title: "Berhasil!",
        description: "Resep berhasil dihapus",
      });
    }
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Add item to array
  const addArrayItem = (
    field: "ingredients" | "steps" | "tips" | "nutrition"
  ) => {
    setFormData({
      ...formData,
      [field]:
        field === "ingredients"
          ? [...formData.ingredients, { item: "", amount: "" }]
          : field === "nutrition"
          ? [...formData.nutrition, { label: "", value: "" }]
          : [...formData[field], ""],
    });
  };

  // Remove item from array
  const removeArrayItem = (
    field: "ingredients" | "steps" | "tips" | "nutrition",
    index: number
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // Update array item
  const updateArrayItem = (
    field: "ingredients" | "steps" | "tips" | "nutrition",
    index: number,
    value: any
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Kelola Resep 🍳
            </h1>
            <p className="text-muted-foreground font-nunito text-sm sm:text-base">
              Tambah, edit, atau hapus resep masakan
            </p>
          </div>

          <Button
            onClick={() => openDialog()}
            className="gap-2 h-11 px-6"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Tambah Resep
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari resep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11"
          />
        </div>
      </motion.div>

      {/* Recipe List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRecipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden h-full">
              {/* Image */}
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary">{recipe.category}</Badge>
                  <Badge className="bg-primary">{recipe.difficulty}</Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="font-fredoka text-lg font-bold mb-2 line-clamp-1">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Info */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{recipe.servings} porsi</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Flame className="w-3 h-3" />
                    <span>{recipe.calories} kal</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => openDialog(recipe)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setDeleteId(recipe.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-fredoka text-xl font-bold mb-2">
            Tidak ada resep
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Coba kata kunci lain"
              : "Mulai tambahkan resep pertama"}
          </p>
          {!searchQuery && (
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Resep
            </Button>
          )}
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-2xl">
              {editingRecipe ? "Edit Resep" : "Tambah Resep Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Dasar</h3>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Judul Resep *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Contoh: Nasi Goreng Spesial"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Deskripsi *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan resep ini..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  URL Gambar
                </label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kategori
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tingkat Kesulitan
                  </label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Waktu Memasak
                  </label>
                  <Input
                    value={formData.cookTime}
                    onChange={(e) =>
                      setFormData({ ...formData, cookTime: e.target.value })
                    }
                    placeholder="Contoh: 30 menit"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Waktu Persiapan
                  </label>
                  <Input
                    value={formData.prepTime}
                    onChange={(e) =>
                      setFormData({ ...formData, prepTime: e.target.value })
                    }
                    placeholder="Contoh: 15 menit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Porsi
                  </label>
                  <Input
                    type="number"
                    value={formData.servings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servings: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kalori
                  </label>
                  <Input
                    type="number"
                    value={formData.calories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calories: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Bahan-Bahan</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("ingredients")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nama bahan"
                    value={ing.item}
                    onChange={(e) =>
                      updateArrayItem("ingredients", index, {
                        ...ing,
                        item: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Takaran"
                    value={ing.amount}
                    onChange={(e) =>
                      updateArrayItem("ingredients", index, {
                        ...ing,
                        amount: e.target.value,
                      })
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("ingredients", index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Langkah-Langkah</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("steps")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="w-8 h-10 flex items-center justify-center font-bold text-sm">
                    {index + 1}.
                  </span>
                  <Textarea
                    placeholder="Jelaskan langkah ini..."
                    value={step}
                    onChange={(e) =>
                      updateArrayItem("steps", index, e.target.value)
                    }
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("steps", index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Tips & Trik</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("tips")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {formData.tips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Masukkan tips..."
                    value={tip}
                    onChange={(e) =>
                      updateArrayItem("tips", index, e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("tips", index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Nutrition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Informasi Nutrisi</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("nutrition")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {formData.nutrition.map((nutr, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Label (contoh: Protein)"
                    value={nutr.label}
                    onChange={(e) =>
                      updateArrayItem("nutrition", index, {
                        ...nutr,
                        label: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Nilai (contoh: 12g)"
                    value={nutr.value}
                    onChange={(e) =>
                      updateArrayItem("nutrition", index, {
                        ...nutr,
                        value: e.target.value,
                      })
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("nutrition", index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {editingRecipe ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus resep ini? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
