from django import template
import locale

register = template.Library()

@register.filter(name='multiply')
def multiply(value, arg):
    """Multiply the arg by the value."""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return ''

@register.filter(name='rupiah_format')
def rupiah_format(value):
    """Format nilai ke format Rupiah (Rp XX.XXX)."""
    try:
        locale.setlocale(locale.LC_ALL, 'id_ID.UTF-8')
        return locale.format_string("Rp %d", int(value), grouping=True)
    except (ValueError, TypeError, locale.Error):
        # Jika locale tidak tersedia, gunakan format manual
        try:
            value = int(value)
            formatted = f"Rp{value:,}".replace(',', '.')
            return formatted
        except (ValueError, TypeError):
            return "Rp0"