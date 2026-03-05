import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { CATEGORIES, CITIES } from '../../services/mockData';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/uploadImage';
import { productService } from '../../services/api';
import './AddProduct.css';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        city: '',
        newProduct: true,
        delivery: false
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(file => uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            setImages(prev => [...prev, ...urls]);
        } catch (error) {
            alert("Şəkil yüklənməsi zamanı xəta baş verdi.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) {
            alert("Zəhmət olmasa ən azı bir şəkil əlavə edin.");
            return;
        }

        const productData = {
            ...formData,
            imageUrls: images
        };

        try {
            await productService.create(productData);
            alert('Məhsul əlavə edildi! Təsdiq üçün adminə göndərildi.');
            // Reset form or navigate
        } catch (error) {
            alert("Xəta baş verdi.");
        }
    };

    return (
        <div className="add-product-page">
            <Navbar />
            <main className="container">
                <div className="form-wrapper card fade-in">
                    <h1>Yeni Elan</h1>
                    <form onSubmit={handleSubmit}>
                        <section className="form-section">
                            <h3>Şəkillər</h3>
                            <div className="image-upload-grid">
                                {images.map((url, index) => (
                                    <div key={index} className="uploaded-image-preview">
                                        <img src={url} alt="Product preview" />
                                        <button type="button" className="remove-img-btn" onClick={() => removeImage(index)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <label className="upload-btn">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={uploading}
                                            style={{ display: 'none' }}
                                        />
                                        {uploading ? (
                                            <Loader2 size={32} className="animate-spin" />
                                        ) : (
                                            <>
                                                <ImagePlus size={32} />
                                                <span>Şəkil əlavə et</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>Məhsul Məlumatları</h3>
                            <div className="field-group">
                                <label>Başlıq</label>
                                <input
                                    type="text"
                                    placeholder="Məs: iPhone 13 Pro Max"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field-row">
                                <div className="field-group">
                                    <label>Kateqoriya</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Seçin</option>
                                        {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>Qiymət (AZN)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label>Təsvir</label>
                                <textarea
                                    rows="5"
                                    placeholder="Məhsul haqqında ətraflı məlumat..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>Əlavə Məlumatlar</h3>
                            <div className="field-row">
                                <div className="field-group">
                                    <label>Şəhər</label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    >
                                        <option value="">Seçin</option>
                                        {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.newProduct}
                                        onChange={(e) => setFormData({ ...formData, newProduct: e.target.checked })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span>Məhsul yenidir?</span>
                            </div>

                            <div className="checkbox-group">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.delivery}
                                        onChange={(e) => setFormData({ ...formData, delivery: e.target.checked })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span>Çatdırılma var?</span>
                            </div>
                        </section>

                        <button type="submit" className="btn-primary submit-elan" disabled={uploading}>
                            {uploading ? 'Şəkillər yüklənir...' : 'Elanı Yerləşdir'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AddProduct;
