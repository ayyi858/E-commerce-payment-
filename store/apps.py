from django.apps import AppConfig

class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'

    def ready(self):
        import store.signals  # Memastikan signals aktif
        try:
            import store.templatetags.custom_filters  # Memastikan custom filter terdaftar
        except ImportError:
            pass  # Abaikan jika belum ada