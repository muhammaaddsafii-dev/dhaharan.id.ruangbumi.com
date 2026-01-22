import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { resepService, Resep, ResepCreatePayload } from "@/services/resep.service";

// Frontend form data types
interface IngredientForm {
  nama: string;
  takaran: string;
}

interface NutritionForm {
  label: string;
  nilai: string;
}

interface ResepFormData {
  id?: number;
  judul: string;
  deskripsi: string;
  kategori: "makanan" | "minuman" | "dessert" | "snack";
  tingkat_kesulitan: "mudah" | "sedang" | "sulit";
  waktu_memasak: number;
  waktu_persiapan: number;
  porsi: number;
  kalori: number;
  bahan: IngredientForm[];
  steps: string[];
  tips: string[];
  nutrisi: NutritionForm[];
  selectedFiles: File[];
  existingPhotos: Array<{ id: number; url: string }>; // Changed to track ID
  deletedPhotoIds: number[]; // Track which photos to delete
}

// Constants
const KATEGORI_OPTIONS = [
  { value: "makanan", label: "Makanan" },
  { value: "minuman", label: "Minuman" },
  { value: "dessert", label: "Dessert" },
  { value: "snack", label: "Snack" },
];

const KESULITAN_OPTIONS = [
  { value: "mudah", label: "Mudah" },
  { value: "sedang", label: "Sedang" },
  { value: "sulit", label: "Sulit" },
];

export default function ManageResep() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Resep[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Resep | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ResepFormData>({
    judul: "",
    deskripsi: "",
    kategori: "makanan",
    tingkat_kesulitan: "mudah",
    waktu_memasak: 30,
    waktu_persiapan: 15,
    porsi: 4,
    kalori: 0,
    bahan: [{ nama: "", takaran: "" }],
    steps: [""],
    tips: [""],
    nutrisi: [{ label: "", nilai: "" }],
    selectedFiles: [],
    existingPhotos: [],
    deletedPhotoIds: [],
  });

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await resepService.getAllResep();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (error: any) {
      setRecipes([]); // Set empty array on error
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Gagal memuat resep",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recipes - add safety check
  const filteredRecipes = Array.isArray(recipes) 
    ? recipes.filter((recipe) =>
        recipe.judul.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Open dialog for add/edit
  const openDialog = async (recipe?: Resep) => {
    if (recipe) {
      // Load full recipe data with relations
      try {
        const fullRecipe = await resepService.getResepById(recipe.id!);
        setEditingRecipe(fullRecipe);
        
        // Map backend data to form
        setFormData({
          id: fullRecipe.id,
          judul: fullRecipe.judul,
          deskripsi: fullRecipe.deskripsi,
          kategori: fullRecipe.kategori,
          tingkat_kesulitan: fullRecipe.tingkat_kesulitan,
          waktu_memasak: fullRecipe.waktu_memasak,
          waktu_persiapan: fullRecipe.waktu_persiapan,
          porsi: fullRecipe.porsi,
          kalori: fullRecipe.kalori,
          bahan: fullRecipe.bahan?.length
            ? fullRecipe.bahan.map(b => ({ nama: b.nama, takaran: b.takaran }))
            : [{ nama: "", takaran: "" }],
          steps: fullRecipe.steps?.length
            ? fullRecipe.steps.map(s => s.nama)
            : [""],
          tips: fullRecipe.tips?.length
            ? fullRecipe.tips.map(t => t.nama)
            : [""],
          nutrisi: fullRecipe.nutrisi?.length
            ? fullRecipe.nutrisi.map(n => ({ label: n.label, nilai: n.nilai }))
            : [{ label: "", nilai: "" }],
          selectedFiles: [],
          existingPhotos: fullRecipe.foto?.map(f => ({ id: f.id!, url: f.file_path })) || [],
          deletedPhotoIds: [],
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Gagal memuat detail resep",
          variant: "destructive",
        });
        return;
      }
    } else {
      setEditingRecipe(null);
      setFormData({
        judul: "",
        deskripsi: "",
        kategori: "makanan",
        tingkat_kesulitan: "mudah",
        waktu_memasak: 30,
        waktu_persiapan: 15,
        porsi: 4,
        kalori: 0,
        bahan: [{ nama: "", takaran: "" }],
        steps: [""],
        tips: [""],
        nutrisi: [{ label: "", nilai: "" }],
        selectedFiles: [],
        existingPhotos: [],
        deletedPhotoIds: [],
      });
    }
    setIsDialogOpen(true);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate file types
      const invalidFiles = filesArray.filter(
        file => !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
      );
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Error",
          description: "Hanya file JPEG, PNG, dan WEBP yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file sizes (5MB max)
      const oversizedFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setFormData({ ...formData, selectedFiles: filesArray });
    }
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    const newFiles = formData.selectedFiles.filter((_, i) => i !== index);
    setFormData({ ...formData, selectedFiles: newFiles });
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!formData.judul || !formData.deskripsi) {
      toast({
        title: "Error",
        description: "Judul dan deskripsi wajib diisi!",
        variant: "destructive",
      });
      return;
    }

    // Filter empty items
    const filteredBahan = formData.bahan.filter(b => b.nama.trim() && b.takaran.trim());
    const filteredSteps = formData.steps.filter(s => s.trim());
    const filteredTips = formData.tips.filter(t => t.trim());
    const filteredNutrisi = formData.nutrisi.filter(n => n.label.trim() && n.nilai.trim());

    if (filteredBahan.length === 0) {
      toast({
        title: "Error",
        description: "Minimal satu bahan harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (filteredSteps.length === 0) {
      toast({
        title: "Error",
        description: "Minimal satu langkah harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Prepare payload
      const payload: ResepCreatePayload = {
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
        tingkat_kesulitan: formData.tingkat_kesulitan,
        waktu_memasak: formData.waktu_memasak,
        waktu_persiapan: formData.waktu_persiapan,
        porsi: formData.porsi,
        kalori: formData.kalori,
        bahan: filteredBahan,
        steps: filteredSteps.map((nama, index) => ({ urutan: index + 1, nama })),
        tips: filteredTips.map((nama, index) => ({ urutan: index + 1, nama })),
        nutrisi: filteredNutrisi,
      };

      let savedResep: Resep;

      if (editingRecipe) {
        // Update existing
        savedResep = await resepService.updateResep(editingRecipe.id!, payload);
        
        // Delete photos that were marked for deletion
        if (formData.deletedPhotoIds.length > 0) {
          await Promise.all(
            formData.deletedPhotoIds.map(photoId => 
              resepService.deleteFotoResep(photoId)
            )
          );
        }
        
        // Upload new photos if files were selected
        if (formData.selectedFiles.length > 0) {
          await Promise.all(
            formData.selectedFiles.map(file => 
              resepService.uploadAndAttachFoto(savedResep.id!, file)
            )
          );
        }
        
        toast({
          title: "Berhasil!",
          description: "Resep berhasil diperbarui",
        });
      } else {
        // Create new
        savedResep = await resepService.createResep(payload);
        
        // Upload photos if files were selected
        if (formData.selectedFiles.length > 0) {
          await Promise.all(
            formData.selectedFiles.map(file => 
              resepService.uploadAndAttachFoto(savedResep.id!, file)
            )
          );
        }
        
        toast({
          title: "Berhasil!",
          description: "Resep baru berhasil ditambahkan",
        });
      }

      // Reload recipes
      await loadRecipes();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal menyimpan resep",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await resepService.deleteResep(deleteId);
      toast({
        title: "Berhasil!",
        description: "Resep berhasil dihapus",
      });
      await loadRecipes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal menghapus resep",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Add item to array
  const addArrayItem = (field: "bahan" | "steps" | "tips" | "nutrisi") => {
    setFormData({
      ...formData,
      [field]:
        field === "bahan"
          ? [...formData.bahan, { nama: "", takaran: "" }]
          : field === "nutrisi"
          ? [...formData.nutrisi, { label: "", nilai: "" }]
          : [...formData[field], ""],
    });
  };

  // Remove item from array
  const removeArrayItem = (
    field: "bahan" | "steps" | "tips" | "nutrisi",
    index: number
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // Update array item
  const updateArrayItem = (
    field: "bahan" | "steps" | "tips" | "nutrisi",
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

  // Get display image for recipe
  const getRecipeImage = (recipe: Resep): string => {
    if (recipe.foto && recipe.foto.length > 0) {
      return recipe.foto[0].file_path;
    }
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
  };

  // Format waktu untuk tampilan
  const formatWaktu = (menit: number): string => {
    if (menit < 60) return `${menit} menit`;
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    if (sisaMenit === 0) return `${jam} jam`;
    return `${jam} jam ${sisaMenit} menit`;
  };

  // Get label for kategori
  const getKategoriLabel = (value: string): string => {
    const option = KATEGORI_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  // Get label for kesulitan
  const getKesulitanLabel = (value: string): string => {
    const option = KESULITAN_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
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
            disabled={isLoading}
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Recipe List */}
      {!isLoading && (
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
                    src={getRecipeImage(recipe)}
                    alt={recipe.judul}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary">
                      {getKategoriLabel(recipe.kategori)}
                    </Badge>
                    <Badge className="bg-primary">
                      {getKesulitanLabel(recipe.tingkat_kesulitan)}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-fredoka text-lg font-bold mb-2 line-clamp-1">
                    {recipe.judul}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recipe.deskripsi}
                  </p>

                  {/* Info */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatWaktu(recipe.waktu_memasak)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{recipe.porsi} porsi</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="w-3 h-3" />
                      <span>{recipe.kalori} kal</span>
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
                        setDeleteId(recipe.id!);
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
      )}

      {/* Empty State */}
      {!isLoading && filteredRecipes.length === 0 && (
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key={editingRecipe?.id || 'new'}>
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
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  placeholder="Contoh: Nasi Goreng Spesial"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Deskripsi *
                </label>
                <Textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Jelaskan resep ini..."
                  rows={3}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Foto Resep
                </label>
                
                {/* Existing photos preview */}
                {formData.existingPhotos.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Foto saat ini:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.existingPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="w-20 h-20 border rounded overflow-hidden">
                            <img
                              src={photo.url}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              // Remove from display and add to deleted list
                              const newPhotos = formData.existingPhotos.filter((_, i) => i !== index);
                              const newDeletedIds = [...formData.deletedPhotoIds, photo.id];
                              setFormData({ 
                                ...formData, 
                                existingPhotos: newPhotos,
                                deletedPhotoIds: newDeletedIds
                              });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File input */}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Selected files preview */}
                {formData.selectedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-20 h-20 border rounded overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  Format: JPEG, PNG, WEBP. Ukuran max: 5MB per file
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kategori
                  </label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, kategori: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KATEGORI_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
                    value={formData.tingkat_kesulitan}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, tingkat_kesulitan: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KESULITAN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Waktu Memasak (menit)
                  </label>
                  <Input
                    type="number"
                    value={formData.waktu_memasak}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        waktu_memasak: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Waktu Persiapan (menit)
                  </label>
                  <Input
                    type="number"
                    value={formData.waktu_persiapan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        waktu_persiapan: parseInt(e.target.value) || 0,
                      })
                    }
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
                    value={formData.porsi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        porsi: parseInt(e.target.value) || 0,
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
                    value={formData.kalori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kalori: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Bahan-Bahan *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("bahan")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {formData.bahan.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nama bahan"
                    value={ing.nama}
                    onChange={(e) =>
                      updateArrayItem("bahan", index, {
                        ...ing,
                        nama: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Takaran"
                    value={ing.takaran}
                    onChange={(e) =>
                      updateArrayItem("bahan", index, {
                        ...ing,
                        takaran: e.target.value,
                      })
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("bahan", index)}
                    disabled={formData.bahan.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Langkah-Langkah *</h3>
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
                    disabled={formData.steps.length === 1}
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
                    disabled={formData.tips.length === 1}
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
                  onClick={() => addArrayItem("nutrisi")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {formData.nutrisi.map((nutr, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Label (contoh: Protein)"
                    value={nutr.label}
                    onChange={(e) =>
                      updateArrayItem("nutrisi", index, {
                        ...nutr,
                        label: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Nilai (contoh: 12g)"
                    value={nutr.nilai}
                    onChange={(e) =>
                      updateArrayItem("nutrisi", index, {
                        ...nutr,
                        nilai: e.target.value,
                      })
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("nutrisi", index)}
                    disabled={formData.nutrisi.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              className="gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingRecipe ? "Update" : "Simpan"}
                </>
              )}
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
