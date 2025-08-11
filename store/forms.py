# forms.py
from django import forms
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['phone', 'address', 'avatar', 'bio']
        widgets = {
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Contoh: +6281234567890'
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Alamat lengkap Anda'
            }),
            'bio': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Ceritakan sedikit tentang Anda'
            }),
            'avatar': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            })
        }

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if phone:
            # Menghapus semua karakter non-digit
            phone = ''.join(filter(str.isdigit, phone))
            
            # Validasi format nomor Indonesia
            if not phone.startswith(('62', '0')):
                raise forms.ValidationError('Nomor telepon harus diawali dengan 62 atau 0')
            
            # Validasi panjang nomor
            if len(phone) < 10 or len(phone) > 13:
                raise forms.ValidationError('Nomor telepon harus antara 10-13 digit')
            
            # Format nomor ke format standar
            if phone.startswith('0'):
                phone = '62' + phone[1:]
                
            return phone
        return None

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control'
            })
        }