from django.contrib import admin
from .models import *


# Product Variant Inline
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

# Product Review Inline
class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ['user', 'rating', 'review_text', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj):
        return False

# Product Admin with improved display
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'format_discount_price', 'kategori', 'stock', 'stock_status', 'is_featured', 'is_new')
    list_filter = ('kategori', 'stock_status', 'is_featured', 'is_new')
    search_fields = ('name', 'description', 'sku')
    readonly_fields = ('created_at', 'updated_at', 'sales_count', 'rating', 'review_count')
    fieldsets = (
        ('Informasi Dasar', {
            'fields': ('name', 'slug', 'description', 'kategori', 'sku')
        }),
        ('Harga & Stok', {
            'fields': ('price', 'discount_percent', 'stock', 'stock_status', 'sales_count')
        }),
        ('Gambar Produk', {
            'fields': ('image', 'image_2', 'image_3', 'image_4')
        }),
        ('Detail Produk', {
            'fields': ('digital', 'features', 'specifications', 'weight', 'dimensions')
        }),
        ('Rating & Review', {
            'fields': ('rating', 'review_count')
        }),
        ('Metadata', {
            'fields': ('is_featured', 'is_new', 'created_at', 'updated_at')
        }),
    )
    inlines = [ProductVariantInline, ProductReviewInline]
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'get_products_count')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at', 'is_verified_purchase')
    list_filter = ('rating', 'is_verified_purchase', 'created_at')
    search_fields = ('product__name', 'user__username', 'review_text')
    readonly_fields = ('created_at',)

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'variant_type', 'name', 'value', 'price_adjustment', 'stock', 'is_default')
    list_filter = ('variant_type', 'is_default')
    search_fields = ('product__name', 'name', 'value')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'user', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('transaction_id', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'payment_response')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'date_ordered', 'complete', 'get_cart_total', 'get_cart_items')
    list_filter = ('complete', 'date_ordered')
    search_fields = ('customer__name', 'customer__email', 'id')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'variant', 'order', 'quantity', 'get_total')
    list_filter = ('order__complete', 'date_added')
    search_fields = ('product__name', 'order__id')

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ('customer', 'order', 'address', 'city', 'state', 'zipcode')
    list_filter = ('state', 'city')
    search_fields = ('address', 'city', 'customer__name')

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'address', 'updated_at')
    search_fields = ('user__username', 'phone', 'address')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'user')
    search_fields = ('name', 'email', 'user__username')

admin.site.register(UserProfile, UserProfileAdmin)