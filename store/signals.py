from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Customer, UserProfile

@receiver(post_save, sender=User)
def create_user_profile_and_customer(sender, instance, created, **kwargs):
    if created:
        Customer.objects.create(user=instance)
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()