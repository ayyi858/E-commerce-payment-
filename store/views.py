from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.urls import reverse
from django.core.paginator import Paginator
from django.db.models import Q
import json
import datetime
import time
import midtransclient
from .models import *
from .utils import cookieCart, cartData, guestOrder
from .forms import UserProfileForm, UserUpdateForm
from django.db.models import Q, Avg
from django.utils import timezone

def store(request):
    data = cartData(request)
    cartItems = data['cartItems']
    
    # Get search query
    search_query = request.GET.get('search', '')
    
    # Get category filter
    category = request.GET.get('category', None)
    
    # Start with all products
    products_list = Product.objects.all()
    
    # Apply search filter if provided
    if search_query:
        products_list = products_list.filter(
            Q(name__icontains=search_query) | 
            Q(kategori__icontains=search_query)
        )
    
    # Apply category filter if specified
    if category and category != 'Semua':
        products_list = products_list.filter(kategori=category)
    
    # Pagination - 12 products per page
    paginator = Paginator(products_list, 12)
    page_number = request.GET.get('page', 1)
    products = paginator.get_page(page_number)
    
    # Get all unique categories for the filter dropdown
    categories = Product.objects.values_list('kategori', flat=True).distinct()
    
    context = {
        'products': products, 
        'cartItems': cartItems,
        'categories': categories,
        'selected_category': category or 'Semua'
    }
    return render(request, 'store/store.html', context)

def product_detail(request, product_id):
    """
    View untuk menampilkan detail produk.
    """
    # Ambil data produk berdasarkan ID
    product = get_object_or_404(Product, id=product_id)
    
    # Ambil data keranjang
    data = cartData(request)
    cartItems = data['cartItems']
    
    # Dapatkan produk terkait (dari kategori yang sama)
    related_products = Product.objects.filter(
        kategori=product.kategori
    ).exclude(id=product.id)[:4]  # Ambil maksimal 4 produk terkait
    
    # Siapkan context untuk template
    context = {
        'product': product,
        'cartItems': cartItems,
        'related_products': related_products
    }
    
    return render(request, 'store/product_detail.html', context)

@login_required
def add_review(request, product_id):
    """
    View untuk menambahkan ulasan produk.
    """
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'POST':
        rating = int(request.POST.get('rating', 5))
        review_text = request.POST.get('review_text', '')
        
        # Periksa apakah pengguna sudah memberikan ulasan sebelumnya
        existing_review = ProductReview.objects.filter(product=product, user=request.user).first()
        
        if existing_review:
            # Perbarui ulasan yang sudah ada
            existing_review.rating = rating
            existing_review.review_text = review_text
            existing_review.save()
            messages.success(request, 'Ulasan Anda berhasil diperbarui.')
        else:
            # Buat ulasan baru
            # Periksa apakah pengguna pernah membeli produk ini
            is_verified = OrderItem.objects.filter(
                order__customer=request.user.customer,
                order__complete=True,
                product=product
            ).exists()
            
            ProductReview.objects.create(
                product=product,
                user=request.user,
                rating=rating,
                review_text=review_text,
                is_verified_purchase=is_verified
            )
            messages.success(request, 'Terima kasih atas ulasan Anda.')
            
            # Perbarui rating produk
            product_reviews = ProductReview.objects.filter(product=product)
            product.rating = product_reviews.aggregate(Avg('rating'))['rating__avg']
            product.review_count = product_reviews.count()
            product.save()
    
    # Redirect kembali ke halaman detail produk
    return redirect('product_detail', product_id=product_id)

def cart(request):
    data = cartData(request)
    cartItems = data['cartItems']
    order = data['order']
    items = data['items']

    context = {'items':items, 'order':order, 'cartItems':cartItems}
    return render(request, 'store/cart.html', context)

def checkout(request):
    data = cartData(request)
    cartItems = data['cartItems']
    order = data['order']
    items = data['items']

    # Calculate total in IDR (Rupiah)
    if isinstance(items, list):  # For non-authenticated users (cookie data)
        total_amount = sum([item.get('get_total', 0) for item in items])
    else:  # For authenticated users (database data)
        total_amount = sum([item.get_total for item in items])

    # Generate unique order ID
    unique_order_id = f"ORDER-{order.id if hasattr(order, 'id') else int(time.time())}"

    # Prepare context for checkout page
    context = {
        'items': items,
        'order': order,
        'cartItems': cartItems,
        'MIDTRANS_CLIENT_KEY': settings.MIDTRANS_CLIENT_KEY,
        'MERCHANT_ID': settings.MIDTRANS_MERCHANT_ID,
        'ORDER_ID': unique_order_id,
        'TOTAL_AMOUNT': total_amount
    }
    
    return render(request, 'store/checkout.html', context)

# GANTI function updateItem di views.py dengan ini:

def updateItem(request):
    try:
        data = json.loads(request.body)
        productId = data['productId']
        action = data['action']
        print('Action:', action)
        print('Product:', productId)

        # Pastikan user sudah login
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        customer = request.user.customer
        product = Product.objects.get(id=productId)
        order, created = Order.objects.get_or_create(customer=customer, complete=False)

        # PERBAIKAN: Handle multiple OrderItems yang mungkin ada
        # Cari semua OrderItem yang ada untuk order dan product ini
        existing_items = OrderItem.objects.filter(order=order, product=product)
        
        if existing_items.count() > 1:
            # Jika ada lebih dari 1, gabungkan quantity dan hapus sisanya
            total_quantity = sum(item.quantity for item in existing_items)
            
            # Hapus semua existing items
            existing_items.delete()
            
            # Buat item baru dengan total quantity
            orderItem = OrderItem.objects.create(
                order=order, 
                product=product, 
                quantity=total_quantity
            )
        elif existing_items.count() == 1:
            # Jika hanya ada 1, gunakan yang ada
            orderItem = existing_items.first()
        else:
            # Jika tidak ada, buat baru
            orderItem = OrderItem.objects.create(
                order=order, 
                product=product, 
                quantity=0
            )

        # Update quantity berdasarkan action
        if action == 'add':
            orderItem.quantity += 1
        elif action == 'remove':
            orderItem.quantity -= 1

        # Simpan perubahan
        orderItem.save()

        # Hapus item jika quantity <= 0
        if orderItem.quantity <= 0:
            orderItem.delete()
            return JsonResponse({
                'message': 'Item removed from cart',
                'cartItems': order.get_cart_items,
                'cartTotal': float(order.get_cart_total)
            })

        return JsonResponse({
            'message': 'Item updated successfully',
            'quantity': orderItem.quantity,
            'cartItems': order.get_cart_items,
            'cartTotal': float(order.get_cart_total)
        })

    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except Customer.DoesNotExist:
        return JsonResponse({'error': 'Customer profile not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        print(f"Error in updateItem: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)
    
def processOrder(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = json.loads(request.body)

    if request.user.is_authenticated:
        customer = request.user.customer
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
    else:
        customer, order = guestOrder(request, data)

    total = float(data['form']['total'])
    order.transaction_id = transaction_id

    # Check if payment was successful (if payment_result exists)
    payment_result = data.get('payment_result', None)
    if payment_result:
        # Update transaction status in database
        try:
            transaction = Transaction.objects.get(order=order)
            transaction.status = payment_result.get('transaction_status', 'settlement')
            transaction.payment_response = payment_result
            transaction.save()
        except Transaction.DoesNotExist:
            pass  # Transaction not found, may have been created via create_transaction

    # Mark order as complete
    if total == float(order.get_cart_total):
        order.complete = True
    order.save()

    if order.shipping == True:
        ShippingAddress.objects.create(
        customer=customer,
        order=order,
        address=data['shipping']['address'],
        city=data['shipping']['city'],
        state=data['shipping']['state'],
        zipcode=data['shipping']['zipcode'],
        )

    return JsonResponse('Payment submitted..', safe=False)

def login_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'Selamat datang, {user.username}!')
            return redirect('store')
        else:
            messages.error(request, 'Username atau password salah.')
    return render(request, 'store/login.html')

def logout_user(request):
    logout(request)
    messages.success(request, 'Anda berhasil logout.')
    return redirect('login')

def register_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username sudah digunakan.')
        else:
            User.objects.create_user(username=username, email=email, password=password)
            messages.success(request, 'Registrasi berhasil, silakan login.')
            return redirect('login')
    return render(request, 'store/register.html')

# Fix untuk views.py - create_transaction function

import uuid
import time
from datetime import datetime

@csrf_exempt
def create_transaction(request):
    if request.method == 'POST':
        try:
            # Parse request body
            body = json.loads(request.body)

            # Midtrans configuration
            snap = midtransclient.Snap(
                is_production=settings.MIDTRANS_IS_PRODUCTION,
                server_key=settings.MIDTRANS_SERVER_KEY,
                client_key=settings.MIDTRANS_CLIENT_KEY,
            )

            # Generate UNIQUE order ID dengan timestamp dan random
            timestamp = int(time.time())
            random_str = str(uuid.uuid4())[:8]
            order_id = f"ORDER-{timestamp}-{random_str}"
            
            print(f"Generated Order ID: {order_id}")  # Debug log
            
            # Ambil detail pengiriman
            shipping_details = body.get('shipping', {})
            
            # Transaction details
            transaction_data = {
                "transaction_details": {
                    "order_id": order_id,
                    "gross_amount": int(body.get('gross_amount', 10000)),
                },
                "customer_details": {
                    "first_name": body.get('first_name', request.user.username if request.user.is_authenticated else "Guest"),
                    "email": body.get('email', request.user.email if request.user.is_authenticated else "guest@example.com"),
                    "phone": body.get('phone', "081234567890"),
                    "billing_address": {
                        "first_name": body.get('first_name', request.user.username if request.user.is_authenticated else "Guest"),
                        "email": body.get('email', request.user.email if request.user.is_authenticated else "guest@example.com"),
                        "phone": body.get('phone', "081234567890"),
                        "address": shipping_details.get('address', 'Alamat Default'),
                        "city": shipping_details.get('city', 'Jakarta'),
                        "postal_code": shipping_details.get('zipcode', '12345'),
                        "country_code": "IDN"
                    },
                    "shipping_address": {
                        "first_name": body.get('first_name', request.user.username if request.user.is_authenticated else "Guest"),
                        "email": body.get('email', request.user.email if request.user.is_authenticated else "guest@example.com"),
                        "phone": body.get('phone', "081234567890"),
                        "address": shipping_details.get('address', 'Alamat Default'),
                        "city": shipping_details.get('city', 'Jakarta'),
                        "postal_code": shipping_details.get('zipcode', '12345'),
                        "country_code": "IDN"
                    }
                },
                "credit_card": {
                    "secure": True
                },
                # URL untuk redirect setelah pembayaran selesai
                "callbacks": {
                    "finish": request.build_absolute_uri(reverse('payment_success')) + f"?order_id={order_id}",
                    "error": request.build_absolute_uri(reverse('payment_error')) + f"?order_id={order_id}",
                    "pending": request.build_absolute_uri(reverse('payment_pending')) + f"?order_id={order_id}"
                },
                # Set ke false untuk menggunakan redirect alih-alih popup
                "enable_redirect": True
            }

            print(f"Transaction data: {transaction_data}")  # Debug log

            # Create Snap Transaction
            snap_response = snap.create_transaction(transaction_data)
            print(f"Midtrans response: {snap_response}")  # Debug log
            
            # Save transaction to database
            if request.user.is_authenticated:
                try:
                    # Ambil atau buat order baru
                    customer = request.user.customer
                    order, created = Order.objects.get_or_create(
                        customer=customer, 
                        complete=False,
                        defaults={
                            'transaction_id': order_id
                        }
                    )
                    
                    # Update transaction_id jika order sudah ada tapi belum ada transaction_id
                    if not created and not order.transaction_id:
                        order.transaction_id = order_id
                        order.save()
                    
                    # Cek apakah transaction sudah ada untuk order ini
                    transaction, tx_created = Transaction.objects.get_or_create(
                        order=order,
                        defaults={
                            'user': request.user,
                            'transaction_id': order_id,
                            'amount': transaction_data["transaction_details"]["gross_amount"],
                            'status': "pending",
                            'payment_response': snap_response
                        }
                    )
                    
                    if not tx_created:
                        # Update existing transaction
                        transaction.transaction_id = order_id
                        transaction.amount = transaction_data["transaction_details"]["gross_amount"]
                        transaction.status = "pending"
                        transaction.payment_response = snap_response
                        transaction.save()
                    
                    # Simpan alamat pengiriman jika belum ada
                    if order.shipping and not ShippingAddress.objects.filter(order=order).exists():
                        ShippingAddress.objects.create(
                            customer=customer,
                            order=order,
                            address=shipping_details.get('address', 'Alamat Default'),
                            city=shipping_details.get('city', 'Jakarta'),
                            state=shipping_details.get('state', 'DKI Jakarta'),
                            zipcode=shipping_details.get('zipcode', '12345')
                        )
                        
                except Exception as tx_error:
                    print(f"Error saving transaction to database: {str(tx_error)}")
                    # Continue even if saving to DB fails
            
            # Return Snap Token and redirect URL
            return JsonResponse({
                "token": snap_response['token'],
                "redirect_url": snap_response['redirect_url'],
                "order_id": order_id  # Return order_id untuk referensi
            })

        except Exception as e:
            print(f"Error creating transaction: {str(e)}")
            
            # Return lebih detail error untuk debugging
            return JsonResponse({
                "error": str(e),
                "error_type": type(e).__name__,
                "timestamp": datetime.now().isoformat()
            }, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

@login_required
def profil_user(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'store/profil.html', {'profile': profile})

@login_required
def edit_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profil berhasil diperbarui!')
            return redirect('profil')
        else:
            messages.error(request, 'Terjadi kesalahan. Silakan periksa form anda.')
    else:
        form = UserProfileForm(instance=profile)

    context = {
        'form': form,
        'profile': profile
    }
    return render(request, 'store/edit_profile.html', context)

# Callback handler untuk Midtrans
def payment_success(request):
    # Proses order berhasil
    order_id = request.GET.get('order_id', '')
    try:
        transaction = Transaction.objects.get(transaction_id=order_id)
        transaction.status = 'settlement'
        transaction.save()
        
        # Update order status
        order = transaction.order
        order.complete = True
        order.save()
        
        messages.success(request, "Pembayaran berhasil! Terima kasih atas pesanan Anda.")
    except Transaction.DoesNotExist:
        messages.warning(request, "Pesanan tidak ditemukan, tapi pembayaran berhasil diproses.")
    
    return redirect('payment_confirmation')

def payment_error(request):
    order_id = request.GET.get('order_id', '')
    try:
        transaction = Transaction.objects.get(transaction_id=order_id)
        transaction.status = 'failed'
        transaction.save()
    except Transaction.DoesNotExist:
        pass
        
    messages.error(request, "Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.")
    return redirect('cart')

def payment_pending(request):
    order_id = request.GET.get('order_id', '')
    try:
        transaction = Transaction.objects.get(transaction_id=order_id)
        transaction.status = 'pending'
        transaction.save()
        
        messages.info(request, "Pembayaran Anda sedang diproses. Kami akan memberi tahu Anda setelah pembayaran dikonfirmasi.")
    except Transaction.DoesNotExist:
        messages.warning(request, "Pesanan tidak ditemukan, tapi pembayaran sedang diproses.")
    
    return redirect('payment_confirmation')

def payment_confirmation(request):
    """Halaman konfirmasi setelah pembayaran"""
    if request.user.is_authenticated:
        # Ambil transaksi terbaru dari user
        transaction = Transaction.objects.filter(user=request.user).order_by('-created_at').first()
        orders = Order.objects.filter(customer=request.user.customer, complete=True).order_by('-date_ordered')
        context = {
            'transaction': transaction,
            'orders': orders
        }
    else:
        context = {}
    
    return render(request, 'store/payment_confirmation.html', context)

# Webhook untuk notifikasi Midtrans
@csrf_exempt
def midtrans_notification_handler(request):
    if request.method == 'POST':
        try:
            # Inisialisasi Midtrans Core API
            core_api = midtransclient.CoreApi(
                is_production=settings.MIDTRANS_IS_PRODUCTION,
                server_key=settings.MIDTRANS_SERVER_KEY,
                client_key=settings.MIDTRANS_CLIENT_KEY
            )
            
            # Parse JSON dari request body
            notification_body = json.loads(request.body)
            
            # Verifikasi notifikasi dari Midtrans
            transaction_status_response = core_api.transactions.notification(notification_body)
            
            # Ambil informasi penting
            order_id = transaction_status_response.get('order_id')
            transaction_status = transaction_status_response.get('transaction_status')
            fraud_status = transaction_status_response.get('fraud_status')
            
            # Update status transaksi
            try:
                transaction = Transaction.objects.get(transaction_id=order_id)
                
                # Perbarui status berdasarkan notifikasi Midtrans
                if transaction_status == 'capture':
                    if fraud_status == 'challenge':
                        transaction.status = 'challenge'
                    else:
                        transaction.status = 'success'
                        # Update order juga
                        transaction.order.complete = True
                        transaction.order.save()
                elif transaction_status == 'settlement':
                    transaction.status = 'settlement'
                    # Update order juga
                    transaction.order.complete = True
                    transaction.order.save()
                elif transaction_status == 'deny':
                    transaction.status = 'deny'
                elif transaction_status == 'cancel' or transaction_status == 'expire':
                    transaction.status = 'canceled'
                elif transaction_status == 'pending':
                    transaction.status = 'pending'
                    
                # Simpan response lengkap
                transaction.payment_response = transaction_status_response
                transaction.save()
                
                return JsonResponse({'status': 'OK'})
                
            except Transaction.DoesNotExist:
                return JsonResponse({'status': 'Transaction not found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
            
    return JsonResponse({'status': 'Method not allowed'}, status=405)

@login_required
def order_detail(request, order_id):
    """View untuk menampilkan detail pesanan."""
    order = get_object_or_404(Order, id=order_id, customer=request.user.customer)
    
    # Periksa apakah ada transaksi terkait
    try:
        transaction = Transaction.objects.get(order=order)
    except Transaction.DoesNotExist:
        transaction = None
    
    # Dapatkan alamat pengiriman
    try:
        shipping = ShippingAddress.objects.get(order=order)
    except ShippingAddress.DoesNotExist:
        shipping = None
    
    context = {
        'order': order,
        'items': order.orderitem_set.all(),
        'transaction': transaction,
        'shipping': shipping
    }
    return render(request, 'store/order_detail.html', context)

def category_list(request):
    """View untuk menampilkan daftar kategori."""
    categories = Category.objects.filter(is_active=True, parent=None)
    
    # Ambil data keranjang
    data = cartData(request)
    cartItems = data['cartItems']
    
    context = {
        'categories': categories,
        'cartItems': cartItems
    }
    return render(request, 'store/category_list.html', context)

def category_detail(request, slug):
    """View untuk menampilkan produk dalam kategori tertentu."""
    category = get_object_or_404(Category, slug=slug, is_active=True)
    
    # Dapatkan produk dari kategori ini dan subkategorinya
    products_list = Product.objects.filter(kategori=category.name)
    
    # Jika kategori memiliki anak, tambahkan produk mereka juga
    for child in category.children.filter(is_active=True):
        child_products = Product.objects.filter(kategori=child.name)
        products_list = products_list | child_products
    
    # Pagination - 12 products per page
    paginator = Paginator(products_list, 12)
    page_number = request.GET.get('page', 1)
    products = paginator.get_page(page_number)
    
    # Ambil data keranjang
    data = cartData(request)
    cartItems = data['cartItems']
    
    context = {
        'category': category,
        'products': products,
        'cartItems': cartItems
    }
    return render(request, 'store/category_detail.html', context)