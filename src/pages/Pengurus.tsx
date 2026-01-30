import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Pencil, Trash2, X, Upload, Image as ImageIcon } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pengurus } from "@/types";
import { pengurusAPI, uploadToS3 } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/formatters";

export default function PengurusPage() {
    const [pengurusList, setPengurusList] = useState<Pengurus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPengurus, setEditingPengurus] = useState<Pengurus | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        nama: "",
        jabatan: "",
        photo: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        loadPengurus();
    }, []);

    const loadPengurus = async () => {
        try {
            setIsLoading(true);
            const data = await pengurusAPI.getAll();
            setPengurusList(data);
        } catch (error) {
            console.error("Error loading pengurus:", error);
            toast({
                title: "Error",
                description: "Gagal memuat data pengurus",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ nama: "", jabatan: "", photo: "" });
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditingPengurus(null);
    };

    const handleCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (pengurus: Pengurus) => {
        setEditingPengurus(pengurus);
        setFormData({
            nama: pengurus.nama,
            jabatan: pengurus.jabatan,
            photo: pengurus.photo || "",
        });
        setPreviewUrl(pengurus.photo || null);
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, nama: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus pengurus ${nama}?`)) {
            return;
        }

        try {
            await pengurusAPI.delete(id);
            toast({
                title: "Pengurus Dihapus",
                description: "Data pengurus berhasil dihapus",
            });
            loadPengurus();
        } catch (error) {
            console.error("Error deleting pengurus:", error);
            toast({
                title: "Error",
                description: "Gagal menghapus pengurus",
                variant: "destructive",
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let photoUrl = formData.photo;

            // Upload photo if new file selected
            if (selectedFile) {
                photoUrl = await uploadToS3(selectedFile, 'pengurus');
            }

            const payload = {
                nama: formData.nama,
                jabatan: formData.jabatan,
                photo: photoUrl,
            };

            if (editingPengurus) {
                await pengurusAPI.update(editingPengurus.id!, payload);
                toast({
                    title: "Sukses",
                    description: "Data pengurus berhasil diperbarui",
                });
            } else {
                await pengurusAPI.create(payload);
                toast({
                    title: "Sukses",
                    description: "Data pengurus berhasil ditambahkan",
                });
            }

            setIsModalOpen(false);
            resetForm();
            loadPengurus();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: "Gagal menyimpan data pengurus",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary border-2 border-foreground shadow-cartoon flex items-center justify-center animate-pulse">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Memuat data pengurus...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
            >
                <div>
                    <h1 className="font-fredoka text-3xl md:text-4xl font-bold mb-2">
                        Kelola Pengurus
                    </h1>
                    <p className="text-muted-foreground font-nunito">
                        Tambah dan kelola daftar pengurus komunitas
                    </p>
                </div>
                <Button onClick={handleCreate} size="lg" className="shrink-0">
                    <Plus className="w-5 h-5 mr-1" />
                    Tambah Pengurus
                </Button>
            </motion.div>

            {pengurusList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pengurusList.map((p, index) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-cartoon transition-all h-full overflow-hidden">
                                <div className="aspect-square relative bg-secondary">
                                    {p.photo ? (
                                        <img
                                            src={p.photo}
                                            alt={p.nama}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-muted-foreground opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-7 w-7 rounded-full shadow-md border-1"
                                            onClick={() => handleEdit(p)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-7 w-7 rounded-full shadow-md border-1"
                                            onClick={() => handleDelete(p.id!, p.nama)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-3">
                                    <h3 className="font-fredoka text-sm sm:text-base font-bold truncate">
                                        {p.nama}
                                    </h3>
                                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-5">
                                        {p.jabatan}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {p.created_at ? formatDate(p.created_at) : "-"}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 text-muted-foreground bg-secondary/20 rounded-3xl border-2 border-dashed border-muted-foreground/20">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Belum ada data pengurus</p>
                    <p className="text-sm mb-6">Mulai dengan menambahkan pengurus baru</p>
                    <Button onClick={handleCreate} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pengurus
                    </Button>
                </div>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-lg bg-card border-2 border-foreground rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-fredoka text-xl font-bold">
                                            {editingPengurus ? "Edit Pengurus" : "Tambah Pengurus"}
                                        </h2>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setIsModalOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="photo">Foto</Label>
                                            <div className="flex justify-center mb-4">
                                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-secondary bg-secondary group">
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <Upload className="w-8 h-8 text-white" />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id="photo"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={handleFileChange}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-center text-muted-foreground">
                                                Klik gambar untuk mengganti foto
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nama">Nama Lengkap *</Label>
                                            <Input
                                                id="nama"
                                                value={formData.nama}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, nama: e.target.value })
                                                }
                                                placeholder="Nama Lengkap"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="jabatan">Jabatan *</Label>
                                            <Input
                                                id="jabatan"
                                                value={formData.jabatan}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, jabatan: e.target.value })
                                                }
                                                placeholder="Contoh: Ketua, Sekretaris, dll"
                                                required
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setIsModalOpen(false)}
                                                disabled={isSubmitting}
                                            >
                                                Batal
                                            </Button>
                                            <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
