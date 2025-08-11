from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Custom field untuk Rupiah
class FieldRupiah(models.IntegerField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def to_python(self, value):
        if value is None:
            return 0
        if isinstance(value, int):
            return value
        if isinstance(value, str):
            # Menghapus 'Rp' jika ada dan menghapus titik pemisah ribuan
            try:
                value = value.replace('Rp', '').replace('.', '')
                return int(value)
            except ValueError:
                return 0
        return value

# Alias untuk kompatibilitas dengan migrasi
RupiahField = FieldRupiah

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nama Kategori")
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True, verbose_name="Deskripsi")
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    icon_class = models.CharField(max_length=50, null=True, blank=True, verbose_name="Kelas Icon FontAwesome", 
                                 help_text="Contoh: fa-mobile-alt")
    
    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategori"
        ordering = ['name']
        
    def __str__(self):
        return self.name
        
    @property
    def imageURL(self):
        try:
            return self.image.url
        except:
            return ''
            
    @property
    def get_products_count(self):
        """Menghitung jumlah produk dalam kategori dan subkategori."""
        count = Product.objects.filter(kategori=self.name).count()
        for child in self.children.all():
            count += Product.objects.filter(kategori=child.name).count()
        return count

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)  # Perbolehkan NULL
    name = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.email if self.email else "No Email"

class Product(models.Model):
    KATEGORI_CHOICES = (
        ('Elektronik', 'Elektronik'),
        ('Pakaian', 'Pakaian'),
        ('Makanan', 'Makanan'), 
        ('Minuman', 'Minuman'),
        ('Lainnya', 'Lainnya'),
    )
    
    STATUS_CHOICES = (
        ('available', 'Tersedia'),
        ('low_stock', 'Stok Menipis'),
        ('out_of_stock', 'Habis'),
        ('pre_order', 'Pre-Order'),
    )

    name = models.CharField(max_length=200, verbose_name="Nama Produk")
    slug = models.SlugField(max_length=200, unique=True, null=True, blank=True, verbose_name="Slug URL")
    price = FieldRupiah(
        validators=[MinValueValidator(0)],
        verbose_name="Harga (Rp)"
    )
    discount_percent = models.IntegerField(default=0, verbose_name="Diskon (%)", 
                                          validators=[MinValueValidator(0), MaxValueValidator(100)])
    digital = models.BooleanField(default=False, null=True, blank=True, verbose_name="Produk Digital")
    image = models.ImageField(null=True, blank=True, verbose_name="Gambar Utama")
    image_2 = models.ImageField(null=True, blank=True, verbose_name="Gambar Tambahan 1")
    image_3 = models.ImageField(null=True, blank=True, verbose_name="Gambar Tambahan 2")
    image_4 = models.ImageField(null=True, blank=True, verbose_name="Gambar Tambahan 3")
    kategori = models.CharField(
        max_length=50,
        choices=KATEGORI_CHOICES,
        default='Lainnya',
        verbose_name="Kategori"
    )
    description = models.TextField(null=True, blank=True, verbose_name="Deskripsi Produk")
    
    # Fitur-fitur Produk
    features = models.TextField(null=True, blank=True, verbose_name="Fitur Produk")
    specifications = models.JSONField(null=True, blank=True, verbose_name="Spesifikasi Teknis", 
                                     help_text="Masukkan spesifikasi dalam format JSON, contoh: {'Ukuran': '10cm x 5cm', 'Berat': '250g'}")
    
    # Informasi Stok dan Penjualan
    stock = models.PositiveIntegerField(default=0, verbose_name="Stok Tersedia")
    stock_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', verbose_name="Status Stok")
    sales_count = models.PositiveIntegerField(default=0, verbose_name="Jumlah Terjual")
    
    # Informasi Rating dan Ulasan
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0, 
                                validators=[MinValueValidator(0), MaxValueValidator(5)],
                                verbose_name="Rating Produk")
    review_count = models.PositiveIntegerField(default=0, verbose_name="Jumlah Ulasan")
    
    # Metadata
    is_featured = models.BooleanField(default=False, verbose_name="Produk Unggulan")
    is_new = models.BooleanField(default=True, verbose_name="Produk Baru")
    weight = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Berat (gram)")
    dimensions = models.CharField(max_length=100, null=True, blank=True, verbose_name="Dimensi (PxLxT)")
    sku = models.CharField(max_length=50, null=True, blank=True, verbose_name="SKU", help_text="Stock Keeping Unit")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Tanggal Dibuat")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Terakhir Diperbarui")

    @property
    def format_harga(self):
        """Format harga dalam Rupiah dengan pemisah ribuan."""
        try:
            return f"Rp{self.price:,}".replace(',', '.')
        except (ValueError, TypeError):
            return "Rp0"
    
    @property
    def get_discount_price(self):
        """Menghitung harga setelah diskon."""
        if self.discount_percent > 0:
            discount_amount = (self.price * self.discount_percent) / 100
            return self.price - discount_amount
        return self.price
    
    @property
    def format_discount_price(self):
        """Format harga diskon dalam Rupiah dengan pemisah ribuan."""
        try:
            discount_price = self.get_discount_price
            return f"Rp{discount_price:,}".replace(',', '.')
        except (ValueError, TypeError):
            return "Rp0"
    
    @property
    def has_discount(self):
        """Cek apakah produk memiliki diskon."""
        return self.discount_percent > 0
    
    @property
    def stock_percentage(self):
        """Menghitung persentase stok tersedia dari total stok awal."""
        # Asumsikan total stok awal adalah jumlah terjual + stok tersedia
        total_stock = self.sales_count + self.stock
        if total_stock > 0:
            return (self.stock / total_stock) * 100
        return 100  # Jika belum ada penjualan, anggap stok 100%
    
    @property
    def get_category(self):
        """Mendapatkan objek kategori berdasarkan nama kategori."""
        try:
            return Category.objects.get(name=self.kategori)
        except Category.DoesNotExist:
            return None

    def __str__(self):
        return self.name

    @property 
    def imageURL(self):
        try:
            url = self.image.url
        except:
            url = ''
        return url
    
    @property
    def image2URL(self):
        try:
            return self.image_2.url
        except:
            return ''
    
    @property
    def image3URL(self):
        try:
            return self.image_3.url
        except:
            return ''
    
    @property
    def image4URL(self):
        try:
            return self.image_4.url
        except:
            return ''
    
    @property
    def all_images(self):
        """Mengumpulkan semua URL gambar produk yang tersedia."""
        images = [self.imageURL]
        if self.image2URL:
            images.append(self.image2URL)
        if self.image3URL:
            images.append(self.image3URL)
        if self.image4URL:
            images.append(self.image4URL)
        return images
    
    @property
    def get_features_list(self):
        """Mengubah fitur produk menjadi list."""
        if self.features:
            return [feature.strip() for feature in self.features.split('\n') if feature.strip()]
        return []
    
    class Meta:
        verbose_name = "Produk"
        verbose_name_plural = "Produk"
        ordering = ['-created_at']

class ProductReview(models.Model):
    RATING_CHOICES = (
        (1, '1 - Sangat Buruk'),
        (2, '2 - Buruk'),
        (3, '3 - Cukup'),
        (4, '4 - Baik'),
        (5, '5 - Sangat Baik'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    review_text = models.TextField(verbose_name="Ulasan")
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified_purchase = models.BooleanField(default=False, verbose_name="Pembelian Terverifikasi")
    
    class Meta:
        verbose_name = "Ulasan Produk"
        verbose_name_plural = "Ulasan Produk"
        ordering = ['-created_at']
        unique_together = ('product', 'user')  # Satu user hanya bisa memberikan satu review per produk
        
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating} bintang)"

class ProductVariant(models.Model):
    VARIANT_TYPE_CHOICES = (
        ('color', 'Warna'),
        ('size', 'Ukuran'),
        ('material', 'Bahan'),
        ('style', 'Gaya'),
        ('other', 'Lainnya'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    variant_type = models.CharField(max_length=20, choices=VARIANT_TYPE_CHOICES, default='color')
    name = models.CharField(max_length=100, verbose_name="Nama Variasi")
    value = models.CharField(max_length=100, verbose_name="Nilai Variasi")
    color_code = models.CharField(max_length=50, null=True, blank=True, 
                                 verbose_name="Kode Warna (hex)", 
                                 help_text="Contoh: #FF5733 (hanya untuk variant_type='color')")
    image = models.ImageField(upload_to='product_variants/', null=True, blank=True)
    price_adjustment = models.IntegerField(default=0, 
                                          verbose_name="Penyesuaian Harga", 
                                          help_text="Tambahan harga untuk varian ini (bisa negatif untuk diskon)")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stok Varian")
    is_default = models.BooleanField(default=False, verbose_name="Varian Default")
    
    class Meta:
        verbose_name = "Varian Produk"
        verbose_name_plural = "Varian Produk"
        ordering = ['variant_type', 'name']
        
    def __str__(self):
        return f"{self.product.name} - {self.get_variant_type_display()}: {self.name}"
        
    @property
    def get_adjusted_price(self):
        """Menghitung harga produk setelah penyesuaian."""
        base_price = self.product.get_discount_price  # Ambil harga dasar setelah diskon
        return base_price + self.price_adjustment
        
    @property
    def format_adjusted_price(self):
        """Format harga yang sudah disesuaikan dalam Rupiah."""
        try:
            adjusted_price = self.get_adjusted_price
            return f"Rp{adjusted_price:,}".replace(',', '.')
        except (ValueError, TypeError):
            return "Rp0"
            
    @property
    def imageURL(self):
        try:
            return self.image.url
        except:
            # Jika tidak ada gambar varian, gunakan gambar produk
            return self.product.imageURL

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    date_ordered = models.DateTimeField(auto_now_add=True)
    complete = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, null=True)

    def __str__(self):
        return str(self.id)
        
    @property
    def shipping(self):
        shipping = False
        orderitems = self.orderitem_set.all()
        for i in orderitems:
            if i.product.digital == False:
                shipping = True
        return shipping

    @property
    def get_cart_total(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.get_total for item in orderitems])
        return total 

    @property
    def get_cart_items(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.quantity for item in orderitems])
        return total 


class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True, 
                               verbose_name="Varian Produk")
    quantity = models.IntegerField(default=0, null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)

    @property
    def get_total(self):
        # PERBAIKAN: Check if product exists
        if not self.product:
            return 0
            
        if self.variant:
            total = self.variant.get_adjusted_price * self.quantity
        else:
            total = self.product.get_discount_price * self.quantity
        return total

    def __str__(self):
        # PERBAIKAN: Handle None product
        if not self.product:
            return f"Deleted Product x {self.quantity}"
            
        variant_info = f" ({self.variant.name})" if self.variant else ""
        return f"{self.product.name}{variant_info} x {self.quantity}"

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

class ShippingAddress(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=200, null=False)
    city = models.CharField(max_length=200, null=False)
    state = models.CharField(max_length=200, null=False)
    zipcode = models.CharField(max_length=200, null=False)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.address

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Menunggu Pembayaran'),
        ('settlement', 'Pembayaran Berhasil'),
        ('success', 'Sukses'),
        ('deny', 'Ditolak'),
        ('canceled', 'Dibatalkan'),
        ('challenge', 'Tantangan'),
        ('failed', 'Gagal'),
        ('expired', 'Kadaluarsa'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="transaction")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    payment_response = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_method = models.CharField(max_length=100, null=True, blank=True, verbose_name="Metode Pembayaran")
    
    class Meta:
        verbose_name = "Transaksi"
        verbose_name_plural = "Transaksi"
        ordering = ['-created_at']

    def __str__(self):
        return f"Transaction {self.transaction_id} - {self.status}"
    
    @property
    def get_status_display_class(self):
        """Mendapatkan kelas CSS berdasarkan status transaksi."""
        status_classes = {
            'pending': 'bg-warning',
            'settlement': 'bg-success',
            'success': 'bg-success',
            'deny': 'bg-danger',
            'canceled': 'bg-danger',
            'challenge': 'bg-warning',
            'failed': 'bg-danger',
            'expired': 'bg-secondary',
        }
        return status_classes.get(self.status, 'bg-secondary')

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    avatar = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

    @property
    def avatarURL(self):
        """Return the URL of the avatar or a default image"""
        try:
            url = self.avatar.url
        except:
            url = '/static/images/default-avatar.png'  # Pastikan file default ada di static
        return url