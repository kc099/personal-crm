from django.contrib import admin
from django.contrib import admin
from .models import BayDetail, DailyRecord, SectionData, ShiftData, ShiftConfig, ShiftBaselines

admin.site.register(BayDetail)
admin.site.register(DailyRecord)
admin.site.register(SectionData)
admin.site.register(ShiftData)
admin.site.register(ShiftConfig)
admin.site.register(ShiftBaselines)

# Register your models here.
