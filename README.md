# Django E-Commerce Store

Aplikasi e-commerce modern yang dibangun dengan Django, dilengkapi dengan sistem pembayaran Midtrans, manajemen produk yang lengkap, dan antarmuka yang responsif.

## 📋 Fitur Utama

### 🛍️ Fitur Toko
- **Katalog Produk**: Tampilan produk dengan gambar, harga, dan diskon
- **Kategori Produk**: Sistem kategori hierarkis dengan filtering
- **Detail Produk**: Halaman detail dengan spesifikasi lengkap dan gambar multiple
- **Sistem Review**: Rating dan ulasan produk dari pengguna
- **Pencarian Produk**: Pencarian berdasarkan nama dan kategori
- **Pagination**: Tampilan produk dengan sistem halaman

### 🛒 Keranjang Belanja
- **Keranjang Real-time**: Update keranjang tanpa refresh halaman
- **Varian Produk**: Dukungan untuk varian warna, ukuran, dll
- **Guest Cart**: Keranjang untuk pengguna yang belum login (menggunakan cookies)
- **Persistent Cart**: Keranjang tersimpan untuk pengguna terdaftar

### 💳 Sistem Pembayaran
- **Integrasi Midtrans**: Payment gateway lengkap dengan berbagai metode
- **Multiple Payment Methods**: Credit card, e-wallet, bank transfer
- **Transaction Tracking**: Pelacakan status transaksi real-time
- **Webhook Handling**: Otomatis update status pembayaran
- **Order Management**: Sistem manajemen pesanan yang komprehensif

### 👤 Manajemen Pengguna
- **Autentikasi**: Login, logout, dan registrasi pengguna
- **Profil Pengguna**: Edit profil, avatar, dan informasi kontak
- **Riwayat Pesanan**: Tracking pesanan dan status pembayaran
- **Address Management**: Manajemen alamat pengiriman

### 📦 Manajemen Produk (Admin)
- **Product Variants**: Varian produk dengan harga berbeda
- **Stock Management**: Manajemen stok dan status ketersediaan
- **Image Gallery**: Multiple gambar untuk setiap produk
- **SEO Friendly**: URL slug dan metadata
- **Digital Products**: Dukungan untuk produk digital

## 🛠️ Teknologi yang Digunakan

- **Backend**: Django 4.x
- **Database**: SQLite (default) / PostgreSQL (production)
- **Payment Gateway**: Midtrans
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Media Storage**: Django static files
- **Authentication**: Django built-in authentication

## 📁 Struktur Proyek

```
store/
├── models.py          # Model database (Product, Order, Customer, dll)
├── views.py           # Logic aplikasi dan handling request
├── urls.py            # URL routing
├── admin.py           # Konfigurasi Django admin
├── forms.py           # Form handling
├── utils.py           # Utility functions (cart handling)
├── signals.py         # Django signals untuk auto-create profile
├── templates/
│   └── store/
│       ├── store.html
│       ├── product_detail.html
│       ├── cart.html
│       ├── checkout.html
│       └── ...
└── static/
    └── store/
        ├── css/
        ├── js/
        └── images/
```

## ⚙️ Instalasi dan Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd django-ecommerce-store
```

### 2. Buat Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies
```bash
pip install django
pip install midtransclient
pip install Pillow  # untuk image handling
```

### 4. Konfigurasi Environment Variables
Buat file `.env` di root project:
```env
SECRET_KEY=your_secret_key_here
DEBUG=True

# Midtrans Configuration
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_IS_PRODUCTION=False
```

### 5. Konfigurasi Settings
Tambahkan di `settings.py`:
```python
# Midtrans Settings
MIDTRANS_CLIENT_KEY = os.getenv('MIDTRANS_CLIENT_KEY')
MIDTRANS_SERVER_KEY = os.getenv('MIDTRANS_SERVER_KEY')
MIDTRANS_MERCHANT_ID = os.getenv('MIDTRANS_MERCHANT_ID')
MIDTRANS_IS_PRODUCTION = os.getenv('MIDTRANS_IS_PRODUCTION', 'False').lower() == 'true'

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### 6. Migrasi Database
```bash
python manage.py makemigrations store
python manage.py migrate
```

### 7. Buat Superuser
```bash
python manage.py createsuperuser
```

### 8. Jalankan Server
```bash
python manage.py runserver
```

## 📊 Model Database

### Product
- `name`: Nama produk
- `price`: Harga dalam Rupiah
- `discount_percent`: Persentase diskon
- `kategori`: Kategori produk
- `stock`: Jumlah stok
- `rating`: Rating produk (1-5)
- `images`: Multiple gambar produk

### ProductVariant
- `variant_type`: Jenis varian (color, size, material)
- `price_adjustment`: Penyesuaian harga untuk varian
- `stock`: Stok untuk varian tertentu

### Order & OrderItem
- `customer`: Pelanggan
- `complete`: Status order selesai
- `transaction_id`: ID transaksi unik

### Transaction
- `order`: Relasi ke Order
- `status`: Status pembayaran
- `payment_response`: Response dari Midtrans

## 🔧 Konfigurasi Midtrans

1. **Daftar di Midtrans**: [https://midtrans.com](https://midtrans.com)
2. **Dapatkan kredensial**:
   - Client Key
   - Server Key
   - Merchant ID
3. **Setup Webhook URL** di dashboard Midtrans:
   ```
   https://yourdomain.com/midtrans-notification/
   ```

## 🌐 URL Endpoints

```python
# Autentikasi
/login/                 # Login pengguna
/logout/                # Logout pengguna
/register/              # Registrasi pengguna

# Toko
/                       # Halaman utama toko
/product/<id>/          # Detail produk
/categories/            # Daftar kategori
/category/<slug>/       # Produk dalam kategori

# Keranjang & Checkout
/cart/                  # Keranjang belanja
/checkout/              # Halaman checkout
/update_item/           # Update item keranjang (AJAX)

# Pembayaran
/create-transaction/    # Buat transaksi pembayaran
/payment/success/       # Callback sukses
/payment/error/         # Callback error
/midtrans-notification/ # Webhook Midtrans

# Profil
/profil/                # Halaman profil
/profil/edit/           # Edit profil
```

## 🎨 Customization

### Menambah Kategori Baru
```python
# Di models.py, edit KATEGORI_CHOICES
KATEGORI_CHOICES = (
    ('Elektronik', 'Elektronik'),
    ('Pakaian', 'Pakaian'),
    ('Makanan', 'Makanan'),
    ('Minuman', 'Minuman'),
    ('Kategori_Baru', 'Kategori Baru'),  # Tambah di sini
    ('Lainnya', 'Lainnya'),
)
```

### Custom Field Rupiah
Proyek ini menggunakan custom field `FieldRupiah` untuk handling mata uang:
```python
class FieldRupiah(models.IntegerField):
    def to_python(self, value):
        # Auto-convert string dengan format "Rp1.000.000" ke integer
        if isinstance(value, str):
            return int(value.replace('Rp', '').replace('.', ''))
        return value
```

## 🔍 Testing

### Test Manual
1. **Registrasi & Login**: Test flow autentikasi
2. **Add to Cart**: Test penambahan produk ke keranjang
3. **Checkout Process**: Test proses checkout lengkap
4. **Payment**: Test dengan Midtrans sandbox
5. **Admin Panel**: Test CRUD operations

### Test Data
```bash
# Buat sample data melalui Django admin atau shell
python manage.py shell

# Contoh membuat produk
from store.models import Product
Product.objects.create(
    name="Sample Product",
    price=100000,
    kategori="Elektronik",
    stock=10
)
```

## 🚀 Deployment

### 1. Production Settings
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']

# Database PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 2. Static Files
```bash
python manage.py collectstatic
```

### 3. Set Midtrans ke Production
```env
MIDTRANS_IS_PRODUCTION=True
```

## 🛡️ Security Features

- **CSRF Protection**: Django built-in CSRF protection
- **SQL Injection Protection**: Django ORM protection
- **Authentication Required**: Login required untuk checkout
- **Payment Security**: Midtrans secure payment gateway
- **Input Validation**: Form validation dan sanitization

## 📝 Todo / Roadmap

- [ ] **Email Notifications**: Email konfirmasi pesanan
- [ ] **Coupon System**: Sistem kupon diskon
- [ ] **Wishlist**: Daftar keinginan pengguna
- [ ] **Advanced Search**: Filter harga, rating, dll
- [ ] **Social Login**: Login dengan Google/Facebook
- [ ] **Multi-language**: Dukungan multi bahasa
- [ ] **API REST**: RESTful API untuk mobile app
- [ ] **Real-time Chat**: Customer service chat

## 🤝 Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📞 Support

Jika ada pertanyaan atau issues:
1. Buat issue di GitHub repository
2. Email: your-email@example.com

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

**Happy Coding! 🚀**