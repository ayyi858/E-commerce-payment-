from django.urls import path
from . import views
from django.views.generic import TemplateView

urlpatterns = [
    # Authentication routes
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('register/', views.register_user, name='register'),
    
    # User profile routes
    path('profil/', views.profil_user, name='profil'),
    path('profil/edit/', views.edit_profile, name='edit_profile'),
    path('profil/orders/<int:order_id>/', views.order_detail, name='order_detail'),

    # Store, cart and checkout routes
    path('', views.store, name="store"),
    path('cart/', views.cart, name="cart"),
    path('checkout/', views.checkout, name="checkout"),
   path('checkout-page/', TemplateView.as_view(template_name="checkout.html"), name='checkout_page'),
    
    # Product routes
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    path('product/<int:product_id>/review/', views.add_review, name='add_review'),
    
    # Category routes
    path('categories/', views.category_list, name='category_list'),
    path('category/<slug:slug>/', views.category_detail, name='category_detail'),
    
    # API endpoints
    path('create-transaction/', views.create_transaction, name='create_transaction'),
    path('update_item/', views.updateItem, name="update_item"),
    path('process_order/', views.processOrder, name="process_order"),
    
    # Payment callback routes
    path('payment/success/', views.payment_success, name='payment_success'),
    path('payment/error/', views.payment_error, name='payment_error'),
    path('payment/pending/', views.payment_pending, name='payment_pending'),
    path('payment/confirmation/', views.payment_confirmation, name='payment_confirmation'),
    
    # Midtrans webhook
    path('midtrans-notification/', views.midtrans_notification_handler, name='midtrans_notification'),
]